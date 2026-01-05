<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exchange;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExchangeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        if ($user->type === 'admin') {
            return Exchange::with('user')->get();
        }
        return Exchange::where('user_id', $user->id)->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'country' => 'required|string',
            'city' => 'required|string',
            'type' => 'required|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'institution' => 'nullable|string',
        ]);

        $exchange = Exchange::create(array_merge(
            $request->only(['country', 'city', 'type', 'start_date', 'end_date', 'institution']),
            ['user_id' => Auth::id(), 'status' => 'planning']
        ));

        return response()->json($exchange, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Exchange $exchange)
    {
        if (Auth::user()->type !== 'admin' && $exchange->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $exchange->load('documents', 'tasks', 'budgets', 'events');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Exchange $exchange)
    {
        if (Auth::user()->type !== 'admin' && $exchange->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'status' => 'nullable|string|in:planning,documents,confirmed,in_progress,completed',
            'country' => 'nullable|string',
            'city' => 'nullable|string',
            // ... other fields
        ]);

        if ($request->has('status') && $request->status === 'confirmed') {
            // Rule: Check mandatory documents
            $pendingMandatoryDocs = $exchange->documents()
                ->where('is_mandatory', true)
                ->where('status', '!=', 'approved')
                ->exists();

            if ($pendingMandatoryDocs) {
                return response()->json(['message' => 'Cannot confirm exchange without approved mandatory documents.'], 422);
            }
        }

        if ($request->has('status') && $request->status === 'completed') {
            // Rule: Check pending tasks
            $pendingTasks = $exchange->tasks()
                ->where('status', '!=', 'completed')
                ->exists();

            if ($pendingTasks) {
                return response()->json(['message' => 'Cannot complete exchange with pending tasks.'], 422);
            }
        }

        $exchange->update($request->all());
        return response()->json($exchange);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Exchange $exchange)
    {
        if (Auth::user()->type !== 'admin' && $exchange->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $exchange->delete();
        return response()->json(null, 204);
    }
}
