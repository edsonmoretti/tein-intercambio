<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Family;
use App\Models\FamilyMember;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FamilyMemberController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Auto-initialize family if user doesn't belong to one
        if (!$user->family_id) {
            DB::transaction(function () use ($user) {
                $family = Family::create(['name' => 'Família de ' . $user->name]);
                $user->update(['family_id' => $family->id]);

                FamilyMember::create([
                    'family_id' => $family->id,
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => 'Principal', // Default
                    'is_primary' => true
                ]);
            });
            $user->refresh();
        }

        $members = FamilyMember::where('family_id', $user->family_id)
            ->orderByDesc('is_primary')
            ->orderBy('name')
            ->get();

        return Inertia::render('Family/Index', [
            'members' => $members
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'role' => 'required|string|max:50',
            'is_primary' => 'boolean'
        ]);

        DB::transaction(function () use ($user, $validated) {
            // 1. Ensure Family Exists
            if (!$user->family_id) {
                $family = Family::create(['name' => 'Família de ' . $user->name]);
                $user->update(['family_id' => $family->id]);

                // Create Member record for Self
                FamilyMember::create([
                    'family_id' => $family->id,
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => 'Principal', // Default role for owner
                    'is_primary' => true
                ]);
            }

            // 2. Add New Member
            $linkedUser = User::where('email', $validated['email'])->first();

            // Prevent adding self again if logic fails
            if ($linkedUser && $linkedUser->id === $user->id) {
                // Update self role if needed? Or just return.
                return;
            }

            $member = FamilyMember::create([
                'family_id' => $user->family_id, // Refresh if just updated
                'user_id' => $linkedUser ? $linkedUser->id : null,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'role' => $validated['role'],
                'is_primary' => $validated['is_primary'] ?? false
            ]);

            // 3. Link User if exists
            if ($linkedUser) {
                // Only link if they are not already in another family? 
                // "Todo membro é um usuário... se já tiver em uma família, já aparecerá tudo pra ele."
                // This implies we hijack their family_id or they join ours.
                // Let's assume they join ours.
                $linkedUser->update(['family_id' => $user->family_id]);
            }
        });

        return back()->with('success', 'Membro adicionado!');
    }

    public function update(Request $request, FamilyMember $familyMember)
    {
        // Allow updating Role/Primary status
        $user = Auth::user();
        if ($familyMember->family_id !== $user->family_id)
            abort(403);

        $validated = $request->validate([
            'role' => 'required|string|max:50',
            // 'is_primary' => 'boolean' // Optional
        ]);

        $familyMember->update($validated);

        return back()->with('success', 'Membro atualizado.');
    }

    public function destroy(FamilyMember $familyMember)
    {
        $user = Auth::user();

        if ($familyMember->family_id !== $user->family_id) {
            abort(403);
        }

        DB::transaction(function () use ($familyMember) {
            // If linked to a user, unlink them (reset family_id)
            if ($familyMember->user_id) {
                $linkedUser = User::find($familyMember->user_id);
                if ($linkedUser) {
                    $linkedUser->update(['family_id' => null]);
                }
            }

            // Delete member record
            $familyMember->delete();
        });

        return back()->with('success', 'Membro removido.');
    }
}
