<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'exchange_id',
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

    public function exchange()
    {
        return $this->belongsTo(Exchange::class);
    }
}
