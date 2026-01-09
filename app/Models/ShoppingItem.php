<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShoppingItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'is_on_list',
        'is_checked',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
