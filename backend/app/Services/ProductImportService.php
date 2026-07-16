<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\HeadingRowImport;

class ProductImportService
{
    public function __construct(private readonly AssetHistoryService $assetHistoryService)
    {
    }

    /**
     * @return array{
     *   summary: array{total_rows:int,imported:int,updated:int,skipped:int,failed:int},
     *   errors: array<int,array{row:int,asset:string,messages:array<int,string>}>
     * }
     */
    public function import(UploadedFile $file, ?int $userId = null, ?string $ipAddress = null): array
    {
        $collections = Excel::toCollection(new HeadingRowImport(), $file);
        $rows = $collections->first();

        if (! $rows || $rows->isEmpty()) {
            return [
                'summary' => [
                    'total_rows' => 0,
                    'imported' => 0,
                    'updated' => 0,
                    'skipped' => 0,
                    'failed' => 0,
                ],
                'errors' => [
                    [
                        'row' => 1,
                        'asset' => '-',
                        'messages' => ['File tidak memiliki data yang dapat diimpor.'],
                    ],
                ],
            ];
        }

        $summary = [
            'total_rows' => 0,
            'imported' => 0,
            'updated' => 0,
            'skipped' => 0,
            'failed' => 0,
        ];

        $errors = [];
        $seenAssets = [];
        $seenSerials = [];

        DB::transaction(function () use ($rows, &$summary, &$errors, &$seenAssets, &$seenSerials, $userId, $ipAddress): void {
            foreach ($rows as $index => $rawRow) {
                $rowNumber = $index + 2;
                $row = $this->normalizeRow((array) $rawRow);

                if ($this->isRowEmpty($row)) {
                    continue;
                }

                $summary['total_rows']++;

                $assetKey = $row['no_asset'] ? Str::lower($row['no_asset']) : null;
                $serialKey = $row['no_serial'] ? Str::lower($row['no_serial']) : null;

                if ($assetKey && isset($seenAssets[$assetKey])) {
                    $summary['skipped']++;
                    $errors[] = $this->errorRow($rowNumber, $row['no_asset'], ['No Asset duplikat di dalam file impor.']);
                    continue;
                }

                if ($serialKey && isset($seenSerials[$serialKey])) {
                    $summary['skipped']++;
                    $errors[] = $this->errorRow($rowNumber, $row['no_asset'] ?? '-', ['Serial Number duplikat di dalam file impor.']);
                    continue;
                }

                if ($assetKey) {
                    $seenAssets[$assetKey] = true;
                }

                if ($serialKey) {
                    $seenSerials[$serialKey] = true;
                }

                $validator = Validator::make(
                    $row,
                    [
                        'no_asset' => ['nullable', 'string', 'max:191'],
                        'no_serial' => ['nullable', 'string', 'max:191'],
                        'no_equipment' => ['nullable', 'string', 'max:191'],
                        'tipe' => ['nullable', 'string', 'max:191'],
                        'tahun_pembuatan' => ['nullable', 'date'],
                        'usage_date' => ['nullable', 'string', 'max:255'],
                        'pengguna' => ['nullable', 'string', 'max:191'],
                        'computer_name' => ['nullable', 'string', 'max:191'],
                        'plant' => ['nullable', 'string', 'max:191'],
                        'usage_record' => ['nullable', 'string', 'max:500'],
                        'keterangan' => ['nullable', 'string'],
                        'status' => ['required', 'string', 'in:Aktif,Maintenance,Rusak,Disposal'],
                    ],
                    [
                        'status.in' => 'Status hanya boleh: Aktif, Maintenance, Rusak, Disposal.',
                        'tahun_pembuatan.date' => 'Tahun Pembuatan harus tanggal valid atau format tahun 4 digit.',
                    ]
                );

                if ($validator->fails()) {
                    $summary['failed']++;
                    $errors[] = $this->errorRow(
                        $rowNumber,
                        $row['no_asset'] ?? '-',
                        $validator->errors()->all()
                    );
                    continue;
                }

                $existingByAsset = null;
                if ($row['no_asset']) {
                    $existingByAsset = Product::query()->where('no_asset', $row['no_asset'])->first();
                }

                if ($row['no_serial']) {
                    $serialExists = Product::query()->where('no_serial', $row['no_serial'])->first();

                    if ($serialExists && (! $existingByAsset || $serialExists->id !== $existingByAsset->id)) {
                        $summary['skipped']++;
                        $errors[] = $this->errorRow(
                            $rowNumber,
                            $row['no_asset'] ?? '-',
                            ['Serial Number sudah digunakan oleh asset lain.']
                        );
                        continue;
                    }
                }

                if ($existingByAsset) {
                    $oldValues = $existingByAsset->toArray();
                    $existingByAsset->fill($row);
                    $existingByAsset->save();
                    $freshProduct = $existingByAsset->refresh();

                    $this->assetHistoryService->record(
                        $freshProduct,
                        'import',
                        'Asset diperbarui melalui import Excel.',
                        $oldValues,
                        $freshProduct->toArray(),
                        $userId,
                        $ipAddress
                    );

                    $summary['updated']++;
                    continue;
                }

                $createdProduct = Product::query()->create($row);

                $this->assetHistoryService->record(
                    $createdProduct,
                    'import',
                    'Asset ditambahkan melalui import Excel.',
                    null,
                    $createdProduct->toArray(),
                    $userId,
                    $ipAddress
                );

                $summary['imported']++;
            }
        });

        return [
            'summary' => $summary,
            'errors' => $errors,
        ];
    }

