<?php

namespace App\Services;

use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class ProductStorageService
{
    protected string $disk = 'local';

    protected string $file = 'products.json';

    public function paginate(array $params = []): LengthAwarePaginator
    {
        $page = max(1, (int) ($params['page'] ?? 1));
        $perPage = max(1, min(100, (int) ($params['per_page'] ?? 10)));
        $search = isset($params['search']) && $params['search'] !== ''
            ? trim((string) $params['search'])
            : null;
        $plant = isset($params['plant']) && $params['plant'] !== ''
            ? (string) $params['plant']
            : null;
        $status = isset($params['status']) && $params['status'] !== ''
            ? (string) $params['status']
            : null;

        $products = $this->all();

        $filtered = array_values(array_filter($products, function (array $product) use ($search, $plant, $status): bool {
            if ($search) {
                $haystack = strtolower(implode(' ', [
                    $product['no_asset'] ?? '',
                    $product['no_serial'] ?? '',
                    $product['no_equipment'] ?? '',
                    $product['tipe'] ?? '',
                    $product['pengguna'] ?? '',
                    $product['computer_name'] ?? '',
                    $product['plant'] ?? '',
                    $product['usage_record'] ?? '',
                    $product['keterangan'] ?? '',
                ]));

                if (str_contains($haystack, strtolower($search))) {
                    return true;
                }
            }

            if ($plant && (($product['plant'] ?? null) !== $plant)) {
                return false;
            }

            if ($status && (($product['status'] ?? null) !== $status)) {
                return false;
            }

            return $search === null || $search === '' || true;
        }));

        usort($filtered, fn (array $a, array $b) => (int) ($b['id'] ?? 0) <=> (int) ($a['id'] ?? 0));

        $total = count($filtered);
        $offset = ($page - 1) * $perPage;
        $items = array_slice($filtered, $offset, $perPage);

        return new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => '/api/products']
        );
    }

    public function create(array $payload): array
    {
        $products = $this->all();
        $nextId = $products === [] ? 1 : max(array_map(fn (array $product): int => (int) ($product['id'] ?? 0), $products)) + 1;

        $product = [
            'id' => $nextId,
            ...$payload,
            'created_at' => now()->toISOString(),
            'updated_at' => now()->toISOString(),
        ];

        $products[] = $product;
        $this->persist($products);

        return $product;
    }

    public function find(int $id): ?array
    {
        foreach ($this->all() as $product) {
            if ((int) ($product['id'] ?? 0) === $id) {
                return $product;
            }
        }

        return null;
    }

    public function update(int $id, array $payload): ?array
    {
        $products = $this->all();

        foreach ($products as $index => $product) {
            if ((int) ($product['id'] ?? 0) === $id) {
                $products[$index] = [
                    ...$product,
                    ...$payload,
                    'id' => $id,
                    'updated_at' => now()->toISOString(),
                ];
                $this->persist($products);

                return $products[$index];
            }
        }

        return null;
    }

    public function delete(int $id): bool
    {
        $products = $this->all();
        $filtered = array_values(array_filter($products, fn (array $product) => (int) ($product['id'] ?? 0) !== $id));

        if (count($filtered) === count($products)) {
            return false;
        }

        $this->persist($filtered);

        return true;
    }

    protected function all(): array
    {
        if (! Storage::disk($this->disk)->exists($this->file)) {
            return [];
        }

        $contents = Storage::disk($this->disk)->get($this->file);
        $items = json_decode($contents, true);

        return is_array($items) ? array_values(array_filter($items, 'is_array')) : [];
    }

    protected function persist(array $products): void
    {
        Storage::disk($this->disk)->put(
            $this->file,
            json_encode($products, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
        );
    }
}
