<?php

namespace App\Repositories\PublicApi;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface PublicPreviewRepositoryInterface
{
    /**
     * @return array<string, mixed>
     */
    public function getDashboardPreview(): array;

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateAssets(array $filters): LengthAwarePaginator;

    public function getLookupValues(string $type): Collection;

    /**
     * @return array<string, mixed>
     */
    public function search(string $query, int $limit): array;
}