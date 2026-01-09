<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DocumentController extends Controller
{
    public function store(Request $request, Trip $trip)
    {
        if (Auth::user()->type !== 'admin' && $trip->user_id !== Auth::id()) {
            abort(403);
        }

        $data = $request->validate([
            'type' => 'required|string',
            'is_mandatory' => 'boolean',
            'expiration_date' => 'nullable|date',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'trip_member_id' => 'nullable'
        ]);

        $driveService = null;
        if (Auth::user()->google_token) {
            $driveService = new \App\Services\GoogleDriveService(Auth::user()->google_token);
        } else {
            return back()->withErrors([
                'file' => 'Você precisa conectar sua conta do Google para enviar documentos. 
            Por favor, faça logout e login novamente com o Google e conceda permissão para o Google Drive.'
            ]);
        }

        $membersToAssign = [];
        if ($data['trip_member_id'] === 'all') {
            $membersToAssign = $trip->members; // Get models
        } elseif (!empty($data['trip_member_id'])) {
            $membersToAssign = $trip->members()->where('id', $data['trip_member_id'])->get();
        }

        try {
            // Base Structure: {APP_NAME} > Viagens
            $rootId = $driveService->ensureFolder(config('app.name'));
            $viagensId = $driveService->ensureFolder('Viagens', $rootId);

            // Trip Folder: {Place} - {Country}, {City} ({ID})
            $placePrefix = $trip->place ? $trip->place . ' - ' : '';
            $tripFolderName = "{$placePrefix}{$trip->country}, {$trip->city} ({$trip->id})";
            $tripFolderId = $driveService->ensureFolder($tripFolderName, $viagensId);

            // Document Type Folder: {Nome do Documento}
            $typeFolderId = $driveService->ensureFolder($data['type'], $tripFolderId);

            // CASE 1: No specific members (General Trip Document)
            if (empty($membersToAssign) || count($membersToAssign) === 0) {
                $status = 'pending';
                $path = null;

                if ($request->hasFile('file')) {
                    $uploadedFile = $driveService->uploadFile($request->file('file'), $typeFolderId);
                    $path = $uploadedFile->webViewLink;
                    $status = 'sent';
                }

                $trip->documents()->create([
                    'type' => $data['type'],
                    'is_mandatory' => $data['is_mandatory'] ?? false,
                    'expiration_date' => $data['expiration_date'] ?? null,
                    'file_path' => $path,
                    'status' => $status,
                    'trip_member_id' => null
                ]);

            } else {
                // CASE 2: Assign to Members (Structure per user request)
                foreach ($membersToAssign as $member) {
                    $status = 'pending';
                    $path = null;

                    if ($request->hasFile('file')) {
                        $uploadedFile = $driveService->uploadFile($request->file('file'), $typeFolderId);
                        $path = $uploadedFile->webViewLink;
                        $status = 'sent';
                    }

                    $trip->documents()->create([
                        'type' => $data['type'],
                        'is_mandatory' => $data['is_mandatory'] ?? false,
                        'expiration_date' => $data['expiration_date'] ?? null,
                        'file_path' => $path,
                        'status' => $status,
                        'trip_member_id' => $member->id
                    ]);
                }
            }

        } catch (\Google\Service\Exception $e) {
            if ($e->getCode() == 401) {
                return back()->withErrors(['file' => 'Sua sessão do Google expirou. Por favor, faça logout e login novamente.']);
            }
            return back()->withErrors(['file' => 'Erro do Google Drive: ' . $e->getMessage()]);
        } catch (\Exception $e) {
            return back()->withErrors(['file' => 'Erro ao enviar para o Google Drive: ' . $e->getMessage()]);
        }

        return back()->with('success', 'Documento(s) adicionado(s)!');
    }

    public function update(Request $request, Document $document)
    {
        if (Auth::user()->type !== 'admin' && $document->trip->user_id !== Auth::id()) {
            abort(403);
        }

        $data = $request->validate([
            'type' => 'sometimes|string',
            'is_mandatory' => 'sometimes|boolean',
            'expiration_date' => 'nullable|date',
            'status' => 'sometimes|string',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        if ($request->hasFile('file')) {
            // TODO: Handle delete old file from Drive? Risk of deleting user data.
            // Ideally we just upload a new one and update the link.

            if (Auth::user()->google_token) {
                $driveService = new \App\Services\GoogleDriveService(Auth::user()->google_token);

                try {
                    // Base Structure: {APP_NAME} > Viagens
                    $rootId = $driveService->ensureFolder(config('app.name'));
                    $viagensId = $driveService->ensureFolder('Viagens', $rootId);

                    $trip = $document->trip;
                    $placePrefix = $trip->place ? $trip->place . ' - ' : '';
                    $tripFolderName = "{$placePrefix}{$trip->country}, {$trip->city} ({$trip->id})";
                    $tripFolderId = $driveService->ensureFolder($tripFolderName, $viagensId);

                    $docType = $data['type'] ?? $document->type;
                    $typeFolderId = $driveService->ensureFolder($docType, $tripFolderId);

                    $uploadedFile = $driveService->uploadFile($request->file('file'), $typeFolderId);
                    $data['file_path'] = $uploadedFile->webViewLink;
                    $data['status'] = 'sent';

                } catch (\Exception $e) {
                    return back()->withErrors(['file' => 'Erro ao enviar para o Google Drive: ' . $e->getMessage()]);
                }

            } else {
                return back()->withErrors(['file' => 'Você precisa conectar sua conta do Google para enviar documentos.']);
            }
        }

        $document->update($data);

        return back()->with('success', 'Documento atualizado!');
    }

    public function destroy(Document $document)
    {
        if (Auth::user()->type !== 'admin' && $document->trip->user_id !== Auth::id()) {
            abort(403);
        }

        // We do NOT delete files from User's Google Drive automatically to prevent data loss accidents.
        // Only delete if it's a local file.
        if ($document->file_path && !str_starts_with($document->file_path, 'http')) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return back()->with('success', 'Documento removido!');
    }
}
