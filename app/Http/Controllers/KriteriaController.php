<?php

namespace App\Http\Controllers;

use App\Models\Kriteria;
use App\Services\AhpCalculationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KriteriaController extends Controller
{
    public function __construct(
        protected AhpCalculationService $ahpService
    ) {}

    public function index(): Response
    {
        $kriterias = Kriteria::with('subKriterias')->orderBy('id', 'asc')->get();
        $ahpMatrix = $this->ahpService->calculate();

        return Inertia::render('Kriteria/Index', [
            'kriterias' => $kriterias,
            'ahp' => $ahpMatrix,
        ]);
    }

    /**
     * Simpan matriks perbandingan berpasangan AHP, hitung bobot & CR,
     * dan terapkan ke bobot_ahp + SAW jika konsisten (CR <= 0.10).
     */
    public function updateAhp(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'comparisons' => ['required', 'array', 'min:1'],
            'comparisons.*.kriteria_1_id' => ['required', 'integer', 'exists:kriterias,id'],
            'comparisons.*.kriteria_2_id' => ['required', 'integer', 'exists:kriterias,id', 'different:comparisons.*.kriteria_1_id'],
            'comparisons.*.nilai' => ['required', 'numeric', 'min:0.1111', 'max:9'],
        ]);

        $result = $this->ahpService->saveAndCalculate($validated['comparisons']);

        if ($result['is_consistent']) {
            return redirect()->route('kriteria.index')->with(
                'success',
                sprintf(
                    'Matriks AHP konsisten (CR = %.4f ≤ 0.10). Bobot kriteria dan ranking SAW telah diperbarui.',
                    $result['cr']
                )
            );
        }

        return redirect()->route('kriteria.index')->with(
            'warning',
            sprintf(
                'Matriks tersimpan, namun belum konsisten (CR = %.4f > 0.10). Bobot kriteria dan ranking SAW tidak diubah sampai matriks konsisten.',
                $result['cr']
            )
        );
    }
}
