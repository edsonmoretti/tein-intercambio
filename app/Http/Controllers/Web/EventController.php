<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Exchange;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EventController extends Controller
{
    public function store(Request $request, Exchange $exchange)
    {
        if (Auth::user()->type !== 'admin' && $exchange->user_id !== Auth::id()) {
            abort(403);
        }

        $data = $request->validate([
            'title' => 'required|string',
            'date' => 'required|date',
            'type' => 'required|string',
            'description' => 'nullable|string'
        ]);

        $exchange->events()->create($data);

        return back()->with('success', 'Evento adicionado!');
    }

    public function update(Request $request, Event $event)
    {
        if (Auth::user()->type !== 'admin' && $event->exchange->user_id !== Auth::id()) {
            abort(403);
        }

        $data = $request->validate([
            'title' => 'sometimes|string',
            'date' => 'sometimes|date',
            'type' => 'sometimes|string',
            'description' => 'nullable|string'
        ]);

        $event->update($data);

        return back()->with('success', 'Evento atualizado!');
    }

    public function destroy(Event $event)
    {
        if (Auth::user()->type !== 'admin' && $event->exchange->user_id !== Auth::id()) {
            abort(403);
        }

        $event->delete();

        return back()->with('success', 'Evento removido!');
    }
}
