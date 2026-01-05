<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Exchange;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DocumentController extends Controller
{
    public function store(Request $request, Exchange $exchange)
    {
        if (Auth::user()->type !== 'admin' && $exchange->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'type' => 'required|string',
            'is_mandatory' => 'boolean',
            'expiration_date' => 'nullable|date',
        ]);

        $exchange->documents()->create($request->all());

        return back()->with('success', 'Documento adicionado!');
    }

    public function update(Request $request, Document $document)
    {
        if (Auth::user()->type !== 'admin' && $document->exchange->user_id !== Auth::id()) {
            abort(403);
        }

        // Simple status update or full update
        $document->update($request->all());

        return back()->with('success', 'Documento atualizado!');
    }

    public function destroy(Document $document)
    {
        if (Auth::user()->type !== 'admin' && $document->exchange->user_id !== Auth::id()) {
            abort(403);
        }

        $document->delete();

        return back()->with('success', 'Documento removido!');
    }
}
