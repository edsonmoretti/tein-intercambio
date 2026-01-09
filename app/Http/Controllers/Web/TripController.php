<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TripController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $trips = $user->type === 'admin'
            ? Trip::with('user')->get()
            : Trip::where('user_id', $user->id)->get();

        return Inertia::render('Trips/Index', [
            'trips' => $trips
        ]);
    }

    public function create()
    {
        return Inertia::render('Trips/Form');
    }

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

        return response()->json(['trip_id' => $trip->id]);
    }

    public function show(Trip $trip)
    {
        if (Auth::user()->type !== 'admin' && $trip->user_id !== Auth::id()) {
            abort(403);
        }

        $trip->load('documents.member', 'tasks.member', 'budgets', 'events', 'purchases.member', 'housings', 'members');

        $familyMembers = \App\Models\FamilyMember::where('user_id', Auth::id())->orderBy('name')->get();

        return Inertia::render('Trips/Show', [
            'trip' => $trip,
            'familyMembers' => $familyMembers
        ]);
    }

    public function edit(Trip $trip)
    {
        if (Auth::user()->type !== 'admin' && $trip->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('Trips/Form', [
            'trip' => $trip
        ]);
    }

    public function update(Request $request, Trip $trip)
    {
        if (Auth::user()->type !== 'admin' && $trip->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'country' => 'required|string',
            'city' => 'required|string',
            'type' => 'required|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'place' => 'nullable|string',
            'status' => 'nullable|string'
        ]);

        $trip->update($request->all());

        return response()->json(['trip_id' => $trip->id]);
    }

    public function destroy(Trip $trip)
    {
        if (Auth::user()->type !== 'admin' && $trip->user_id !== Auth::id()) {
            abort(403);
        }

        $trip->delete();
        return redirect()->route('trips.index')->with('success', 'Viagem excluída.');
    }
}
