<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'no_anggota' => 'required|string|max:50|unique:users,no_anggota',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'no_anggota.required' => 'Nomor Anggota Koperasi wajib diisi.',
            'no_anggota.unique' => 'Nomor Anggota Koperasi ini sudah terdaftar.',
            'email.unique' => 'Alamat email ini sudah terdaftar.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
        ]);

        $user = User::create([
            'name' => $request->name,
            'no_anggota' => trim($request->no_anggota),
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'anggota', // Selalu otomatis diset sebagai anggota koperasi
        ]);

        event(new Registered($user));

        Auth::login($user);

        // Langsung dialihkan ke router dashboard (yang akan mengarahkan anggota ke /anggota/dashboard)
        return redirect()->route('dashboard');
    }
}