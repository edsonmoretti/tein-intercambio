<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\GeneralTask;
use App\Models\FamilyMember;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class GeneralTaskController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $query = GeneralTask::with(['member.user:id,avatar']);

        if ($user->family_id) {
            // Get all tasks created by any user in this family
            // First find all user IDs in this family
            $familyUserIds = \App\Models\User::where('family_id', $user->family_id)->pluck('id');
            $query->whereIn('user_id', $familyUserIds);
        } else {
            $query->where('user_id', $user->id);
        }

        $tasks = $query->orderBy('is_completed') // Pending first
            ->orderByDesc('created_at')
            ->get();

        $members = $user->family_id
            ? FamilyMember::where('family_id', $user->family_id)->with('user:id,avatar')->orderBy('name')->get()
            : [];

        return Inertia::render('Checklist/Index', [
            'tasks' => $tasks,
            'members' => $members
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'family_member_id' => 'nullable|exists:family_members,id'
        ]);

        GeneralTask::create([
            'user_id' => Auth::id(),
            'description' => $validated['description'],
            'family_member_id' => $validated['family_member_id'],
            'is_completed' => false
        ]);

        return back()->with('success', 'Tarefa criada.');
    }

    public function update(Request $request, GeneralTask $generalTask)
    {
        $user = Auth::user();

        // Allow if owner OR if belonging to same family
        $isFamilyAuth = ($user->family_id && $generalTask->user->family_id === $user->family_id);

        if ($generalTask->user_id !== $user->id && !$isFamilyAuth) {
            abort(403);
        }

        // Handle toggle status or reassignment
        $generalTask->update($request->only(['is_completed', 'family_member_id']));

        return back();
    }

    public function destroy(GeneralTask $generalTask)
    {
        $user = Auth::user();

        // Allow if owner OR if belonging to same family
        $isFamilyAuth = ($user->family_id && $generalTask->user->family_id === $user->family_id);

        if ($generalTask->user_id !== $user->id && !$isFamilyAuth) {
            abort(403);
        }

        $generalTask->delete();
        return back()->with('success', 'Tarefa excluída.');
    }
}
