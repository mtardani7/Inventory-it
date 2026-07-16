<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AssetHistoryController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SettingController;

Route::post("/login", [AuthController::class, "login"]);

Route::middleware("auth:sanctum")->group(function () {
    Route::get("/user", [AuthController::class, "me"]);
    Route::post("/logout", [AuthController::class, "logout"]);
    Route::post("/products/import", [ProductController::class, "import"]);
    Route::get("/products/export/template", [ProductController::class, "exportTemplate"]);
    Route::get("/products/export/excel", [ProductController::class, "exportExcel"]);
    Route::get("/products/export/pdf", [ProductController::class, "exportPdf"]);
    Route::get('/asset-histories/users', [AssetHistoryController::class, 'users']);
    Route::get('/asset-histories/{assetHistory}', [AssetHistoryController::class, 'show']);
    Route::get('/asset-histories', [AssetHistoryController::class, 'index']);
    Route::get('/reports', [ReportController::class, 'index']);
    Route::get('/reports/export/excel', [ReportController::class, 'exportExcel']);
    Route::get('/reports/export/pdf', [ReportController::class, 'exportPdf']);
    Route::get('/settings', [SettingController::class, 'show']);
    Route::post('/settings', [SettingController::class, 'store']);
    Route::put('/settings', [SettingController::class, 'update']);
    Route::delete('/settings', [SettingController::class, 'destroy']);
    Route::apiResource("products", ProductController::class);
});