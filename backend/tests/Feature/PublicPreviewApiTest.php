<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PublicPreviewApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();

        Schema::dropIfExists('asset_histories');
        Schema::dropIfExists('products');
        Schema::dropIfExists('users');

        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('password')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            $table->string('no_serial')->nullable();
            $table->string('no_asset')->nullable();
            $table->string('no_equipment')->nullable();
            $table->string('tipe')->nullable();
            $table->string('tahun_pembuatan')->nullable();
            $table->string('usage_date')->nullable();
            $table->string('pengguna')->nullable();
            $table->string('computer_name')->nullable();
            $table->string('plant')->nullable();
            $table->string('usage_record')->nullable();
            $table->text('keterangan')->nullable();
            $table->string('status')->default('Aktif');
            $table->timestamps();
        });

        Schema::create('asset_histories', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('action', 50);
            $table->text('description');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->default('system');
            $table->timestamps();
        });

        $userA = \DB::table('users')->insertGetId([
            'name' => 'Admin Public',
            'email' => 'admin@example.test',
            'password' => 'secret',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $userB = \DB::table('users')->insertGetId([
            'name' => 'Operator Plant',
            'email' => 'operator@example.test',
            'password' => 'secret',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $assetA = \DB::table('products')->insertGetId([
            'no_serial' => 'SN-PUB-001',
            'no_asset' => 'AST-PUB-001',
            'no_equipment' => 'EQ-PUB-001',
            'tipe' => 'Laptop',
            'tahun_pembuatan' => '2024',
            'usage_date' => '2024-07-01',
            'pengguna' => 'Budi',
            'computer_name' => 'LTP-001',
            'plant' => 'Plant 1',
            'usage_record' => 'Office',
            'keterangan' => 'Unit operasional kantor',
            'status' => 'Aktif',
            'created_at' => now()->subDays(3),
            'updated_at' => now()->subDays(1),
        ]);

        $assetB = \DB::table('products')->insertGetId([
            'no_serial' => 'SN-PUB-002',
            'no_asset' => 'AST-PUB-002',
            'no_equipment' => 'EQ-PUB-002',
            'tipe' => 'Printer',
            'tahun_pembuatan' => '2023',
            'usage_date' => '2024-06-15',
            'pengguna' => 'Sari',
            'computer_name' => 'PRN-002',
            'plant' => 'Plant 2',
            'usage_record' => 'Warehouse',
            'keterangan' => 'Printer label gudang',
            'status' => 'Maintenance',
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subHours(12),
        ]);

        $assetC = \DB::table('products')->insertGetId([
            'no_serial' => 'SN-PUB-003',
            'no_asset' => 'AST-PUB-003',
            'no_equipment' => 'EQ-PUB-003',
            'tipe' => 'Scanner',
            'tahun_pembuatan' => '2022',
            'usage_date' => '2024-05-01',
            'pengguna' => 'Rina',
            'computer_name' => 'SCN-003',
            'plant' => 'Plant 1',
            'usage_record' => 'QA',
            'keterangan' => 'Scanner untuk inspeksi',
            'status' => 'Disposal',
            'created_at' => now()->subDay(),
            'updated_at' => now()->subHours(3),
        ]);

        \DB::table('asset_histories')->insert([
            [
                'product_id' => $assetA,
                'user_id' => $userA,
                'action' => 'create',
                'description' => 'Asset dibuat.',
                'old_values' => null,
                'new_values' => json_encode(['status' => 'Aktif']),
                'ip_address' => '10.0.0.10',
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(3),
            ],
            [
                'product_id' => $assetB,
                'user_id' => $userB,
                'action' => 'update',
                'description' => 'Asset masuk maintenance.',
                'old_values' => json_encode(['status' => 'Aktif']),
                'new_values' => json_encode(['status' => 'Maintenance']),
                'ip_address' => '10.0.0.20',
                'created_at' => now()->subHours(12),
                'updated_at' => now()->subHours(12),
            ],
            [
                'product_id' => $assetC,
                'user_id' => $userA,
                'action' => 'disposal',
                'description' => 'Asset dipindahkan ke disposal.',
                'old_values' => json_encode(['status' => 'Maintenance']),
                'new_values' => json_encode(['status' => 'Disposal']),
                'ip_address' => '10.0.0.30',
                'created_at' => now()->subHours(3),
                'updated_at' => now()->subHours(3),
            ],
        ]);
    }

    public function test_public_dashboard_can_be_accessed_without_login(): void
    {
        $response = $this->getJson('/api/public/dashboard');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.summary.total_asset', 3)
            ->assertJsonPath('data.summary.total_asset_active', 1)
            ->assertJsonPath('data.summary.total_asset_maintenance', 1)
            ->assertJsonPath('data.summary.total_asset_disposal', 1)
            ->assertJsonPath('data.summary.total_user', 2)
            ->assertJsonCount(3, 'data.recent_activity')
            ->assertJsonCount(3, 'data.latest_asset')
            ->assertJsonMissingPath('data.recent_activity.0.actor.email')
            ->assertJsonMissingPath('data.recent_activity.0.ip_address');
    }

    public function test_public_assets_support_pagination_search_and_filters(): void
    {
        $response = $this->getJson('/api/public/assets?per_page=10&search=AST-PUB&plant=Plant%201&sort=newest');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.total', 2)
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.asset_code', 'AST-PUB-003');
    }

    public function test_public_lookups_return_preview_lists(): void
    {
        $this->getJson('/api/public/categories')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data');

        $this->getJson('/api/public/plants')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->getJson('/api/public/status')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_public_search_returns_safe_grouped_results(): void
    {
        $response = $this->getJson('/api/public/search?q=Plant');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.query', 'Plant')
            ->assertJsonCount(3, 'data.results.assets')
            ->assertJsonCount(2, 'data.results.plants')
            ->assertJsonMissingPath('data.results.assets.0.email')
            ->assertJsonMissingPath('data.results.assets.0.ip_address');
    }
}