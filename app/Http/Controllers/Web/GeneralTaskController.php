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
        $tasks = GeneralTask::where('user_id', Auth::id())
            ->with(['member']) // Eager load assigned member
            ->orderBy('is_completed') // Pending first
            ->orderByDesc('created_at')
            ->get();

        $members = FamilyMember::where('user_id', Auth::id())->orderBy('name')->get();

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
        if ($generalTask->user_id !== Auth::id())
            abort(403);

        // Handle toggle status or reassignment
        $generalTask->update($request->only(['is_completed', 'family_member_id']));

        return back();
    }

    public function destroy(GeneralTask $generalTask)
    {
        if ($generalTask->user_id !== Auth::id())
            abort(403);
        $generalTask->delete();
        return back()->with('success', 'Tarefa excluída.');
    }
}