    /**
     * @param  array<string,mixed>  $row
     * @return array<string,mixed>
     */
    private function normalizeRow(array $row): array
    {
        $normalize = static function ($value): ?string {
            if ($value === null) {
                return null;
            }

            $stringValue = trim((string) $value);

            return $stringValue === '' ? null : $stringValue;
        };

        $tahunPembuatan = $normalize($row['tahun_pembuatan'] ?? null);
        if ($tahunPembuatan && preg_match('/^\d{4}$/', $tahunPembuatan)) {
            $tahunPembuatan .= '-01-01';
        }

        return [
            'no_asset' => $normalize($row['no_asset'] ?? null),
            'no_serial' => $normalize($row['no_serial'] ?? null),
            'no_equipment' => $normalize($row['no_equipment'] ?? null),
            'tipe' => $normalize($row['tipe'] ?? null),
            'tahun_pembuatan' => $tahunPembuatan,
            'usage_date' => $normalize($row['usage_date'] ?? null),
            'pengguna' => $normalize($row['pengguna'] ?? null),
            'computer_name' => $normalize($row['computer_name'] ?? null),
            'plant' => $normalize($row['plant'] ?? null),
            'usage_record' => $normalize($row['usage_record'] ?? null),
            'keterangan' => $normalize($row['keterangan'] ?? null),
            'status' => $this->normalizeStatus($normalize($row['status'] ?? null)),
        ];
    }

    /**
     * @param  array<string,mixed>  $row
     */
    private function isRowEmpty(array $row): bool
    {
        foreach ($row as $value) {
            if ($value !== null && $value !== '') {
                return false;
            }
        }

        return true;
    }

    private function normalizeStatus(?string $status): string
    {
        if (! $status) {
            return 'Aktif';
        }

        return match (Str::lower($status)) {
            'aktif' => 'Aktif',
            'maintenance' => 'Maintenance',
            'rusak' => 'Rusak',
            'disposal' => 'Disposal',
            default => $status,
        };
    }

    /**
     * @param  array<int,string>  $messages
     * @return array{row:int,asset:string,messages:array<int,string>}
     */
    private function errorRow(int $row, string $asset, array $messages): array
    {
        return [
            'row' => $row,
            'asset' => $asset,
            'messages' => $messages,
        ];
    }
}
