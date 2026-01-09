<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GeneralTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'description',
        'family_member_id',
        'is_completed',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function member()
    {
        return $this->belongsTo(FamilyMember::class, 'family_member_id');
    }
}
