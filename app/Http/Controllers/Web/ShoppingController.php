<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\ShoppingItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class ShoppingController extends Controller
{

    public function index()
    {
        $user = Auth::user();
        $familyId = $user->family_id;

        $items = ShoppingItem::query()
            ->when($familyId, function ($query) use ($familyId) {
                // Get all users in the family
                $userIds = User::where('family_id', $familyId)->pluck('id');
                return $query->whereIn('user_id', $userIds);
            }, function ($query) use ($user) {
                // Fallback to only own items
                return $query->where('user_id', $user->id);
            })
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
            'is_on_list' => true, // Improved UX: Add to list immediately
            'is_checked' => false,
        ]);

        return back()->with('success', 'Item adicionado à lista!');
    }

    public function update(Request $request, ShoppingItem $shoppingItem)
    {
        $user = Auth::user();

        // Ownership or Family check
        $isOwner = $shoppingItem->user_id == $user->id;
        $isFamily = $user->family_id && $shoppingItem->user?->family_id == $user->family_id;

        \Illuminate\Support\Facades\Log::info('Shopping Update Check', [
            'item_id' => $shoppingItem->id,
            'user_id' => $user->id,
            'item_user_id' => $shoppingItem->user_id,
            'user_family' => $user->family_id,
            'item_user_family' => $shoppingItem->user?->family_id, // This triggers a query if not loaded
            'isOwner' => $isOwner,
            'isFamily' => $isFamily
        ]);

        if (!$isOwner && !$isFamily) {
            abort(403);
        }

        $shoppingItem->update($request->only(['is_on_list', 'is_checked']));

        return back();
    }

    public function destroy(ShoppingItem $shoppingItem)
    {
        $user = Auth::user();

        $isOwner = $shoppingItem->user_id == $user->id;
        $isFamily = $user->family_id && $shoppingItem->user?->family_id == $user->family_id;

        if (!$isOwner && !$isFamily) {
            \Illuminate\Support\Facades\Log::warning('Shopping Destroy Forbidden', [
                'user' => $user->id,
                'item_user' => $shoppingItem->user_id
            ]);
            abort(403);
        }

        $shoppingItem->delete();
        return back()->with('success', 'Item removido.');
    }
    public function uncheckAll()
    {
        $user = Auth::user();
        $familyId = $user->family_id;

        ShoppingItem::query()
            ->when($familyId, function ($query) use ($familyId) {
                $userIds = User::where('family_id', $familyId)->pluck('id');
                return $query->whereIn('user_id', $userIds);
            }, function ($query) use ($user) {
                return $query->where('user_id', $user->id);
            })
            ->where('is_checked', true)
            ->update(['is_checked' => false]);

        return back()->with('success', 'Todos os itens foram desmarcados.');
    }
}
