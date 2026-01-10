<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Models\TripMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TripMemberController extends Controller
{
    public function store(Request $request, Trip $trip)
    {
        if (Auth::user()->type !== 'admin' && $trip->user_id !== Auth::id()) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'user_id' => 'nullable|exists:users,id'
        ]);

        $nameToCheck = trim($data['name']);

        // Check for duplicates by user_id OR name (case insensitive)
        $query = $trip->members()->where(function ($q) use ($nameToCheck, $data) {
            $q->where('name', 'ILIKE', $nameToCheck); // PostgreSQL case-insensitive
            if (!empty($data['user_id'])) {
                $q->orWhere('user_id', $data['user_id']);
            }
        });

        // Use 'LIKE' for MySQL/SQLite if not using Postgres, or strtolower comparison in PHP if DB unsure.
        // Assuming MySQL/SQLite default collation is usually case-insensitive, but let's be safe.
        // Since we don't know the DB driver for sure, let's do a reliable PHP check if the dataset is small (it is for trip members).

        $exists = $trip->members->filter(function ($member) use ($nameToCheck, $data) {
            $nameMatch = strcasecmp($member->name, $nameToCheck) === 0;
            $idMatch = !empty($data['user_id']) && $member->user_id == $data['user_id'];
            return $nameMatch || $idMatch;
        })->isNotEmpty();

        if ($exists) {
            return back()->with('error', 'Este participante já foi adicionado à viagem.');
        }

        $trip->members()->create($data);

        return back()->with('success', 'Membro adicionado com sucesso!');
    }

    public function destroy(TripMember $member)
    {
        if (Auth::user()->type !== 'admin' && $member->trip->user_id !== Auth::id()) {
            abort(403);
        }

        if ($member->tasks()->count() > 0) {
            return back()->with('error', 'Não é possível remover: O participante possui tarefas (checklist) atribuídas.');
        }

        if ($member->purchases()->count() > 0) {
            return back()->with('error', 'Não é possível remover: O participante possui compras atribuídas.');
        }

        if ($member->documents()->count() > 0) {
            return back()->with('error', 'Não é possível remover: O participante possui documentos atribuídos.');
        }

        $member->delete();

        return back()->with('success', 'Membro removido.');
    }
}
