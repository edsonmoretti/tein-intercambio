<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Exchange;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ExchangeController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $exchanges = $user->type === 'admin'
            ? Exchange::with('user')->get()
            : Exchange::where('user_id', $user->id)->get();

        return Inertia::render('Exchanges/Index', [
            'exchanges' => $exchanges
        ]);
    }

    public function create()
    {
        return Inertia::render('Exchanges/Form');
    }

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

        Exchange::create(array_merge(
            $request->only(['country', 'city', 'type', 'start_date', 'end_date', 'institution']),
            ['user_id' => Auth::id(), 'status' => 'planning']
        ));

        return redirect()->route('exchanges.index')->with('success', 'Intercâmbio criado com sucesso!');
    }

    public function show(Exchange $exchange)
    {
        if (Auth::user()->type !== 'admin' && $exchange->user_id !== Auth::id()) {
            abort(403);
        }

        $exchange->load('documents.member', 'tasks.member', 'budgets', 'events', 'purchases.member', 'housings', 'members');

        return Inertia::render('Exchanges/Show', [
            'exchange' => $exchange
        ]);
    }

    public function edit(Exchange $exchange)
    {
        if (Auth::user()->type !== 'admin' && $exchange->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('Exchanges/Form', [
            'exchange' => $exchange
        ]);
    }

    public function update(Request $request, Exchange $exchange)
    {
        if (Auth::user()->type !== 'admin' && $exchange->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'country' => 'required|string',
            'city' => 'required|string',
            'type' => 'required|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'institution' => 'nullable|string',
            'status' => 'nullable|string'
        ]);

        // Basic update - more complex business rules can be added here similar to API
        $exchange->update($request->all());

        return redirect()->route('exchanges.index')->with('success', 'Intercâmbio atualizado!');
    }

    public function destroy(Exchange $exchange)
    {
        if (Auth::user()->type !== 'admin' && $exchange->user_id !== Auth::id()) {
            abort(403);
        }

        $exchange->delete();
        return redirect()->route('exchanges.index')->with('success', 'Intercâmbio excluído.');
    }
}
