<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function create()
    {
        return Inertia::render('Auth/Login', [
            'canRegister' => env('ALLOW_REGISTRATION', false),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    public function registerCreate()
    {
        if (!env('ALLOW_REGISTRATION', false)) {
            abort(404);
        }
        return Inertia::render('Auth/Register');
    }

    public function registerStore(Request $request)
    {
        if (!env('ALLOW_REGISTRATION', false)) {
            abort(404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:' . \App\Models\User::class,
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
            'phone' => 'nullable|string|max:20',
        ]);

        $user = \App\Models\User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
            'phone' => $request->phone,
            'type' => 'student', // Default type
            'status' => 'planning',
        ]);

        Auth::login($user);

        return redirect(route('dashboard'));
    }

    public function redirectToGoogle()
    {
        return \Laravel\Socialite\Facades\Socialite::driver('google')
            ->scopes(['https://www.googleapis.com/auth/drive.file']) // Request Drive scope immediately
            ->with(['access_type' => 'offline', 'prompt' => 'consent select_account']) // Refresh token
            ->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            /** @var \Laravel\Socialite\Two\User $googleUser */
            $googleUser = \Laravel\Socialite\Facades\Socialite::driver('google')->user();

            $user = \App\Models\User::where('google_id', $googleUser->id)
                ->orWhere('email', $googleUser->email)
                ->first();

            if ($user) {
                // Update tokens
                $user->update([
                    'google_id' => $googleUser->id,
                    'google_token' => $googleUser->token,
                    'google_refresh_token' => $googleUser->refreshToken,
                ]);
            } else {
                // Create user
                $user = \App\Models\User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(24)), // Random password
                    'google_id' => $googleUser->id,
                    'google_token' => $googleUser->token,
                    'google_refresh_token' => $googleUser->refreshToken,
                    'type' => 'student',
                    'status' => 'planning',
                    'email_verified_at' => now(),
                ]);
            }

            // Sync Family Membership based on email invitation
            $memberRecord = \App\Models\FamilyMember::where('email', $user->email)->first();
            if ($memberRecord) {
                if (!$user->family_id) {
                    $user->update(['family_id' => $memberRecord->family_id]);
                }
                if (!$memberRecord->user_id) {
                    $memberRecord->update(['user_id' => $user->id]);
                }
            }

            Auth::login($user);

            return redirect()->intended(route('dashboard'));

        } catch (\Exception $e) {
            return redirect(route('login'))->withErrors(['email' => 'Unable to login with Google: ' . $e->getMessage()]);
        }
    }
}
