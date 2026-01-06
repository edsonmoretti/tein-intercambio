<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Web\AuthController;
use App\Http\Controllers\Web\ExchangeController;
use App\Http\Controllers\Web\TaskController;
use App\Http\Controllers\Web\PurchaseController;
use App\Http\Controllers\Web\DocumentController;
use App\Http\Controllers\Web\ProfileController;

Route::middleware('guest')->group(function () {
    Route::get('/', function () {
        return redirect()->route('login');
    });
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store']);
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');

    Route::resource('exchanges', ExchangeController::class);

    // Sub-resources for Exchanges
    Route::post('/exchanges/{exchange}/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::put('/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');

    Route::post('/exchanges/{exchange}/purchases', [PurchaseController::class, 'store'])->name('purchases.store');
    Route::put('/purchases/{purchase}', [PurchaseController::class, 'update'])->name('purchases.update');
    Route::delete('/purchases/{purchase}', [PurchaseController::class, 'destroy'])->name('purchases.destroy');

    Route::post('/exchanges/{exchange}/documents', [DocumentController::class, 'store'])->name('documents.store');
    Route::put('/documents/{document}', [DocumentController::class, 'update'])->name('documents.update');
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');

    Route::post('/exchanges/{exchange}/budgets', [\App\Http\Controllers\Web\BudgetController::class, 'store'])->name('budgets.store');
    Route::put('/budgets/{budget}', [\App\Http\Controllers\Web\BudgetController::class, 'update'])->name('budgets.update');
    Route::delete('/budgets/{budget}', [\App\Http\Controllers\Web\BudgetController::class, 'destroy'])->name('budgets.destroy');

    Route::post('/exchanges/{exchange}/housings', [\App\Http\Controllers\Web\HousingController::class, 'store'])->name('housings.store');
    Route::put('/housings/{housing}', [\App\Http\Controllers\Web\HousingController::class, 'update'])->name('housings.update');
    Route::delete('/housings/{housing}', [\App\Http\Controllers\Web\HousingController::class, 'destroy'])->name('housings.destroy');

    Route::post('/exchanges/{exchange}/events', [\App\Http\Controllers\Web\EventController::class, 'store'])->name('events.store');
    Route::put('/events/{event}', [\App\Http\Controllers\Web\EventController::class, 'update'])->name('events.update');
    Route::delete('/events/{event}', [\App\Http\Controllers\Web\EventController::class, 'destroy'])->name('events.destroy');

    Route::post('/exchanges/{exchange}/members', [\App\Http\Controllers\Web\ExchangeMemberController::class, 'store'])->name('exchange-members.store');
    Route::delete('/exchange-members/{member}', [\App\Http\Controllers\Web\ExchangeMemberController::class, 'destroy'])->name('exchange-members.destroy');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});