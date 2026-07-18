<?php

namespace App\Providers;

use App\Repositories\PublicApi\PublicPreviewRepository;
use App\Repositories\PublicApi\PublicPreviewRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(PublicPreviewRepositoryInterface::class, PublicPreviewRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
