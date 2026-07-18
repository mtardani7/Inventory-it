<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PublicAssetIndexRequest;
use App\Http\Resources\PublicAssetResource;
use App\Services\PublicApi\PublicPreviewService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PublicAssetController extends Controller
{
    public function __construct(
        private readonly PublicPreviewService $publicPreviewService
    ) {
    }

    public function index(PublicAssetIndexRequest $request): AnonymousResourceCollection
    {
        $assets = $this->publicPreviewService->paginateAssets($request->validated());

        return PublicAssetResource::collection($assets)->additional([
            'success' => true,
            'message' => 'Public asset preview berhasil dimuat.',
        ]);
    }
}