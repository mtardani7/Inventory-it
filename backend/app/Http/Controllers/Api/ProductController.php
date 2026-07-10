<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
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
        $product->update($request->validated());

        return response()->json([
            'message' => 'Asset berhasil diperbarui.',
            'data' => $product->refresh(),
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json([
            'message' => 'Asset berhasil dihapus.',
        ]);
    }
}
