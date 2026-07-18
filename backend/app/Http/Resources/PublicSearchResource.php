<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class PublicSearchResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'query' => $this['query'],
            'results' => [
                'assets' => PublicAssetResource::collection($this->toCollection($this['assets'] ?? [])),
                'categories' => PublicLookupResource::collection($this->toCollection($this['categories'] ?? [])),
                'plants' => PublicLookupResource::collection($this->toCollection($this['plants'] ?? [])),
                'brands' => PublicLookupResource::collection($this->toCollection($this['brands'] ?? [])),
                'vendors' => PublicLookupResource::collection($this->toCollection($this['vendors'] ?? [])),
                'locations' => PublicLookupResource::collection($this->toCollection($this['locations'] ?? [])),
            ],
        ];
    }

    /**
     * @param  mixed  $value
     */
    private function toCollection(mixed $value): Collection
    {
        return $value instanceof Collection ? $value : collect($value);
    }
}