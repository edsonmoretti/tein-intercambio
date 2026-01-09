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
        // If 'all', we treat as General Document (No specific member logic), 
        // effectively CASE 1. So we leave membersToAssign empty.
        // We only populate membersToAssign if a SPECIFIC member ID is provided.
        if (!empty($data['trip_member_id']) && $data['trip_member_id'] !== 'all') {
            $membersToAssign = $trip->members()->where('id', $data['trip_member_id'])->get();
        }

        try {
            $tripFolderId = $this->getTripFolderId($driveService, $trip);

            // CASE 1: No specific members (General Trip Document)
            if (empty($membersToAssign) || count($membersToAssign) === 0) {
                $status = 'pending';
                $path = null;

                if ($request->hasFile('file')) {
                    $path = $this->uploadDocumentFile($driveService, $request->file('file'), $tripFolderId, $data['type']);
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
                        // Folder: {MemberName}
                        $memberFolderId = $driveService->ensureFolder($member->name, $tripFolderId);
                        $path = $this->uploadDocumentFile($driveService, $request->file('file'), $memberFolderId, $data['type']);
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
                    $tripFolderId = $this->getTripFolderId($driveService, $document->trip);

                    $targetFolderId = $tripFolderId;
                    // If it belongs to a member, ensure Member folder
                    if ($document->tripMember) {
                        $targetFolderId = $driveService->ensureFolder($document->tripMember->name, $tripFolderId);
                    }

                    $docType = $data['type'] ?? $document->type;
                    $data['file_path'] = $this->uploadDocumentFile($driveService, $request->file('file'), $targetFolderId, $docType);
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

        // Try to delete from Google Drive if it's a Drive link
        if ($document->file_path && str_contains($document->file_path, 'drive.google.com')) {
            if (Auth::user()->google_token) {
                try {
                    $driveService = new \App\Services\GoogleDriveService(Auth::user()->google_token);
                    // Extract ID from URL
                    if (preg_match('/\/d\/([a-zA-Z0-9_-]+)/', $document->file_path, $matches)) {
                        $fileId = $matches[1];
                        $driveService->deleteFile($fileId);
                    }
                } catch (\Exception $e) {
                    // Log or ignore if already deleted
                }
            }
        } elseif ($document->file_path && !str_starts_with($document->file_path, 'http')) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return back()->with('success', 'Documento removido!');
    }

    /**
     * Helper to get or create the standard trip folder structure.
     * Structure: {APP_NAME} > Documentos > Viagens > {Place} - {City}, {Country} ({ID})
     */
    private function getTripFolderId(\App\Services\GoogleDriveService $driveService, Trip $trip)
    {
        $rootId = $driveService->ensureFolder(config('app.name'));
        $docsId = $driveService->ensureFolder('Documentos', $rootId);
        $viagensId = $driveService->ensureFolder('Viagens', $docsId);

        $placePrefix = $trip->place ? $trip->place . ' - ' : '';
        $tripFolderName = "{$placePrefix}{$trip->city}, {$trip->country} ({$trip->id})";

        return $driveService->ensureFolder($tripFolderName, $viagensId);
    }

    /**
     * Helper to upload a file with the standard naming convention.
     * Naming: {Type} - {OriginalName}
     */
    private function uploadDocumentFile(\App\Services\GoogleDriveService $driveService, \Illuminate\Http\UploadedFile $file, $folderId, $docType)
    {
        $fileName = $docType . ' - ' . $file->getClientOriginalName();
        $uploadedFile = $driveService->uploadFile($file, $folderId, $fileName);
        return $uploadedFile->webViewLink;
    }
}
