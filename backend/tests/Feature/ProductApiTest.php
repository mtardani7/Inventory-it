<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::dropIfExists('products');
        Schema::create('products', function ($table): void {
            $table->id();
            $table->string('no_serial')->nullable();
            $table->string('no_asset')->nullable();
            $table->string('no_equipment')->nullable();
            $table->string('tipe')->nullable();
            $table->date('tahun_pembuatan')->nullable();
            $table->string('usage_date')->nullable();
            $table->string('pengguna')->nullable();
            $table->string('computer_name')->nullable();
            $table->string('plant')->nullable();
            $table->string('usage_record')->nullable();
            $table->text('keterangan')->nullable();
            $table->string('status')->default('Aktif');
            $table->timestamps();
        });
    }
    public function test_product_crud_flow(): void
    {
        $payload = [
            'no_asset' => 'ASSET-001',
            'no_serial' => 'SN-001',
            'no_equipment' => 'EQ-001',
            'tipe' => 'Laptop',
            'tahun_pembuatan' => '2024',
            'usage_date' => '12 Bulan',
            'pengguna' => 'Budi',
            'computer_name' => 'PC-01',
            'plant' => '1',
            'usage_record' => 'Rutin',
            'keterangan' => 'Unit baru',
            'status' => 'Aktif',
        ];

        $createResponse = $this->postJson('/api/products', $payload);

        $createResponse->assertCreated()
            ->assertJsonPath('data.no_asset', 'ASSET-001')
            ->assertJsonPath('data.status', 'Aktif');

        $productId = $createResponse->json('data.id');

        $this->getJson("/api/products/{$productId}")
            ->assertOk()
            ->assertJsonPath('data.no_asset', 'ASSET-001');

        $this->putJson("/api/products/{$productId}", [
            ...$payload,
            'status' => 'Maintenance',
        ])->assertOk()
            ->assertJsonPath('data.status', 'Maintenance');

        $this->deleteJson("/api/products/{$productId}")
            ->assertOk();
    }

    public function test_products_can_be_sorted_server_side(): void
    {
        $this->postJson('/api/products', [
            'no_asset' => 'ASSET-002',
            'no_serial' => 'SN-002',
            'tipe' => 'Zebra',
            'status' => 'Aktif',
        ])->assertCreated();

        $this->postJson('/api/products', [
            'no_asset' => 'ASSET-003',
            'no_serial' => 'SN-003',
            'tipe' => 'Alpha',
            'status' => 'Aktif',
        ])->assertCreated();

        $response = $this->getJson('/api/products?sort=tipe&order=asc');

        $response->assertOk()
            ->assertJsonPath('data.0.tipe', 'Alpha')
            ->assertJsonPath('data.0.no_asset', 'ASSET-003');
    }
}
