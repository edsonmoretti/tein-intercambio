<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'exchange_id',
        'category',
        'description',
        'due_date',
        'status'
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    public function exchange()
    {
        return $this->belongsTo(Exchange::class);
    }
}
