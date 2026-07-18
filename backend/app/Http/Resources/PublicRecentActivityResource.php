<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicRecentActivityResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'description' => $this->description,
            'created_at' => $this->created_at?->toISOString(),
            'asset' => $this->product ? [
                'id' => $this->product->id,
                'asset_code' => $this->product->no_asset,
                'serial_number' => $this->product->no_serial,
                'asset_name' => $this->product->tipe,
                'status' => $this->product->status,
            ] : null,
            'actor' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ] : null,
        ];
    }
}