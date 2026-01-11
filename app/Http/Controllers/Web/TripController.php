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

        if ($user->type === 'admin') {
            $trips = Trip::with('user')->get();
        } elseif ($user->family_id) {
            $familyUserIds = \App\Models\User::where('family_id', $user->family_id)->pluck('id');
            $trips = Trip::whereIn('user_id', $familyUserIds)->get();
        } else {
            $trips = Trip::where('user_id', $user->id)->get();
        }

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
        $user = Auth::user();
        $isFamilyAuth = ($user->family_id && $trip->user->family_id === $user->family_id);

        if ($user->type !== 'admin' && $trip->user_id !== $user->id && !$isFamilyAuth) {
            abort(403);
        }

        $trip->load([
            'documents.member.user:id,avatar',
            'tasks.member.user:id,avatar',
            'budgets',
            'events',
            'purchases.member.user:id,avatar',
            'housings',
            'members.user:id,avatar'
        ]);

        $familyMembers = $user->family_id
            ? \App\Models\FamilyMember::where('family_id', $user->family_id)->with('user:id,avatar')->orderBy('name')->get()
            : [];

        return Inertia::render('Trips/Show', [
            'trip' => $trip,
            'familyMembers' => $familyMembers
        ]);
    }

    public function edit(Trip $trip)
    {
        $user = Auth::user();
        $isFamilyAuth = ($user->family_id && $trip->user->family_id === $user->family_id);

        if ($user->type !== 'admin' && $trip->user_id !== $user->id && !$isFamilyAuth) {
            abort(403);
        }

        return Inertia::render('Trips/Form', [
            'trip' => $trip
        ]);
    }

    public function update(Request $request, Trip $trip)
    {
        $user = Auth::user();
        $isFamilyAuth = ($user->family_id && $trip->user->family_id === $user->family_id);

        if ($user->type !== 'admin' && $trip->user_id !== $user->id && !$isFamilyAuth) {
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
        $user = Auth::user();
        $isFamilyAuth = ($user->family_id && $trip->user->family_id === $user->family_id);

        if ($user->type !== 'admin' && $trip->user_id !== $user->id && !$isFamilyAuth) {
            abort(403);
        }

        $trip->delete();
        return redirect()->route('trips.index')->with('success', 'Viagem excluída.');
    }
}
