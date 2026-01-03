<?php

use App\Http\Controllers\Admin\AdminSubscriptionController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\ImpersonationController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Client\DashboardController;
use App\Http\Controllers\Client\PaymentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Payment
    Route::post('/payment/order', [PaymentController::class, 'createOrder']);
    Route::post('/payment/verify', [PaymentController::class, 'verify']);

    // Impersonation
    Route::post('/impersonate/exit', [ImpersonationController::class, 'exit']);

    
});

Route::middleware(['auth:sanctum', 'module:sales'])->get('/sales', fn () => []);

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    
    // Users
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/users/{id}', [AdminUserController::class, 'show']);

    // Impersonation
    Route::post('/impersonate/{userId}', [ImpersonationController::class, 'impersonate']);

    // Subscriptions
    Route::get('/subscriptions', [AdminSubscriptionController::class, 'index']);

});