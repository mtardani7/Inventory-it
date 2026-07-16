<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $trimmed = [];

        foreach (['company_name', 'company_address', 'company_phone', 'company_email'] as $field) {
            if (! $this->has($field)) {
                continue;
            }

            $value = $this->input($field);
            if (is_string($value)) {
                $value = trim($value);
            }

            $trimmed[$field] = $value === '' ? null : $value;
        }

        if ($trimmed !== []) {
            $this->merge($trimmed);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'company_name' => ['nullable', 'string', 'max:191'],
            'company_address' => ['nullable', 'string'],
            'company_phone' => ['nullable', 'string', 'max:50'],
            'company_email' => ['nullable', 'email:rfc,dns', 'max:191'],
            'company_logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'default_language' => ['nullable', 'string', Rule::in(['id', 'en'])],
            'default_theme' => ['nullable', 'string', Rule::in(['light', 'dark', 'system'])],
        ];
    }
}
