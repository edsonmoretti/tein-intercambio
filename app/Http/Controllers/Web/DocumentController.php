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

        $data = $request->validate([
            'type' => 'required|string',
            'is_mandatory' => 'boolean',
            'expiration_date' => 'nullable|date',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('documents', 'public');
            $data['status'] = 'sent';
        }

        $exchange->documents()->create($data);

        return back()->with('success', 'Documento adicionado!');
    }

    public function update(Request $request, Document $document)
    {
        if (Auth::user()->type !== 'admin' && $document->exchange->user_id !== Auth::id()) {
            abort(403);
        }

        $data = $request->validate([
            'type' => 'sometimes|string',
            'is_mandatory' => 'sometimes|boolean',
            'expiration_date' => 'nullable|date',
            'status' => 'sometimes|string',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        if ($request->hasFile('file')) {
            // Delete old file if exists
            if ($document->file_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($document->file_path);
            }
            $data['file_path'] = $request->file('file')->store('documents', 'public');
            $data['status'] = 'sent'; // Auto update status on new file
        }

        $document->update($data);

        return back()->with('success', 'Documento atualizado!');
    }

    public function destroy(Document $document)
    {
        if (Auth::user()->type !== 'admin' && $document->exchange->user_id !== Auth::id()) {
            abort(403);
        }

        if ($document->file_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return back()->with('success', 'Documento removido!');
    }
}
