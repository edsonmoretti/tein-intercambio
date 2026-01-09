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
            'trip_member_id' => 'nullable' // Can be 'all' or specific ID or null
        ]);

        $status = 'pending';
        $path = null;
        $driveService = null;

        // Initialize Google Drive Service if user has token
        if (Auth::user()->google_token) {
            $driveService = new \App\Services\GoogleDriveService(Auth::user()->google_token);
        } else {
            // Force Google Auth if token is missing
            return back()->withErrors([
                'file' => 'Você precisa conectar sua conta do Google para enviar documentos.
            Por favor, faça logout e login novamente com o Google e conceda permissão para o Google Drive.'
            ]);
        }

        if ($request->hasFile('file')) {
            try {
                // 1. Find or Create "Intercambios" root folder (optional, or just use root)
                // For now, let's just create a folder for the Trip
                $tripFolderName = 'Intercambio - ' . $trip->destination . ' (' . $trip->start_date->format('Y') . ')';
                $tripFolderId = $driveService->findFolderByName($tripFolderName);

                if (!$tripFolderId) {
                    $tripFolder = $driveService->createFolder($tripFolderName);
                    $tripFolderId = $tripFolder->id;
                }

                // 2. Upload file
                $uploadedFile = $driveService->uploadFile($request->file('file'), $tripFolderId);

                // Use webViewLink as the path/url
                $path = $uploadedFile->webViewLink;
                $status = 'sent';

            } catch (\Google\Service\Exception $e) {
                if ($e->getCode() == 401) {
                    return back()->withErrors(['file' => 'Sua sessão do Google expirou. Por favor, faça logout e login novamente.']);
                }
                return back()->withErrors(['file' => 'Erro do Google Drive: ' . $e->getMessage()]);
            } catch (\Exception $e) {
                return back()->withErrors(['file' => 'Erro ao enviar para o Google Drive: ' . $e->getMessage()]);
            }
        }

        $membersToAssign = [];
        if ($data['trip_member_id'] === 'all') {
            $membersToAssign = $trip->members()->pluck('id')->toArray();
        } elseif (!empty($data['trip_member_id'])) {
            $membersToAssign = [$data['trip_member_id']];
        }

        // If no member selected (or empty list), just create one generic/unassigned
        if (empty($membersToAssign)) {
            $trip->documents()->create([
                'type' => $data['type'],
                'is_mandatory' => $data['is_mandatory'] ?? false,
                'expiration_date' => $data['expiration_date'] ?? null,
                'file_path' => $path,
                'status' => $status,
                'trip_member_id' => null
            ]);
        } else {
            foreach ($membersToAssign as $memberId) {
                // If uploading a file for MULTIPLE people, loop through.
                // Note: On Drive it will be the SAME link for everyone.

                $trip->documents()->create([
                    'type' => $data['type'],
                    'is_mandatory' => $data['is_mandatory'] ?? false,
                    'expiration_date' => $data['expiration_date'] ?? null,
                    'file_path' => $path,
                    'status' => $status,
                    'trip_member_id' => $memberId
                ]);
            }
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
                    $tripFolderName = 'Intercambio - ' . $document->trip->destination;
                    $tripFolderId = $driveService->findFolderByName($tripFolderName);

                    if (!$tripFolderId) {
                        $tripFolder = $driveService->createFolder($tripFolderName);
                        $tripFolderId = $tripFolder->id;
                    }

                    $uploadedFile = $driveService->uploadFile($request->file('file'), $tripFolderId);
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
