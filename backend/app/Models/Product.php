<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'products';

    protected $fillable = [
        'no_serial',
        'no_asset',
        'no_equipment',
        'tipe',
        'tahun_pembuatan',
        'usage_date',
        'pengguna',
        'computer_name',
        'plant',
        'usage_record',
        'keterangan',
        'status',
    ];

    protected $casts = [];
}
