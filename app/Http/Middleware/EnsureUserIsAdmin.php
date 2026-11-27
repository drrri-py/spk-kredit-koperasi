<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Tangani request yang masuk.
     * Hanya izinkan pengguna dengan role 'admin' yang dapat melanjutkan.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            // Jika bukan admin, tolak akses dengan pesan 403 Forbidden
            abort(403, 'Akses Ditolak: Halaman ini hanya diperuntukkan bagi Petugas Analis Kredit / Pengurus Koperasi.');
        }

        return $next($request);
    }
}