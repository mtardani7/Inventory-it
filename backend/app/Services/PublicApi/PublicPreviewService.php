<?php

namespace App\Services\PublicApi;

use App\Repositories\PublicApi\PublicPreviewRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class PublicPreviewService
{
    public function __construct(
        private readonly PublicPreviewRepositoryInterface $publicPreviewRepository
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function getDashboardPreview(): array
    {
        return Cache::remember(
            'public-preview:dashboard',
            now()->addMinutes(5),
            fn (): array => $this->publicPreviewRepository->getDashboardPreview()
        );
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateAssets(array $filters): LengthAwarePaginator
    {
        return Cache::remember(
            $this->makeCacheKey('assets', $filters),
            now()->addMinutes(5),
            fn (): LengthAwarePaginator => $this->publicPreviewRepository->paginateAssets($filters)
        );
    }

    public function getLookupValues(string $type): Collection
    {
        return Cache::remember(
            $this->makeCacheKey('lookup', ['type' => $type]),
            now()->addMinutes(5),
            fn (): Collection => $this->publicPreviewRepository->getLookupValues($type)
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function search(string $query, int $limit): array
    {
        return Cache::remember(
            $this->makeCacheKey('search', ['q' => $query, 'limit' => $limit]),
            now()->addMinutes(5),
            fn (): array => $this->publicPreviewRepository->search($query, $limit)
        );
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function makeCacheKey(string $prefix, array $payload): string
    {
        ksort($payload);

        return sprintf(
            'public-preview:%s:%s',
            $prefix,
            sha1(json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '{}')
        );
    }
}