<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PublicSearchRequest;
use App\Http\Resources\PublicSearchResource;
use App\Services\PublicApi\PublicPreviewService;

class PublicSearchController extends Controller
{
    public function __construct(
        private readonly PublicPreviewService $publicPreviewService
    ) {
    }

    public function index(PublicSearchRequest $request): PublicSearchResource
    {
        $validated = $request->validated();

        return (new PublicSearchResource(
            $this->publicPreviewService->search(
                (string) $validated['q'],
                (int) ($validated['limit'] ?? 10)
            )
        ))->additional([
            'success' => true,
            'message' => 'Public search preview berhasil dimuat.',
        ]);
    }
}