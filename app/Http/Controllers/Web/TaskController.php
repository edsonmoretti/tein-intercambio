<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function store(Request $request, Trip $trip)
    {
        if (Auth::user()->type !== 'admin' && $trip->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'description' => 'required|string',
            'category' => 'required|string',
            'due_date' => 'nullable|date',
            'trip_member_id' => 'nullable|exists:trip_members,id'
        ]);

        $trip->tasks()->create($request->all());

        return back()->with('success', 'Tarefa adicionada!');
    }

    public function update(Request $request, Task $task)
    {
        if (Auth::user()->type !== 'admin' && $task->trip->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'status' => 'required|in:pending,completed',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
        ]);

        $task->update($request->all());

        return back()->with('success', 'Tarefa atualizada!');
    }

    public function destroy(Task $task)
    {
        if (Auth::user()->type !== 'admin' && $task->trip->user_id !== Auth::id()) {
            abort(403);
        }

        $task->delete();

        return back()->with('success', 'Tarefa removida!');
    }
}
