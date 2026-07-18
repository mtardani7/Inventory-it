<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicAssetResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'asset_code' => $this->no_asset,
            'serial_number' => $this->no_serial,
            'equipment_code' => $this->no_equipment,
            'asset_name' => $this->tipe,
            'category' => $this->tipe,
            'plant' => $this->plant,
            'user_name' => $this->pengguna,
            'computer_name' => $this->computer_name,
            'usage_record' => $this->usage_record,
            'description' => $this->keterangan,
            'status' => $this->status,
            'manufacture_year' => $this->tahun_pembuatan,
            'usage_date' => $this->usage_date,
            'history_count' => $this->whenCounted('histories'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}