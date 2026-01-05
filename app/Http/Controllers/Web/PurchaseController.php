<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Exchange;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PurchaseController extends Controller
{
    public function store(Request $request, Exchange $exchange)
    {
        if (Auth::user()->type !== 'admin' && $exchange->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'item' => 'required|string',
            'category' => 'required|string',
            'estimated_cost' => 'required|numeric',
            'type' => 'required|in:before,after',
        ]);

        $exchange->purchases()->create($request->all());

        return back()->with('success', 'Compra planejada!');
    }

    public function update(Request $request, Purchase $purchase)
    {
        if (Auth::user()->type !== 'admin' && $purchase->exchange->user_id !== Auth::id()) {
            abort(403);
        }

        $purchase->update($request->all());

        return back()->with('success', 'Compra atualizada!');
    }

    public function destroy(Purchase $purchase)
    {
        if (Auth::user()->type !== 'admin' && $purchase->exchange->user_id !== Auth::id()) {
            abort(403);
        }

        $purchase->delete();

        return back()->with('success', 'Compra removida!');
    }
}
