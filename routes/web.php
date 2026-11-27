<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\KriteriaController;
use App\Http\Controllers\DebiturController;
use App\Http\Controllers\SpkSawController;
use App\Models\Debitur;
use App\Models\SawResult;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Alihkan halaman utama ke dashboard
Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {

    // 1. Dashboard Router Sesuai Role (Admin vs Anggota)
    Route::get('/dashboard', function () {
        $user = Auth::user();

        if ($user && $user->role === 'anggota') {
            return redirect()->route('anggota.dashboard');
        }

        // Dashboard Khusus Petugas Analis Kredit
        $totalDebitur = Debitur::count();
        $totalPengajuan = Debitur::sum('nominal_pengajuan');
        $totalLayak = SawResult::where('status_kelayakan', 'LAYAK')->count();
        $totalDipertimbangkan = SawResult::where('status_kelayakan', 'DIPERTIMBANGKAN')->count();
        $totalTidakLayak = SawResult::where('status_kelayakan', 'TIDAK LAYAK')->count();
        $totalPlafonDisetujui = SawResult::sum('rekomendasi_plafon');

        $latestDebitur = Debitur::with('sawResult')
            ->latest()
            ->take(5)
            ->get();

        $ahpResult = app(\App\Services\AhpCalculationService::class)->calculate();

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_debitur' => $totalDebitur,
                'total_pengajuan' => (float) $totalPengajuan,
                'total_layak' => $totalLayak,
                'total_dipertimbangkan' => $totalDipertimbangkan,
                'total_tidak_layak' => $totalTidakLayak,
                'total_plafon_disetujui' => (float) $totalPlafonDisetujui,
            ],
            'latest_debiturs' => $latestDebitur,
            'ahp' => [
                'cr' => $ahpResult['cr'],
                'is_consistent' => $ahpResult['is_consistent'],
            ],
        ]);
    })->name('dashboard');

    // 2. Portal Layanan Anggota Koperasi
    Route::get('/anggota/dashboard', function () {
        $user = Auth::user();
        $noAnggota = $user ? $user->no_anggota : null;

        $debitur = Debitur::with(['sawResult', 'penilaianDetails.kriteria'])
            ->where('no_anggota', $noAnggota)
            ->latest()
            ->first();

        $hasActiveLoan = Debitur::where('no_anggota', $noAnggota)
            ->where('status_pelunasan', '!=', 'lunas')
            ->exists();

        return Inertia::render('Anggota/Dashboard', [
            'debitur' => $debitur,
            'can_apply' => !$hasActiveLoan,
        ]);
    })->name('anggota.dashboard');

    // 3. Pengajuan Pinjaman Mandiri oleh Anggota
    Route::get('/anggota/pengajuan', [DebiturController::class, 'createMandiri'])->name('anggota.pengajuan');
    Route::post('/anggota/pengajuan', [DebiturController::class, 'storeMandiri'])->name('anggota.pengajuan.store');

    // 4. Panduan Alur Sistem (SOP)
    Route::get('/panduan', function () {
        return Inertia::render('Panduan/Index');
    })->name('panduan.index');

    // =========================================================================
    // 5. RUTE KHUSUS PETUGAS ANALIS KREDIT / ADMIN (TERPROTEKSI MIDDLEWARE)
    // =========================================================================
    Route::middleware(['admin'])->group(function () {
        // Master Kriteria & AHP
        Route::get('/kriteria', [KriteriaController::class, 'index'])->name('kriteria.index');
        Route::post('/kriteria/ahp', [KriteriaController::class, 'updateAhp'])->name('kriteria.ahp.update');

        // Manajemen Debitur
        Route::get('/debitur', [DebiturController::class, 'index'])->name('debitur.index');
        Route::get('/debitur/tambah', [DebiturController::class, 'create'])->name('debitur.create');
        Route::post('/debitur', [DebiturController::class, 'store'])->name('debitur.store');
        Route::get('/debitur/{id}/edit', [DebiturController::class, 'edit'])->name('debitur.edit');
        Route::put('/debitur/{id}', [DebiturController::class, 'update'])->name('debitur.update');
        Route::patch('/debitur/{id}/pelunasan', [DebiturController::class, 'togglePelunasan'])->name('debitur.pelunasan');
        Route::delete('/debitur/{id}', [DebiturController::class, 'destroy'])->name('debitur.destroy');

        // SPK SAW & Laporan
        Route::get('/spk-saw', [SpkSawController::class, 'index'])->name('spk.index');
        Route::get('/spk-saw/cetak', [SpkSawController::class, 'cetak'])->name('spk.cetak');
        Route::get('/spk-saw/export-excel', [SpkSawController::class, 'exportExcel'])->name('spk.export');
    });

    // Profil Pengguna
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';