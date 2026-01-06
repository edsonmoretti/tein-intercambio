<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_id',
        'trip_member_id',
        'type',
        'expiration_date',
        'is_mandatory',
        'file_path',
        'status'
    ];

    protected $casts = [
        'expiration_date' => 'date',
        'is_mandatory' => 'boolean',
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
