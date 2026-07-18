<?php

namespace App\Repositories\PublicApi;

use App\Models\AssetHistory;
use App\Models\Product;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class PublicPreviewRepository implements PublicPreviewRepositoryInterface
{
    /**
     * @var list<string>
     */
    private const PRODUCT_SELECT_COLUMNS = [
        'id',
        'no_asset',
        'no_serial',
        'no_equipment',
        'tipe',
        'tahun_pembuatan',
        'usage_date',
        'pengguna',
        'computer_name',
        'plant',
        'usage_record',
        'keterangan',
        'status',
        'created_at',
        'updated_at',
    ];

    /**
     * @return array<string, mixed>
     */
    public function getDashboardPreview(): array
    {
        $summary = Product::query()
            ->selectRaw('COUNT(*) as total_asset')
            ->selectRaw("SUM(CASE WHEN status = 'Aktif' THEN 1 ELSE 0 END) as total_asset_active")
            ->selectRaw("SUM(CASE WHEN status IN ('Maintenance', 'Rusak') THEN 1 ELSE 0 END) as total_asset_maintenance")
            ->selectRaw("SUM(CASE WHEN status = 'Disposal' THEN 1 ELSE 0 END) as total_asset_disposal")
            ->first();

        $assetPerPlant = Product::query()
            ->selectRaw("COALESCE(NULLIF(plant, ''), 'Tidak Ada') as name")
            ->selectRaw('COUNT(*) as total')
            ->groupBy('name')
            ->orderByDesc('total')
            ->get();

        $assetPerCategory = Product::query()
            ->selectRaw("COALESCE(NULLIF(tipe, ''), 'Tidak Ada') as name")
            ->selectRaw('COUNT(*) as total')
            ->groupBy('name')
            ->orderByDesc('total')
            ->get();

        $assetCondition = collect();

        $assetProcurementMonthly = Product::query()
            ->select(['id', 'created_at'])
            ->whereNotNull('created_at')
            ->orderBy('created_at')
            ->get()
            ->groupBy(static function (Product $product): string {
                return $product->created_at?->format('Y-m') ?? 'unknown';
            })
            ->map(static fn (Collection $products, string $month): array => [
                'month' => $month,
                'total' => $products->count(),
            ])
            ->values();

        $recentActivity = AssetHistory::query()
            ->with([
                'product:id,no_asset,no_serial,tipe,status',
                'user:id,name',
            ])
            ->select([
                'id',
                'product_id',
                'user_id',
                'action',
                'description',
                'created_at',
            ])
            ->latest('id')
            ->limit(10)
            ->get();

        $latestAssets = Product::query()
            ->select(self::PRODUCT_SELECT_COLUMNS)
            ->withCount('histories')
            ->latest('id')
            ->limit(10)
            ->get();

        return [
            'summary' => [
                'total_asset' => (int) ($summary?->total_asset ?? 0),
                'total_asset_active' => (int) ($summary?->total_asset_active ?? 0),
                'total_asset_maintenance' => (int) ($summary?->total_asset_maintenance ?? 0),
                'total_asset_disposal' => (int) ($summary?->total_asset_disposal ?? 0),
                'total_user' => User::query()->count(),
                'total_plant' => $this->countDistinctNonEmpty('plant'),
                'total_category' => $this->countDistinctNonEmpty('tipe'),
                'total_vendor' => 0,
                'total_brand' => 0,
                'total_location' => 0,
            ],
            'charts' => [
                'asset_per_plant' => $assetPerPlant->map(fn ($row): array => [
                    'name' => (string) $row->name,
                    'total' => (int) $row->total,
                ])->values()->all(),
                'asset_per_category' => $assetPerCategory->map(fn ($row): array => [
                    'name' => (string) $row->name,
                    'total' => (int) $row->total,
                ])->values()->all(),
                'asset_condition' => $assetCondition->values()->all(),
                'asset_procurement_monthly' => $assetProcurementMonthly->all(),
            ],
            'recent_activity' => $recentActivity,
            'latest_asset' => $latestAssets,
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateAssets(array $filters): LengthAwarePaginator
    {
        $query = Product::query()
            ->select(self::PRODUCT_SELECT_COLUMNS)
            ->withCount('histories');

        $this->applyAssetFilters($query, $filters);
        $this->applyAssetSorting($query, $filters['sort'] ?? null);

        return $query
            ->paginate((int) ($filters['per_page'] ?? 10))
            ->withQueryString();
    }

    public function getLookupValues(string $type): Collection
    {
        return match ($type) {
            'categories' => $this->buildDistinctLookup('tipe'),
            'plants' => $this->buildDistinctLookup('plant'),
            'status' => $this->buildDistinctLookup('status'),
            'brands', 'locations', 'conditions' => collect(),
            default => collect(),
        };
    }

    /**
     * @return array<string, mixed>
     */
    public function search(string $query, int $limit): array
    {
        $assets = Product::query()
            ->select(self::PRODUCT_SELECT_COLUMNS)
            ->withCount('histories')
            ->where(function (Builder $builder) use ($query): void {
                $builder
                    ->where('no_asset', 'like', "%{$query}%")
                    ->orWhere('no_serial', 'like', "%{$query}%")
                    ->orWhere('no_equipment', 'like', "%{$query}%")
                    ->orWhere('tipe', 'like', "%{$query}%")
                    ->orWhere('plant', 'like', "%{$query}%")
                    ->orWhere('pengguna', 'like', "%{$query}%")
                    ->orWhere('keterangan', 'like', "%{$query}%");
            })
            ->latest('id')
            ->limit($limit)
            ->get();

        return [
            'query' => $query,
            'assets' => $assets,
            'categories' => $this->buildDistinctLookup('tipe', $query, $limit),
            'plants' => $this->buildDistinctLookup('plant', $query, $limit),
            'brands' => collect(),
            'vendors' => collect(),
            'locations' => collect(),
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function applyAssetFilters(Builder $query, array $filters): void
    {
        $query
            ->when($filters['search'] ?? null, function (Builder $builder, string $search): void {
                $builder->where(function (Builder $nested) use ($search): void {
                    $nested
                        ->where('no_asset', 'like', "%{$search}%")
                        ->orWhere('no_serial', 'like', "%{$search}%")
                        ->orWhere('no_equipment', 'like', "%{$search}%")
                        ->orWhere('tipe', 'like', "%{$search}%")
                        ->orWhere('pengguna', 'like', "%{$search}%")
                        ->orWhere('computer_name', 'like', "%{$search}%")
                        ->orWhere('plant', 'like', "%{$search}%")
                        ->orWhere('usage_record', 'like', "%{$search}%")
                        ->orWhere('keterangan', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%");
                });
            })
            ->when($filters['asset_name'] ?? null, fn (Builder $builder, string $value) => $builder->where('tipe', 'like', "%{$value}%"))
            ->when($filters['asset_code'] ?? null, fn (Builder $builder, string $value) => $builder->where('no_asset', 'like', "%{$value}%"))
            ->when($filters['serial_number'] ?? null, fn (Builder $builder, string $value) => $builder->where('no_serial', 'like', "%{$value}%"))
            ->when($filters['specification'] ?? null, fn (Builder $builder, string $value) => $builder->where('keterangan', 'like', "%{$value}%"))
            ->when($filters['plant'] ?? null, fn (Builder $builder, string $value) => $builder->where('plant', $value))
            ->when($filters['category'] ?? null, fn (Builder $builder, string $value) => $builder->where('tipe', $value))
            ->when($filters['status'] ?? null, fn (Builder $builder, string $value) => $builder->where('status', $value))
            ->when($filters['year'] ?? null, fn (Builder $builder, string $value) => $builder->where('tahun_pembuatan', 'like', "%{$value}%"))
            ->when($filters['purchase_date'] ?? null, fn (Builder $builder, string $value) => $builder->where('usage_date', 'like', "%{$value}%"))
            ->when(array_key_exists('disposal', $filters) && $filters['disposal'] !== null, function (Builder $builder) use ($filters): void {
                if ((bool) $filters['disposal'] === true) {
                    $builder->where('status', 'Disposal');

                    return;
                }

                $builder->where('status', '!=', 'Disposal');
            });
    }

    private function applyAssetSorting(Builder $query, ?string $sort): void
    {
        match ($sort) {
            'oldest' => $query->oldest('id'),
            'asset_name' => $query->orderBy('tipe')->orderByDesc('id'),
            'category' => $query->orderBy('tipe')->orderByDesc('id'),
            'plant' => $query->orderBy('plant')->orderByDesc('id'),
            'purchase_date' => $query->orderBy('usage_date')->orderByDesc('id'),
            'warranty' => $query->latest('id'),
            default => $query->latest('id'),
        };
    }

    private function buildDistinctLookup(string $column, ?string $search = null, int $limit = 100): Collection
    {
        return Product::query()
            ->selectRaw("COALESCE(NULLIF({$column}, ''), 'Tidak Ada') as name")
            ->selectRaw('COUNT(*) as total')
            ->when($search, fn (Builder $builder, string $value) => $builder->where($column, 'like', "%{$value}%"))
            ->groupBy('name')
            ->orderBy('name')
            ->limit($limit)
            ->get()
            ->map(fn ($row): array => [
                'name' => (string) $row->name,
                'value' => (string) $row->name,
                'total' => (int) $row->total,
            ])
            ->values();
    }

    private function countDistinctNonEmpty(string $column): int
    {
        return Product::query()
            ->whereNotNull($column)
            ->where($column, '!=', '')
            ->distinct($column)
            ->count($column);
    }
}