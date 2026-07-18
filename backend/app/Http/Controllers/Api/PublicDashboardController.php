<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicDashboardResource;
use App\Services\PublicApi\PublicPreviewService;

class PublicDashboardController extends Controller
{
    public function __construct(
        private readonly PublicPreviewService $publicPreviewService
    ) {
    }

    public function index(): PublicDashboardResource
    {
        return (new PublicDashboardResource($this->publicPreviewService->getDashboardPreview()))
            ->additional([
                'success' => true,
                'message' => 'Public dashboard preview berhasil dimuat.',
            ]);
    }
}