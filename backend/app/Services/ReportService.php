<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * @return array<string,mixed>
     */
    public function getReportData(Request $request): array
    {
        $filters = $this->validateFilters($request);
        $baseQuery = $this->buildBaseQuery($filters);

        $summary = $this->buildSummary($baseQuery);
        $plantReport = $this->buildPlantReport($baseQuery);
        $statusReport = $this->buildStatusReport($baseQuery);
        $userReport = $this->buildUserReport($baseQuery);
        $growthReport = $this->buildGrowthReport($baseQuery);
        $inventoryReport = $this->buildInventoryReport($baseQuery);

        return [
            'filters' => $filters,
            'summary' => $summary,
            'plant_report' => $plantReport,
            'status_report' => $statusReport,
            'user_report' => $userReport,
            'growth_report' => $growthReport,
            'inventory_report' => $inventoryReport,
        ];
    }

    /**
     * @return array{search:?string,plant:?string,status:?string,date_from:?string,date_to:?string}
     */
    private function validateFilters(Request $request): array
    {
        /** @var array{search?:string,plant?:string,status?:string,date_from?:string,date_to?:string} $validated */
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:191'],
            'plant' => ['nullable', 'string', 'max:191'],
            'status' => ['nullable', 'string', 'max:191'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
        ]);

        return [
            'search' => $validated['search'] ?? null,
            'plant' => $validated['plant'] ?? null,
            'status' => $validated['status'] ?? null,
            'date_from' => $validated['date_from'] ?? null,
            'date_to' => $validated['date_to'] ?? null,
        ];
    }

    /**
     * @param  array{search:?string,plant:?string,status:?string,date_from:?string,date_to:?string}  $filters
     */
    private function buildBaseQuery(array $filters): Builder
    {
        return Product::query()
            ->when($filters['search'], function (Builder $query, string $search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->where('no_asset', 'like', "%{$search}%")
                        ->orWhere('no_serial', 'like', "%{$search}%")
                        ->orWhere('tipe', 'like', "%{$search}%")
                        ->orWhere('pengguna', 'like', "%{$search}%")
                        ->orWhere('plant', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%");
                });
            })
            ->when($filters['plant'], function (Builder $query, string $plant): void {
                $query->where('plant', $plant);
            })
            ->when($filters['status'], function (Builder $query, string $status): void {
                $query->where('status', $status);
            })
            ->when($filters['date_from'], function (Builder $query, string $dateFrom): void {
                $query->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($filters['date_to'], function (Builder $query, string $dateTo): void {
                $query->whereDate('created_at', '<=', $dateTo);
            });
    }

    private function buildSummary(Builder $baseQuery): array
    {
        $summary = (clone $baseQuery)
            ->selectRaw('COUNT(*) as total_assets')
            ->selectRaw("SUM(CASE WHEN status = 'Aktif' THEN 1 ELSE 0 END) as active_assets")
            ->selectRaw("SUM(CASE WHEN status = 'Disposal' THEN 1 ELSE 0 END) as disposal_assets")
            ->selectRaw("SUM(CASE WHEN status IN ('Maintenance', 'Rusak') THEN 1 ELSE 0 END) as repair_assets")
            ->first();

        return [
            'total_assets' => (int) ($summary?->total_assets ?? 0),
            'active_assets' => (int) ($summary?->active_assets ?? 0),
            'disposal_assets' => (int) ($summary?->disposal_assets ?? 0),
            'repair_assets' => (int) ($summary?->repair_assets ?? 0),
        ];
    }

    /**
     * @return array<int,array{name:string,total:int}>
     */
    private function buildPlantReport(Builder $baseQuery): array
    {
        return (clone $baseQuery)
            ->selectRaw("COALESCE(NULLIF(plant, ''), 'Tidak Ada') as name")
            ->selectRaw('COUNT(*) as total')
            ->groupBy('name')
            ->orderByDesc('total')
            ->get()
            ->map(static fn ($row): array => [
                'name' => (string) $row->name,
                'total' => (int) $row->total,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int,array{name:string,total:int}>
     */
    private function buildStatusReport(Builder $baseQuery): array
    {
        return (clone $baseQuery)
            ->selectRaw("COALESCE(NULLIF(status, ''), 'Tidak Diketahui') as name")
            ->selectRaw('COUNT(*) as total')
            ->groupBy('name')
            ->orderByDesc('total')
            ->get()
            ->map(static fn ($row): array => [
                'name' => (string) $row->name,
                'total' => (int) $row->total,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int,array{name:string,total:int}>
     */
    private function buildUserReport(Builder $baseQuery): array
    {
        return (clone $baseQuery)
            ->selectRaw("COALESCE(NULLIF(pengguna, ''), 'Tidak Ada Pengguna') as name")
            ->selectRaw('COUNT(*) as total')
            ->groupBy('name')
            ->orderByDesc('total')
            ->limit(20)
            ->get()
            ->map(static fn ($row): array => [
                'name' => (string) $row->name,
                'total' => (int) $row->total,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int,array<month:string,total:int>>
     */
    private function buildGrowthReport(Builder $baseQuery): array
    {
        return (clone $baseQuery)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month")
            ->selectRaw('COUNT(*) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(static fn ($row): array => [
                'month' => (string) $row->month,
                'total' => (int) $row->total,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int,array<string,mixed>>
     */
    private function buildInventoryReport(Builder $baseQuery): array
    {
        return (clone $baseQuery)
            ->select([
                'id',
                'no_asset',
                'no_serial',
                'tipe',
                'plant',
                'pengguna',
                'status',
                'created_at',
                'updated_at',
            ])
            ->latest('id')
            ->limit(50)
            ->get()
            ->map(static fn (Product $product): array => [
                'id' => $product->id,
                'no_asset' => $product->no_asset,
                'no_serial' => $product->no_serial,
                'tipe' => $product->tipe,
                'plant' => $product->plant,
                'pengguna' => $product->pengguna,
                'status' => $product->status,
                'created_at' => $product->created_at?->toISOString(),
                'updated_at' => $product->updated_at?->toISOString(),
            ])
            ->values()
            ->all();
    }
}
