<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    use HasFactory;

    protected $fillable = [
        'exchange_id',
        'category',
        'planned_amount',
        'spent_amount',
        'period'
    ];

    protected $casts = [
        'planned_amount' => 'decimal:2',
        'spent_amount' => 'decimal:2',
    ];

    public function exchange()
    {
        return $this->belongsTo(Exchange::class);
    }
}
