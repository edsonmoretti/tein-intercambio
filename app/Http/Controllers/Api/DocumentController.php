<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Exchange;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DocumentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $documents = Document::whereHas('exchange', function ($query) {
            $query->where('user_id', Auth::id());
        })->get();

        // Business rule: Check expiration
        foreach ($documents as $doc) {
            if ($doc->expiration_date && $doc->expiration_date < now() && $doc->status !== 'expired') {
                $doc->update(['status' => 'expired']);
            }
        }

        return $documents;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'exchange_id' => 'required|exists:exchanges,id',
            'type' => 'required|string',
            'expiration_date' => 'nullable|date',
            'is_mandatory' => 'boolean',
        ]);

        $exchange = Exchange::findOrFail($request->exchange_id);
        if ($exchange->user_id !== Auth::id() && Auth::user()->type !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $document = Document::create($request->all());
        return response()->json($document, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Document $document)
    {
        if ($document->exchange->user_id !== Auth::id() && Auth::user()->type !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return $document;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Document $document)
    {
        if ($document->exchange->user_id !== Auth::id() && Auth::user()->type !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $document->update($request->all());

        // Check expiration again if updated
        if ($document->expiration_date && $document->expiration_date < now()) {
            $document->update(['status' => 'expired']);
        }

        return response()->json($document);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Document $document)
    {
        if ($document->exchange->user_id !== Auth::id() && Auth::user()->type !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $document->delete();
        return response()->json(null, 204);
    }
}
