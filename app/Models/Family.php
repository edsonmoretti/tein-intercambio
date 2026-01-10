<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Family extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function members()
    {
        return $this->hasMany(FamilyMember::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
