<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // API ini menggunakan Bearer token, bukan Sanctum SPA cookie auth.
        // Menonaktifkan stateful middleware mencegah validasi CSRF yang memicu 419.
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->create();