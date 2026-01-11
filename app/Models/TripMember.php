<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TripMember extends Model
{
    protected $fillable = ['trip_id', 'user_id', 'name'];

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }
}
