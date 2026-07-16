<?php

namespace App\Http\Controllers\Api;

use App\Exports\InventoryExcelExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\ProductImportRequest;
use App\Http\Requests\ProductRequest;
use App\Models\Product;
use App\Services\AssetHistoryService;
use App\Services\ProductImportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;

class ProductController extends Controller
{
    public function __construct(
        private readonly ProductImportService $productImportService,
        private readonly AssetHistoryService $assetHistoryService
    )
    {
    }

    // Using Eloquent Product model for DB-backed operations

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string', 'max:191'],
            'plant' => ['nullable', 'string', 'max:191'],
            'status' => ['nullable', 'string', 'max:191'],
            'sort' => ['nullable', 'string', 'max:191'],
            'order' => ['nullable', 'string', 'in:asc,desc'],
        ]);

        $perPage = (int) ($validated['per_page'] ?? 10);
        $search = $validated['search'] ?? null;
        $sort = $validated['sort'] ?? null;
        $order = $validated['order'] ?? 'desc';
        $allowedSorts = [
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
        ];

        $products = Product::query()
            ->when($search, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('no_asset', 'like', "%{$search}%")
                        ->orWhere('no_serial', 'like', "%{$search}%")
                        ->orWhere('no_equipment', 'like', "%{$search}%")
                        ->orWhere('tipe', 'like', "%{$search}%")
                        ->orWhere('pengguna', 'like', "%{$search}%")
                        ->orWhere('computer_name', 'like', "%{$search}%")
                        ->orWhere('plant', 'like', "%{$search}%")
                        ->orWhere('usage_record', 'like', "%{$search}%")
                        ->orWhere('keterangan', 'like', "%{$search}%");
                });
            })
            ->when($validated['plant'] ?? null, function ($query, string $plant): void {
                $query->where('plant', $plant);
            })
            ->when($validated['status'] ?? null, function ($query, string $status): void {
                $query->where('status', $status);
            })
            ->when(in_array($sort, $allowedSorts, true), function ($query) use ($sort, $order): void {
                $query->orderBy($sort, $order);
            }, function ($query): void {
                $query->latest('id');
            })
            ->paginate($perPage)
            ->withQueryString();

        return response()->json($products);
    }

    public function store(ProductRequest $request): JsonResponse
    {
        $product = Product::create($request->validated());

        $this->assetHistoryService->record(
            $product,
            'create',
            'Asset dibuat.',
            null,
            $product->toArray(),
            $request->user()?->id,
            $request->ip()
        );

        return response()->json([
            'message' => 'Asset berhasil ditambahkan.',
            'data' => $product,
        ], 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json([
            'message' => 'Asset berhasil dimuat.',
            'data' => $product,
        ]);
    }

    public function update(ProductRequest $request, Product $product): JsonResponse
    {
        $oldValues = $product->toArray();
        $oldStatus = $product->status;

        $product->update($request->validated());
        $freshProduct = $product->refresh();

        $newStatus = $freshProduct->status;

        $action = 'update';
        $description = 'Asset diperbarui.';

        if ($oldStatus !== 'Disposal' && $newStatus === 'Disposal') {
            $action = 'disposal';
            $description = 'Asset dipindahkan ke Disposal.';
        }

        if ($oldStatus === 'Disposal' && $newStatus !== 'Disposal') {
            $action = 'restore';
            $description = 'Asset dipulihkan dari Disposal.';
        }

        $this->assetHistoryService->record(
            $freshProduct,
            $action,
            $description,
            $oldValues,
            $freshProduct->toArray(),
            $request->user()?->id,
            $request->ip()
        );

        return response()->json([
            'message' => 'Asset berhasil diperbarui.',
            'data' => $freshProduct,
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $oldValues = $product->toArray();

        $this->assetHistoryService->record(
            $product,
            'delete',
            'Asset dihapus.',
            $oldValues,
            null,
            request()->user()?->id,
            request()->ip()
        );

        $product->delete();

        return response()->json([
            'message' => 'Asset berhasil dihapus.',
        ]);
    }

    public function import(ProductImportRequest $request): JsonResponse
    {
        try {
            $result = $this->productImportService->import(
                $request->file('file'),
                $request->user()?->id,
                $request->ip()
            );

            $summary = $result['summary'];

            $message = ($summary['failed'] > 0 || $summary['skipped'] > 0)
                ? 'Impor selesai dengan catatan. Periksa ringkasan impor.'
                : 'Impor asset berhasil.';

            return response()->json([
                'message' => $message,
                'summary' => $summary,
                'errors' => $result['errors'],
            ]);
        } catch (HttpResponseException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            return response()->json([
                'message' => 'Gagal memproses file impor. Silakan periksa format file dan coba lagi.',
            ], 422);
        }
    }

    public function exportTemplate(): BinaryFileResponse
    {
        $filename = 'inventory-template-' . Carbon::now()->format('Ymd_His') . '.xlsx';

        return Excel::download(
            InventoryExcelExport::template(),
            $filename,
            \Maatwebsite\Excel\Excel::XLSX,
            [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]
        );
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $products = $this->buildExportQuery($request)->get();
        $filename = 'inventory-export-' . Carbon::now()->format('Ymd_His') . '.xlsx';

        return Excel::download(
            new InventoryExcelExport($products),
            $filename,
            \Maatwebsite\Excel\Excel::XLSX,
            [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]
        );
    }

    public function exportPdf(Request $request)
    {
        $products = $this->buildExportQuery($request)->get();
        $filename = 'inventory-export-' . Carbon::now()->format('Ymd_His') . '.pdf';

        $pdf = Pdf::loadView('exports.inventory-pdf', [
            'products' => $products,
            'exportedAt' => Carbon::now()->format('d-m-Y H:i'),
            'totalAssets' => $products->count(),
        ])->setPaper('a4', 'landscape');

        return response()->streamDownload(
            static function () use ($pdf): void {
                echo $pdf->output();
            },
            $filename,
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]
        );
    }

    private function buildExportQuery(Request $request): Builder
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:191'],
            'plant' => ['nullable', 'string', 'max:191'],
            'status' => ['nullable', 'string', 'max:191'],
            'sort' => ['nullable', 'string', 'max:191'],
            'order' => ['nullable', 'string', 'in:asc,desc'],
        ]);

        $search = $validated['search'] ?? null;
        $sort = $validated['sort'] ?? null;
        $order = $validated['order'] ?? 'desc';

        $allowedSorts = [
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
        ];

        return Product::query()
            ->when($search, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('no_asset', 'like', "%{$search}%")
                        ->orWhere('no_serial', 'like', "%{$search}%")
                        ->orWhere('no_equipment', 'like', "%{$search}%")
                        ->orWhere('tipe', 'like', "%{$search}%")
                        ->orWhere('pengguna', 'like', "%{$search}%")
                        ->orWhere('computer_name', 'like', "%{$search}%")
                        ->orWhere('plant', 'like', "%{$search}%")
                        ->orWhere('usage_record', 'like', "%{$search}%")
                        ->orWhere('keterangan', 'like', "%{$search}%");
                });
            })
            ->when($validated['plant'] ?? null, function ($query, string $plant): void {
                $query->where('plant', $plant);
            })
            ->when($validated['status'] ?? null, function ($query, string $status): void {
                $query->where('status', $status);
            })
            ->when(in_array($sort, $allowedSorts, true), function ($query) use ($sort, $order): void {
                $query->orderBy($sort, $order);
            }, function ($query): void {
                $query->latest('id');
            });
    }
}
