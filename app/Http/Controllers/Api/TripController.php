<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TripController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        if ($user->type === 'admin') {
            return Trip::with('user')->get();
        }
        return Trip::where('user_id', $user->id)->get();
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
            'place' => 'nullable|string',
        ]);

        $trip = Trip::create(array_merge(
            $request->only(['country', 'city', 'type', 'start_date', 'end_date', 'place']),
            ['user_id' => Auth::id(), 'status' => 'planning']
        ));

        return response()->json($trip, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Trip $trip)
    {
        if (Auth::user()->type !== 'admin' && $trip->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $trip->load('documents', 'tasks', 'budgets', 'events');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Trip $trip)
    {
        if (Auth::user()->type !== 'admin' && $trip->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'status' => 'nullable|string|in:planning,documents,confirmed,in_progress,completed',
            'country' => 'nullable|string',
            'city' => 'nullable|string',
            'place' => 'nullable|string',
            // ... other fields
        ]);

        if ($request->has('status') && $request->status === 'confirmed') {
            // Rule: Check mandatory documents
            $pendingMandatoryDocs = $trip->documents()
                ->where('is_mandatory', true)
                ->where('status', '!=', 'approved')
                ->exists();

            if ($pendingMandatoryDocs) {
                return response()->json(['message' => 'Cannot confirm trip without approved mandatory documents.'], 422);
            }
        }

        if ($request->has('status') && $request->status === 'completed') {
            // Rule: Check pending tasks
            $pendingTasks = $trip->tasks()
                ->where('status', '!=', 'completed')
                ->exists();

            if ($pendingTasks) {
                return response()->json(['message' => 'Cannot complete trip with pending tasks.'], 422);
            }
        }

        $trip->update($request->all());
        return response()->json($trip);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Trip $trip)
    {
        if (Auth::user()->type !== 'admin' && $trip->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $trip->delete();
        return response()->json(null, 204);
    }
}
