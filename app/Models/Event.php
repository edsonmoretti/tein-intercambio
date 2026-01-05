<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'exchange_id',
        'title',
        'date',
        'type',
        'description'
    ];

    protected $casts = [
        'date' => 'datetime',
    ];

    public function exchange()
    {
        return $this->belongsTo(Exchange::class);
    }
}
