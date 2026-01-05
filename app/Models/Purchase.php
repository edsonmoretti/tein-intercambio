<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'exchange_id',
        'type',
        'item',
        'category',
        'estimated_cost',
        'actual_cost',
        'status'
    ];

    protected $casts = [
        'estimated_cost' => 'decimal:2',
        'actual_cost' => 'decimal:2',
    ];

    public function exchange()
    {
        return $this->belongsTo(Exchange::class);
    }
}
