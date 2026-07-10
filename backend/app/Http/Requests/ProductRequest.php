<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $nullableFields = [
            'no_serial',
            'no_asset',
            'no_equipment',
            'tipe',
            'tahun_pembuatan',
            'usage_date',
            'pengguna',
            'computer_name',
            'plant',
            'usage_record',
            'keterangan',
        ];

        $normalized = [];

        foreach ($nullableFields as $field) {
            if (! $this->has($field)) {
                continue;
            }

            $value = $this->input($field);

            if ($value === '') {
                $normalized[$field] = null;
                continue;
            }

            // Trim string inputs to avoid accidental whitespace-only values
            if (is_string($value)) {
                $normalized[$field] = trim($value);
            }
        }

        // If `tahun_pembuatan` is provided as a 4-digit year, convert to a
        // DB-compatible date (use January 1st of that year) because the
        // database column expects a date-like value.
        if ($this->has('tahun_pembuatan')) {
            $yearVal = $this->input('tahun_pembuatan');
            if (is_string($yearVal) && preg_match('/^\d{4}$/', $yearVal)) {
                $normalized['tahun_pembuatan'] = $yearVal . '-01-01';
            }
        }

        if ($this->isMethod('post') && ! $this->has('status')) {
            $normalized['status'] = 'Aktif';
        }

        if ($normalized !== []) {
            $this->merge($normalized);
        }
    }

    public function rules(): array
    {
        $statusRule = $this->isMethod('post')
            ? ['required', 'string', Rule::in(['Aktif', 'Maintenance', 'Rusak', 'Disposal'])]
            : ['sometimes', 'required', 'string', Rule::in(['Aktif', 'Maintenance', 'Rusak', 'Disposal'])];

        return [
            'no_asset' => ['nullable', 'string', 'max:191'],
            'no_serial' => ['nullable', 'string', 'max:191'],
            'no_equipment' => ['nullable', 'string', 'max:191'],
            'tipe' => ['nullable', 'string', 'max:191'],
            // Accept a date; we convert 4-digit years to YYYY-01-01 in
            // `prepareForValidation` so the DB accepts it.
            'tahun_pembuatan' => ['nullable', 'date'],
            // usage_date is varchar(255 in DB) — allow longer strings
            'usage_date' => ['nullable', 'string', 'max:255'],
            'pengguna' => ['nullable', 'string', 'max:191'],
            'computer_name' => ['nullable', 'string', 'max:191'],
            'plant' => ['nullable', 'string', 'max:191'],
            'usage_record' => ['nullable', 'string', 'max:500'],
            // `keterangan` is text in DB, allow longer content without strict max
            'keterangan' => ['nullable', 'string'],
            'status' => $statusRule,
        ];
    }

    public function attributes(): array
    {
        return [
            'no_asset' => 'No Asset',
            'no_serial' => 'Serial Number',
            'no_equipment' => 'No Equipment',
            'tipe' => 'Tipe',
            'tahun_pembuatan' => 'Tahun Pembuatan',
            'usage_date' => 'Tanggal Pemakaian',
            'pengguna' => 'Pengguna',
            'computer_name' => 'Computer Name',
            'usage_record' => 'Usage Record',
            'keterangan' => 'Keterangan',
            'status' => 'Status',
        ];
    }
}
