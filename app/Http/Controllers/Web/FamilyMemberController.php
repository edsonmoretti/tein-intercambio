<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Family;
use App\Models\FamilyMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FamilyMemberController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Auto-initialize family or recover lost association
        if (!$user->family_id) {
            // Check if user is already a member of a family (recovery mode)
            $existingMembership = FamilyMember::where('user_id', $user->id)->first();

            if ($existingMembership) {
                Log::info("Recovering family_id for user {$user->id} from member record {$existingMembership->id}");
                $user->family_id = $existingMembership->family_id;
                $user->save();
            } else {
                // Create new family
                DB::transaction(function () use ($user) {
                    $family = Family::create(['name' => 'Família de ' . $user->name]);

                    // Manually assign to avoid model fillable issues just in case, though fillable is set.
                    $user->family_id = $family->id;
                    $user->save();

                    FamilyMember::create([
                        'family_id' => $family->id,
                        'user_id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => 'Principal', // Default
                        'is_primary' => true
                    ]);
                });
            }
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
                $user->family_id = $family->id;
                $user->save();

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
                Log::warning("Store: Attempted to add self (User {$user->id}) as member again. Skipping.");
                // Update self role if needed? Or just return.
                return;
            }

            Log::info("Store: Creating member. LinkedUser: " . ($linkedUser ? $linkedUser->id : 'None'));

            Log::info("Store: Creating member. FamilyId used: " . $user->family_id);

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

        Log::info("Update FamilyMember Debug", [
            'user_id' => $user->id,
            'user_family_id' => $user->family_id,
            'member_id' => $familyMember->id,
            'member_family_id' => $familyMember->family_id
        ]);

        if ($familyMember->family_id != $user->family_id) {
            abort(403);
        }

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
