<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Exchange;
use App\Models\ExchangeMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExchangeMemberController extends Controller
{
    public function store(Request $request, Exchange $exchange)
    {
        if (Auth::user()->type !== 'admin' && $exchange->user_id !== Auth::id()) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'user_id' => 'nullable|exists:users,id'
        ]);

        // If user_id is provided, check if already added
        if (!empty($data['user_id'])) {
            $exists = $exchange->members()->where('user_id', $data['user_id'])->exists();
            if ($exists) {
                return back()->with('error', 'Este usuário já é um membro deste intercâmbio.');
            }
        }

        $exchange->members()->create($data);

        return back()->with('success', 'Membro adicionado com sucesso!');
    }

    public function destroy(ExchangeMember $member)
    {
        if (Auth::user()->type !== 'admin' && $member->exchange->user_id !== Auth::id()) {
            abort(403);
        }

        $member->delete();

        return back()->with('success', 'Membro removido.');
    }
}
