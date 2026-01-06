<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Models\TripMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TripMemberController extends Controller
{
    public function store(Request $request, Trip $trip)
    {
        if (Auth::user()->type !== 'admin' && $trip->user_id !== Auth::id()) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'user_id' => 'nullable|exists:users,id'
        ]);

        // If user_id is provided, check if already added
        if (!empty($data['user_id'])) {
            $exists = $trip->members()->where('user_id', $data['user_id'])->exists();
            if ($exists) {
                return back()->with('error', 'Este usuário já é um membro desta viagem.');
            }
        }

        $trip->members()->create($data);

        return back()->with('success', 'Membro adicionado com sucesso!');
    }

    public function destroy(TripMember $member)
    {
        if (Auth::user()->type !== 'admin' && $member->trip->user_id !== Auth::id()) {
            abort(403);
        }

        $member->delete();

        return back()->with('success', 'Membro removido.');
    }
}
