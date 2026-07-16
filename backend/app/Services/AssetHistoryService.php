<?php

namespace App\Services;

use App\Models\AssetHistory;
use App\Models\Product;

class AssetHistoryService
{
    /**
     * @param  array<string,mixed>|null  $oldValues
     * @param  array<string,mixed>|null  $newValues
     */
    public function record(
        Product $product,
        string $action,
        string $description,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?int $userId = null,
        ?string $ipAddress = null
    ): AssetHistory {
        return AssetHistory::query()->create([
            'product_id' => $product->id,
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $ipAddress ?: 'system',
        ]);
    }
}
