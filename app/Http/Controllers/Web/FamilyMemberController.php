<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\FamilyMember;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class FamilyMemberController extends Controller
{
    public function index()
    {
        $members = FamilyMember::where('user_id', Auth::id())
            ->orderByDesc('is_primary')
            ->orderBy('name')
            ->get();

        return Inertia::render('Family/Index', [
            'members' => $members
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'role' => 'required|string|max:50',
            'is_primary' => 'boolean'
        ]);

        $validated['user_id'] = Auth::id();

        if ($validated['is_primary'] ?? false) {
            // Demote others if this is primary (optional logic, but usually only one primary per user/household)
            // For now, let's allow setting it without strict uniqueness check unless requested.
            // Actually, user said "option to mark as primary".
        }

        FamilyMember::create($validated);

        return back()->with('success', 'Membro da família adicionado com sucesso!');
    }

    public function destroy(FamilyMember $familyMember)
    {
        if ($familyMember->user_id !== Auth::id()) {
            abort(403);
        }

        $familyMember->delete();

        return back()->with('success', 'Membro removido com sucesso.');
    }
}
