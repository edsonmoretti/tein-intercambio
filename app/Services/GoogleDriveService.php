<?php

namespace App\Services;

use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Illuminate\Http\UploadedFile;

class GoogleDriveService
{
    protected $client;
    protected $service;

    public function __construct($accessToken)
    {
        $this->client = new Client();
        $this->client->setClientId(config('services.google.client_id'));
        $this->client->setClientSecret(config('services.google.client_secret'));
        $this->client->setAccessToken($accessToken);

        $this->service = new Drive($this->client);
    }

    public function createFolder($name, $parentId = null)
    {
        $fileMetadata = new DriveFile([
            'name' => $name,
            'mimeType' => 'application/vnd.google-apps.folder',
            'parents' => $parentId ? [$parentId] : []
        ]);

        return $this->service->files->create($fileMetadata, ['fields' => 'id']);
    }

    public function uploadFile(UploadedFile $file, $folderId = null)
    {
        $fileMetadata = new DriveFile([
            'name' => $file->getClientOriginalName(),
            'parents' => $folderId ? [$folderId] : []
        ]);

        $content = file_get_contents($file->getRealPath());

        return $this->service->files->create($fileMetadata, [
            'data' => $content,
            'mimeType' => $file->getMimeType(),
            'uploadType' => 'multipart',
            'fields' => 'id, webViewLink, webContentLink'
        ]);
    }

    public function ensureFolder($name, $parentId = null)
    {
        $folderId = $this->findFolderByName($name, $parentId);
        if ($folderId) {
            return $folderId;
        }
        $folder = $this->createFolder($name, $parentId);
        return $folder->id;
    }

    public function findFolderByName($name, $parentId = null)
    {
        $query = "mimeType='application/vnd.google-apps.folder' and name='" . str_replace("'", "\'", $name) . "' and trashed=false";
        if ($parentId) {
            $query .= " and '$parentId' in parents";
        }

        $results = $this->service->files->listFiles([
            'q' => $query,
            'spaces' => 'drive',
            'fields' => 'files(id, name)',
        ]);

        if (count($results->files) == 0) {
            return null;
        }

        return $results->files[0]->id;
    }
}
