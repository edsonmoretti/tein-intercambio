<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ExchangeController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\HousingController;
use App\Http\Controllers\Api\EventController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    Route::apiResource('exchanges', ExchangeController::class);
    Route::apiResource('documents', DocumentController::class);
    Route::apiResource('tasks', TaskController::class);
    Route::apiResource('purchases', PurchaseController::class);
    Route::apiResource('budgets', BudgetController::class);
    Route::apiResource('housings', HousingController::class);
    Route::apiResource('events', EventController::class);
});
