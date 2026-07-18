<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PublicAssetIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'in:10,20,50,100'],
            'search' => ['nullable', 'string', 'max:191'],
            'sort' => ['nullable', 'string', 'in:newest,oldest,asset_name,category,plant,purchase_date,warranty'],
            'asset_name' => ['nullable', 'string', 'max:191'],
            'asset_code' => ['nullable', 'string', 'max:191'],
            'serial_number' => ['nullable', 'string', 'max:191'],
            'brand' => ['nullable', 'string', 'max:191'],
            'model' => ['nullable', 'string', 'max:191'],
            'specification' => ['nullable', 'string', 'max:191'],
            'plant' => ['nullable', 'string', 'max:191'],
            'category' => ['nullable', 'string', 'max:191'],
            'vendor' => ['nullable', 'string', 'max:191'],
            'location' => ['nullable', 'string', 'max:191'],
            'status' => ['nullable', 'string', 'max:191'],
            'condition' => ['nullable', 'string', 'max:191'],
            'year' => ['nullable', 'string', 'max:191'],
            'warranty' => ['nullable', 'string', 'max:191'],
            'purchase_date' => ['nullable', 'string', 'max:191'],
            'disposal' => ['nullable', 'boolean'],
        ];
    }
}