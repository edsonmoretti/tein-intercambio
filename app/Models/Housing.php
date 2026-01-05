<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Housing extends Model
{
    use HasFactory;

    protected $fillable = [
        'exchange_id',
        'type',
        'address',
        'contact_info',
        'start_date',
        'end_date',
        'cost'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'cost' => 'decimal:2',
    ];

    public function exchange()
    {
        return $this->belongsTo(Exchange::class);
    }
}
