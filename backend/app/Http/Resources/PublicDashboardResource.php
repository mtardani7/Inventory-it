<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class PublicDashboardResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'summary' => $this['summary'],
            'charts' => $this['charts'],
            'recent_activity' => PublicRecentActivityResource::collection($this->toCollection($this['recent_activity'] ?? [])),
            'latest_asset' => PublicAssetResource::collection($this->toCollection($this['latest_asset'] ?? [])),
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