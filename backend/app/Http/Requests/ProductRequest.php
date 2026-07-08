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
            if ($this->has($field) && $this->input($field) === '') {
                $normalized[$field] = null;
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
            'tahun_pembuatan' => ['nullable', 'integer', 'digits:4'],
            'usage_date' => ['nullable', 'string', 'max:191'],
            'pengguna' => ['nullable', 'string', 'max:191'],
            'computer_name' => ['nullable', 'string', 'max:191'],
            'plant' => ['nullable', 'string', 'max:191'],
            'usage_record' => ['nullable', 'string', 'max:500'],
            'keterangan' => ['nullable', 'string', 'max:1000'],
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
