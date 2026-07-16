<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SettingRequest;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function show(): JsonResponse
    {
        $setting = $this->getOrCreateSetting();

        return response()->json([
            'message' => 'Setting berhasil dimuat.',
            'data' => $this->transformSetting($setting),
        ]);
    }

    public function store(SettingRequest $request): JsonResponse
    {
        $setting = $this->getOrCreateSetting();
        $payload = $request->safe()->except(['company_logo']);

        if ($request->hasFile('company_logo')) {
            $payload['company_logo'] = $this->storeCompanyLogo($request, $setting->company_logo);
        }

        $setting->fill($payload);
        $setting->save();

        return response()->json([
            'message' => 'Setting berhasil disimpan.',
            'data' => $this->transformSetting($setting->refresh()),
        ]);
    }

    public function update(SettingRequest $request): JsonResponse
    {
        return $this->store($request);
    }

    public function destroy(): JsonResponse
    {
        $setting = Setting::query()->first();

        if (! $setting) {
            return response()->json([
                'message' => 'Setting tidak ditemukan.',
            ], 404);
        }

        if ($setting->company_logo) {
            Storage::disk('public')->delete($setting->company_logo);
        }

        $setting->delete();

        return response()->json([
            'message' => 'Setting berhasil dihapus.',
        ]);
    }

    private function getOrCreateSetting(): Setting
    {
        return Setting::query()->firstOrCreate([], [
            'default_language' => 'id',
            'default_theme' => 'system',
        ]);
    }

    private function storeCompanyLogo(SettingRequest $request, ?string $currentPath = null): string
    {
        if ($currentPath) {
            Storage::disk('public')->delete($currentPath);
        }

        return (string) $request->file('company_logo')?->store('settings/logo', 'public');
    }

    /**
     * @return array<string, mixed>
     */
    private function transformSetting(Setting $setting): array
    {
        return [
            'id' => $setting->id,
            'company_name' => $setting->company_name,
            'company_address' => $setting->company_address,
            'company_phone' => $setting->company_phone,
            'company_email' => $setting->company_email,
            'company_logo' => $setting->company_logo,
            'company_logo_url' => $setting->company_logo ? Storage::url($setting->company_logo) : null,
            'default_language' => $setting->default_language,
            'default_theme' => $setting->default_theme,
            'created_at' => $setting->created_at?->toISOString(),
            'updated_at' => $setting->updated_at?->toISOString(),
        ];
    }
}
