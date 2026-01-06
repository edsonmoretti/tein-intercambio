<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    /** @use HasFactory<\Database\Factories\TripFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'country',
        'city',
        'place',
        'start_date',
        'end_date',
        'type',
        'status'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }
    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }
    public function housings()
    {
        return $this->hasMany(Housing::class);
    }
    public function events()
    {
        return $this->hasMany(Event::class);
    }
    public function members()
    {
        return $this->hasMany(TripMember::class);
    }
}
