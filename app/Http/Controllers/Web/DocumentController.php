<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Models\Document;
use App\Models\User;
use App\Models\FamilyMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DocumentController extends Controller
{
    /**
     * Helper to resolve the efficient Google Drive Owner.
     * Rules:
     * 1. If user is in a family, find the PRIMARY MEMBER of that family and return their USER account.
     * 2. If user is NOT in a family, or no primary found, return the user themselves.
     */
    private function getFamilyOwner(User $user): User
    {
        if ($user->family_id) {
            // Find the primary member for this family
            $primaryMember = FamilyMember::where('family_id', $user->family_id)
                ->where('is_primary', true)
                ->first();

            if ($primaryMember && $primaryMember->user_id) {
                // Return the User associated with the primary member
                return User::find($primaryMember->user_id) ?? $user;
            }
        }

        return $user;
    }

    public function store(Request $request, Trip $trip)
    {
        if (Auth::user()->type !== 'admin' && $trip->user_id !== Auth::id()) {
            // Relaxed check: Allow family members to upload to trips owned by family
            $user = Auth::user();
            if ($user->family_id && $trip->user->family_id === $user->family_id) {
                // Allowed
            } else {
                abort(403);
            }
        }

        $data = $request->validate([
            'type' => 'required|string',
            'is_mandatory' => 'boolean',
            'expiration_date' => 'nullable|date',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'trip_member_id' => 'nullable'
        ]);

        $driveService = null;

        // Resolve the Drive Owner (The Family Head)
        $driveOwner = $this->getFamilyOwner(Auth::user());

        if ($driveOwner->google_token) {
            $driveService = new \App\Services\GoogleDriveService($driveOwner->google_token);
        } else {
            $msg = $driveOwner->id === Auth::id()
                ? 'Você precisa conectar sua conta do Google para enviar documentos.'
                : 'O administrador da família precisa conectar a conta do Google para permitir envios.';

            return back()->withErrors(['file' => $msg]);
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
                return back()->withErrors(['file' => 'A sessão do Google do administrador da família expirou.']);
            }
            return back()->withErrors(['file' => 'Erro do Google Drive: ' . $e->getMessage()]);
        } catch (\Exception $e) {
            return back()->withErrors(['file' => 'Erro ao enviar para o Google Drive: ' . $e->getMessage()]);
        }

        return back()->with('success', 'Documento(s) adicionado(s)!');
    }

    public function update(Request $request, Document $document)
    {
        // Family authorization check
        $user = Auth::user();
        $isFamilyAuth = ($user->family_id && $document->trip->user->family_id === $user->family_id);

        if ($user->type !== 'admin' && $document->trip->user_id !== Auth::id() && !$isFamilyAuth) {
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
            // Resolve Owner
            $driveOwner = $this->getFamilyOwner(Auth::user());

            if ($driveOwner->google_token) {
                $driveService = new \App\Services\GoogleDriveService($driveOwner->google_token);

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
                $msg = $driveOwner->id === Auth::id()
                    ? 'Você precisa conectar sua conta do Google para enviar documentos.'
                    : 'O administrador da família precisa conectar a conta do Google para permitir envios.';
                return back()->withErrors(['file' => $msg]);
            }
        }

        $document->update($data);

        return back()->with('success', 'Documento atualizado!');
    }

    public function destroy(Document $document)
/    {
        // Family authorization check
        $user = Auth::user();
        $isFamilyAuth = ($user->family_id && $document->trip->user->family_id === $user->family_id);

        if ($user->type !== 'admin' && $document->trip->user_id !== Auth::id() && !$isFamilyAuth) {
            abort(403);
        }

        // Try to delete from Google Drive if it's a Drive link
        if ($document->file_path && str_contains($document->file_path, 'drive.google.com')) {
            // Resolve Owner
            $driveOwner = $this->getFamilyOwner(Auth::user());

            if ($driveOwner->google_token) {
                try {
                    $driveService = new \App\Services\GoogleDriveService($driveOwner->google_token);
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
