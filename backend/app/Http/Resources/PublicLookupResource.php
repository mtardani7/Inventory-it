<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicLookupResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'name' => $this['name'] ?? $this['value'] ?? null,
            'value' => $this['value'] ?? $this['name'] ?? null,
            'total' => $this['total'] ?? null,
        ];
    }
}