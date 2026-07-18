<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicLookupResource;
use App\Services\PublicApi\PublicPreviewService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PublicLookupController extends Controller
{
    public function __construct(
        private readonly PublicPreviewService $publicPreviewService
    ) {
    }

    public function categories(): AnonymousResourceCollection
    {
        return $this->lookupResponse('categories', 'Daftar kategori public preview berhasil dimuat.');
    }

    public function brands(): AnonymousResourceCollection
    {
        return $this->lookupResponse('brands', 'Daftar brand public preview berhasil dimuat.');
    }

    public function plants(): AnonymousResourceCollection
    {
        return $this->lookupResponse('plants', 'Daftar plant public preview berhasil dimuat.');
    }

    public function locations(): AnonymousResourceCollection
    {
        return $this->lookupResponse('locations', 'Daftar lokasi public preview berhasil dimuat.');
    }

    public function statuses(): AnonymousResourceCollection
    {
        return $this->lookupResponse('status', 'Daftar status public preview berhasil dimuat.');
    }

    public function conditions(): AnonymousResourceCollection
    {
        return $this->lookupResponse('conditions', 'Daftar kondisi public preview berhasil dimuat.');
    }

    private function lookupResponse(string $type, string $message): AnonymousResourceCollection
    {
        return PublicLookupResource::collection($this->publicPreviewService->getLookupValues($type))
            ->additional([
                'success' => true,
                'message' => $message,
            ]);
    }
}