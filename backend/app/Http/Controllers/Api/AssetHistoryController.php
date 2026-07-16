<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AssetHistory;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssetHistoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string', 'max:191'],
            'action' => ['nullable', 'string', 'max:50'],
            'user_id' => ['nullable', 'integer', 'min:1'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
        ]);

        $perPage = (int) ($validated['per_page'] ?? 10);
        $search = $validated['search'] ?? null;

        $histories = AssetHistory::query()
            ->with([
                'product:id,no_asset,no_serial,tipe,status',
                'user:id,name,email',
            ])
            ->when($search, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('action', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('ip_address', 'like', "%{$search}%")
                        ->orWhereHas('product', function ($productQuery) use ($search): void {
                            $productQuery
                                ->where('no_asset', 'like', "%{$search}%")
                                ->orWhere('no_serial', 'like', "%{$search}%");
                        })
                        ->orWhereHas('user', function ($userQuery) use ($search): void {
                            $userQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($validated['action'] ?? null, function ($query, string $action): void {
                $query->where('action', $action);
            })
            ->when($validated['user_id'] ?? null, function ($query, int $userId): void {
                $query->where('user_id', $userId);
            })
            ->when($validated['date_from'] ?? null, function ($query, string $dateFrom): void {
                $query->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($validated['date_to'] ?? null, function ($query, string $dateTo): void {
                $query->whereDate('created_at', '<=', $dateTo);
            })
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json($histories);
    }

    public function show(AssetHistory $assetHistory): JsonResponse
    {
        $assetHistory->load([
            'product:id,no_asset,no_serial,tipe,status',
            'user:id,name,email',
        ]);

        return response()->json([
            'message' => 'Detail history berhasil dimuat.',
            'data' => $assetHistory,
        ]);
    }

    public function users(): JsonResponse
    {
        $userIds = AssetHistory::query()
            ->whereNotNull('user_id')
            ->distinct()
            ->pluck('user_id');

        $users = User::query()
            ->whereIn('id', $userIds)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return response()->json([
            'data' => $users,
        ]);
    }
}
