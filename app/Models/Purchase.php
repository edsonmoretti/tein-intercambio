<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_id',
        'trip_member_id',
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

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function member()
    {
        return $this->belongsTo(TripMember::class, 'trip_member_id');
    }
}
