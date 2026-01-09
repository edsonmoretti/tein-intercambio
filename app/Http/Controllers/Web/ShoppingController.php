<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\ShoppingItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ShoppingController extends Controller
{
    public function index()
    {
        $items = ShoppingItem::where('user_id', Auth::id())
            ->orderBy('name')
            ->get();

        return Inertia::render('Shopping/Index', [
            'items' => $items
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        ShoppingItem::create([
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'is_on_list' => false, // Default to just catalog? Request said "register items", then "checklist for members". Let's assume catalog first? Or straight to list?
            // "Terá uma aba para cadastrar itens de feira mensal ... terá uma aba para checklist"
            // So: Catalog (is_on_list=false?) vs Checklist (is_on_list=true)
            // Actually, if it's "Monthly Shopping", maybe items are always there but toggled?
            // Let's assume newly added items are just "Registered" (is_on_list = false) until moved to list?
            // Or maybe default to TRUE since they are adding it. Let's default to false (Catalog) as per "Tab to register" vs "Tab for checklist".
            'is_on_list' => false,
            'is_checked' => false,
        ]);

        return back()->with('success', 'Item cadastrado com sucesso!');
    }

    public function update(Request $request, ShoppingItem $shoppingItem)
    {
        if ($shoppingItem->user_id !== Auth::id())
            abort(403);

        $shoppingItem->update($request->only(['is_on_list', 'is_checked']));

        return back(); // Silent update usually
    }

    public function destroy(ShoppingItem $shoppingItem)
    {
        if ($shoppingItem->user_id !== Auth::id())
            abort(403);
        $shoppingItem->delete();
        return back()->with('success', 'Item removido.');
    }
}
