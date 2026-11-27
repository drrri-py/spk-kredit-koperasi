<?php

namespace App\Http\Controllers;

use App\Models\Kriteria;
use Inertia\Inertia;
use Inertia\Response;

class KriteriaController extends Controller
{
    public function index(): Response
    {
        $kriterias = Kriteria::with('subKriterias')->get();

        // Data Matriks Perbandingan Berpasangan AHP (5x5) untuk Uji Konsistensi (CR)
        $ahpMatrix = [
            'kriterias' => ['C1', 'C2', 'C3', 'C4', 'C5'],
            'matrix' => [
                'C1' => ['C1' => 1.00, 'C2' => 3.00, 'C3' => 3.00, 'C4' => 2.00, 'C5' => 4.00],
                'C2' => ['C1' => 0.33, 'C2' => 1.00, 'C3' => 1.00, 'C4' => 0.50, 'C5' => 2.00],
                'C3' => ['C1' => 0.33, 'C2' => 1.00, 'C3' => 1.00, 'C4' => 0.50, 'C5' => 2.00],
                'C4' => ['C1' => 0.50, 'C2' => 2.00, 'C3' => 2.00, 'C4' => 1.00, 'C5' => 3.00],
                'C5' => ['C1' => 0.25, 'C2' => 0.50, 'C3' => 0.50, 'C4' => 0.33, 'C5' => 1.00],
            ],
            'column_sums' => ['C1' => 2.4167, 'C2' => 7.5000, 'C3' => 7.5000, 'C4' => 4.3333, 'C5' => 12.0000],
            'lambda_max' => 5.1614,
            'ci' => 0.0404,
            'ri' => 1.12,
            'cr' => 0.0360,
            'is_consistent' => true,
        ];

        return Inertia::render('Kriteria/Index', [
            'kriterias' => $kriterias,
            'ahp' => $ahpMatrix,
        ]);
    }
}