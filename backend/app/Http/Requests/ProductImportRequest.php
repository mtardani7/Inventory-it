<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductImportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:10240',
                'mimes:xlsx,xls,csv,txt',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'File impor wajib dipilih.',
            'file.file' => 'Format unggahan tidak valid.',
            'file.max' => 'Ukuran file maksimal 10 MB.',
            'file.mimes' => 'File harus berformat Excel atau CSV (xlsx, xls, csv).',
        ];
    }
}
