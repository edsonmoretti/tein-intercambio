<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\Exchange;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BudgetController extends Controller
{
    public function store(Request $request, Exchange $exchange)
    {
        if (Auth::user()->type !== 'admin' && $exchange->user_id !== Auth::id()) {
            abort(403);
        }

        $data = $request->validate([
            'category' => 'required|string',
            'planned_amount' => 'required|numeric|min:0',
            'spent_amount' => 'nullable|numeric|min:0',
            'period' => 'nullable|string'
        ]);

        $exchange->budgets()->create($data);

        return back()->with('success', 'Orçamento adicionado!');
    }

    public function update(Request $request, Budget $budget)
    {
        if (Auth::user()->type !== 'admin' && $budget->exchange->user_id !== Auth::id()) {
            abort(403);
        }

        $data = $request->validate([
            'category' => 'sometimes|string',
            'planned_amount' => 'sometimes|numeric|min:0',
            'spent_amount' => 'nullable|numeric|min:0',
            'period' => 'nullable|string'
        ]);

        $budget->update($data);

        return back()->with('success', 'Orçamento atualizado!');
    }

    public function destroy(Budget $budget)
    {
        if (Auth::user()->type !== 'admin' && $budget->exchange->user_id !== Auth::id()) {
            abort(403);
        }

        $budget->delete();

        return back()->with('success', 'Orçamento removido!');
    }
}
