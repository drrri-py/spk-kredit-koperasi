<?php

namespace App\Http\Controllers;

use App\Models\Debitur;
use App\Models\Kriteria;
use App\Models\PenilaianDetail;
use App\Models\SawResult;
use App\Services\SawCalculationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DebiturController extends Controller
{
    protected SawCalculationService $sawService;

    public function __construct(SawCalculationService $sawService)
    {
        $this->sawService = $sawService;
    }

    public function index(): Response
    {
        $debiturs = Debitur::with(['penilaianDetails.kriteria', 'sawResult'])
            ->latest()
            ->get();

        return Inertia::render('Debitur/Index', [
            'debiturs' => $debiturs
        ]);
    }

    public function create(): Response
    {
        $kriterias = Kriteria::with('subKriterias')->get();

        return Inertia::render('Debitur/Create', [
            'kriterias' => $kriterias
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'no_anggota' => 'required|string|max:30',
            'nama_lengkap' => 'required|string|max:100',
            'nik' => 'nullable|string|max:20',
            'unit_kerja' => 'nullable|string|max:100',
            'alamat' => 'required|string',
            'telepon' => 'required|string|max:20',
            'nominal_pengajuan' => 'required|numeric|min:500000',
            'tenor_bulan' => 'required|integer|min:1',
            'penilaian' => 'required|array',
            'penilaian.*' => 'required|numeric',
        ]);

        DB::transaction(function () use ($request) {
            $debitur = Debitur::create([
                'user_id' => Auth::id(),
                'no_anggota' => $request->no_anggota,
                'nama_lengkap' => $request->nama_lengkap,
                'nik' => $request->nik,
                'unit_kerja' => $request->unit_kerja,
                'alamat' => $request->alamat,
                'telepon' => $request->telepon,
                'nominal_pengajuan' => $request->nominal_pengajuan,
                'tenor_bulan' => $request->tenor_bulan,
                'status_verifikasi' => 'diverifikasi',
            ]);

            foreach ($request->penilaian as $kriteriaId => $nilaiSkor) {
                PenilaianDetail::create([
                    'debitur_id' => $debitur->id,
                    'kriteria_id' => $kriteriaId,
                    'nilai_skor' => $nilaiSkor,
                ]);
            }
        });

        $this->sawService->calculateAndSave();

        return redirect()->route('spk.index')->with('success', 'Data debitur dan penilaian kriteria berhasil disimpan.');
    }

    public function edit(int $id): Response
    {
        $debitur = Debitur::with('penilaianDetails')->findOrFail($id);
        $kriterias = Kriteria::with('subKriterias')->get();

        $penilaianMap = [];
        foreach ($debitur->penilaianDetails as $detail) {
            $penilaianMap[$detail->kriteria_id] = (int) $detail->nilai_skor;
        }

        return Inertia::render('Debitur/Edit', [
            'debitur' => $debitur,
            'kriterias' => $kriterias,
            'initial_penilaian' => $penilaianMap,
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $debitur = Debitur::findOrFail($id);

        $request->validate([
            'no_anggota' => 'required|string|max:30',
            'nama_lengkap' => 'required|string|max:100',
            'nik' => 'nullable|string|max:20',
            'unit_kerja' => 'nullable|string|max:100',
            'alamat' => 'required|string',
            'telepon' => 'required|string|max:20',
            'nominal_pengajuan' => 'required|numeric|min:500000',
            'tenor_bulan' => 'required|integer|min:1',
            'penilaian' => 'required|array',
            'penilaian.*' => 'required|numeric',
        ]);

        DB::transaction(function () use ($request, $debitur) {
            $debitur->update([
                'no_anggota' => $request->no_anggota,
                'nama_lengkap' => $request->nama_lengkap,
                'nik' => $request->nik,
                'unit_kerja' => $request->unit_kerja,
                'alamat' => $request->alamat,
                'telepon' => $request->telepon,
                'nominal_pengajuan' => $request->nominal_pengajuan,
                'tenor_bulan' => $request->tenor_bulan,
                'status_verifikasi' => 'diverifikasi',
            ]);

            foreach ($request->penilaian as $kriteriaId => $nilaiSkor) {
                PenilaianDetail::updateOrCreate(
                    [
                        'debitur_id' => $debitur->id,
                        'kriteria_id' => $kriteriaId,
                    ],
                    ['nilai_skor' => $nilaiSkor]
                );
            }
        });

        $this->sawService->calculateAndSave();

        return redirect()->route('debitur.index')->with('success', 'Data debitur dan penilaian kriteria berhasil diperbarui.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $debitur = Debitur::findOrFail($id);

        DB::transaction(function () use ($debitur) {
            PenilaianDetail::where('debitur_id', $debitur->id)->delete();
            SawResult::where('debitur_id', $debitur->id)->delete();
            $debitur->delete();
        });

        $this->sawService->calculateAndSave();

        return redirect()->route('debitur.index')->with('success', 'Data debitur berhasil dihapus.');
    }

    /**
     * Ubah status pelunasan pinjaman debitur oleh admin
     */
    public function togglePelunasan(int $id): RedirectResponse
    {
        $debitur = Debitur::findOrFail($id);

        $newStatus = $debitur->status_pelunasan === 'lunas' ? 'belum_lunas' : 'lunas';
        $debitur->update(['status_pelunasan' => $newStatus]);

        $message = $newStatus === 'lunas'
            ? "Pinjaman {$debitur->nama_lengkap} ({$debitur->no_anggota}) ditandai LUNAS. Anggota kini dapat mengajukan pinjaman baru."
            : "Status pelunasan {$debitur->nama_lengkap} ({$debitur->no_anggota}) dikembalikan menjadi BELUM LUNAS.";

        return redirect()->route('debitur.index')->with('success', $message);
    }

    /**
     * Tampilkan formulir pengajuan pinjaman mandiri anggota
     */
    public function createMandiri(): Response|RedirectResponse
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        $existingDebitur = Debitur::where('no_anggota', $user->no_anggota)
            ->where('status_pelunasan', '!=', 'lunas')
            ->latest()
            ->first();

        // Kirim status apakah anggota sudah memiliki pinjaman aktif (belum lunas)
        return Inertia::render('Anggota/Pengajuan', [
            'user' => $user,
            'existingDebitur' => $existingDebitur,
            'hasActiveLoan' => $existingDebitur !== null,
        ]);
    }

    /**
     * Simpan formulir pengajuan pinjaman mandiri dari anggota
     */
    public function storeMandiri(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $existingDebitur = Debitur::where('no_anggota', $user->no_anggota)
            ->where('status_pelunasan', '!=', 'lunas')
            ->latest()
            ->first();
        if ($existingDebitur) {
            return redirect()->route('anggota.dashboard')->with('error', 'Anda sudah memiliki berkas permohonan pinjaman aktif yang belum lunas.');
        }

        $request->validate([
            'nik' => 'required|string|max:20',
            'unit_kerja' => 'required|string|max:100',
            'alamat' => 'required|string',
            'telepon' => 'required|string|max:20',
            'nominal_pengajuan' => 'required|numeric|min:500000',
            'tenor_bulan' => 'required|integer|min:1|max:60',
        ], [
            'nominal_pengajuan.min' => 'Nominal pengajuan minimal adalah Rp 500.000.',
            'tenor_bulan.max' => 'Maksimal jangka waktu tenor pinjaman adalah 60 bulan.',
        ]);

        Debitur::create([
            'user_id' => $user->id,
            'no_anggota' => $user->no_anggota,
            'nama_lengkap' => $user->name,
            'nik' => $request->nik,
            'unit_kerja' => $request->unit_kerja,
            'alamat' => $request->alamat,
            'telepon' => $request->telepon,
            'nominal_pengajuan' => $request->nominal_pengajuan,
            'tenor_bulan' => $request->tenor_bulan,
            'status_verifikasi' => 'menunggu_penilaian',
        ]);

        return redirect()->route('anggota.dashboard')->with('success', 'Permohonan pinjaman berhasil diajukan dan sedang menunggu verifikasi petugas analis kredit.');
    }
}