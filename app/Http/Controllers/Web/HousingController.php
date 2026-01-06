<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Housing;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HousingController extends Controller
{
    public function store(Request $request, Trip $trip)
    {
        if (Auth::user()->type !== 'admin' && $trip->user_id !== Auth::id()) {
            abort(403);
        }

        $data = $request->validate([
            'type' => 'required|string',
            'address' => 'required|string',
            'contact_info' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'cost' => 'nullable|numeric|min:0'
        ]);

        $trip->housings()->create($data);

        return back()->with('success', 'Acomodação adicionada!');
    }

    public function update(Request $request, Housing $housing)
    {
        if (Auth::user()->type !== 'admin' && $housing->trip->user_id !== Auth::id()) {
            abort(403);
        }

        $data = $request->validate([
            'type' => 'sometimes|string',
            'address' => 'sometimes|string',
            'contact_info' => 'nullable|string',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'cost' => 'nullable|numeric|min:0'
        ]);

        $housing->update($data);

        return back()->with('success', 'Acomodação atualizada!');
    }

    public function destroy(Housing $housing)
    {
        if (Auth::user()->type !== 'admin' && $housing->trip->user_id !== Auth::id()) {
            abort(403);
        }

        $housing->delete();

        return back()->with('success', 'Acomodação removida!');
    }
}
