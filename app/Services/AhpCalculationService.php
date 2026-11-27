<?php

namespace App\Services;

use App\Models\AhpComparison;
use App\Models\Kriteria;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AhpCalculationService
{
    /**
     * Tabel Random Index (RI) standar Saaty untuk n = 1..10.
     */
    private const RANDOM_INDEX = [
        1 => 0.00,
        2 => 0.00,
        3 => 0.58,
        4 => 0.90,
        5 => 1.12,
        6 => 1.24,
        7 => 1.32,
        8 => 1.41,
        9 => 1.45,
        10 => 1.49,
    ];

    public function __construct(
        protected SawCalculationService $sawService
    ) {}

    /**
     * Hitung matriks perbandingan berpasangan, priority vector (bobot),
     * lambda_max, CI, RI, dan CR berdasarkan data di ahp_comparisons.
     */
    public function calculate(): array
    {
        $kriterias = Kriteria::orderBy('id', 'asc')->get();
        $n = $kriterias->count();

        if ($n === 0) {
            return [
                'kriterias' => [],
                'n' => 0,
                'matrix' => [],
                'normalized_matrix' => [],
                'column_sums' => [],
                'weights' => [],
                'pairs' => [],
                'lambda_max' => 0.0,
                'ci' => 0.0,
                'ri' => 0.0,
                'cr' => 0.0,
                'is_consistent' => true,
            ];
        }

        $comparisons = AhpComparison::all();
        $pairMap = [];
        foreach ($comparisons as $comp) {
            $pairMap["{$comp->kriteria_1_id}-{$comp->kriteria_2_id}"] = (float) $comp->nilai;
        }

        $kodes = $kriterias->pluck('kode')->all();
        $matrix = [];
        $pairs = [];

        // 1. Susun matriks n x n (diagonal = 1, bawah = 1 / atas)
        foreach ($kriterias as $i => $rowK) {
            $matrix[$rowK->kode] = [];
            foreach ($kriterias as $j => $colK) {
                if ($i === $j) {
                    $matrix[$rowK->kode][$colK->kode] = 1.0;
                } elseif ($i < $j) {
                    $val = $this->resolvePairValue($pairMap, $rowK->id, $colK->id);
                    $matrix[$rowK->kode][$colK->kode] = $val;
                    $pairs[] = [
                        'kriteria_1_id' => $rowK->id,
                        'kriteria_2_id' => $colK->id,
                        'kode_1' => $rowK->kode,
                        'kode_2' => $colK->kode,
                        'nama_1' => $rowK->nama_kriteria,
                        'nama_2' => $colK->nama_kriteria,
                        'nilai' => $val,
                    ];
                } else {
                    $upperVal = $this->resolvePairValue($pairMap, $colK->id, $rowK->id);
                    $matrix[$rowK->kode][$colK->kode] = $upperVal > 0 ? (1.0 / $upperVal) : 1.0;
                }
            }
        }

        // 2. Hitung jumlah tiap kolom
        $columnSums = [];
        foreach ($kodes as $colKode) {
            $sum = 0.0;
            foreach ($kodes as $rowKode) {
                $sum += $matrix[$rowKode][$colKode];
            }
            $columnSums[$colKode] = round($sum, 4);
        }

        // 3. Normalisasi matriks & hitung Priority Vector (rata-rata baris)
        $normalizedMatrix = [];
        $weights = [];
        foreach ($kodes as $rowKode) {
            $normalizedMatrix[$rowKode] = [];
            $rowSum = 0.0;
            foreach ($kodes as $colKode) {
                $colSum = $columnSums[$colKode];
                $norm = $colSum > 0 ? ($matrix[$rowKode][$colKode] / $colSum) : 0.0;
                $normalizedMatrix[$rowKode][$colKode] = round($norm, 4);
                $rowSum += $norm;
            }
            $weights[$rowKode] = round($rowSum / $n, 4);
        }

        // 4. Hitung Weighted Sum Vector dan Lambda Max
        $lambdaSum = 0.0;
        foreach ($kodes as $rowKode) {
            $ws = 0.0;
            foreach ($kodes as $colKode) {
                $ws += $matrix[$rowKode][$colKode] * $weights[$colKode];
            }
            $w = $weights[$rowKode];
            $lambdaSum += $w > 0 ? ($ws / $w) : 0.0;
        }

        $lambdaMax = $n > 0 ? ($lambdaSum / $n) : 0.0;
        $ci = $n > 1 ? (($lambdaMax - $n) / ($n - 1)) : 0.0;
        $ri = self::RANDOM_INDEX[$n] ?? 1.49;
        $cr = $ri > 0 ? ($ci / $ri) : 0.0;

        return [
            'kriterias' => $kodes,
            'n' => $n,
            'matrix' => $matrix,
            'normalized_matrix' => $normalizedMatrix,
            'column_sums' => $columnSums,
            'weights' => $weights,
            'pairs' => $pairs,
            'lambda_max' => round($lambdaMax, 4),
            'ci' => round($ci, 4),
            'ri' => round($ri, 2),
            'cr' => round($cr, 4),
            'is_consistent' => $cr <= 0.10,
        ];
    }

    /**
     * Hitung AHP dari data tersimpan dan terapkan ke bobot_ahp + SAW jika konsisten.
     */
    public function calculateAndApply(): array
    {
        $result = $this->calculate();

        if ($result['is_consistent'] && !empty($result['weights'])) {
            $this->applyWeightsAndRecalculateSaw($result['weights']);
            $result['applied'] = true;
        } else {
            $result['applied'] = false;
        }

        return $result;
    }

    /**
     * Simpan matriks perbandingan baru, hitung AHP, dan perbarui bobot_ahp + SAW jika konsisten.
     *
     * @param array<int, array{kriteria_1_id: int, kriteria_2_id: int, nilai: float}> $comparisons
     */
    public function saveAndCalculate(array $comparisons): array
    {
        DB::transaction(function () use ($comparisons) {
            foreach ($comparisons as $item) {
                $k1 = (int) $item['kriteria_1_id'];
                $k2 = (int) $item['kriteria_2_id'];
                $nilai = (float) $item['nilai'];

                if ($k1 === $k2 || $nilai <= 0) {
                    continue;
                }

                // Pastikan pasangan disimpan konsisten dengan urutan kriteria_1_id < kriteria_2_id
                if ($k1 > $k2) {
                    [$k1, $k2] = [$k2, $k1];
                    $nilai = 1.0 / $nilai;
                }

                AhpComparison::updateOrCreate(
                    [
                        'kriteria_1_id' => $k1,
                        'kriteria_2_id' => $k2,
                    ],
                    ['nilai' => round($nilai, 4)]
                );
            }
        });

        return $this->calculateAndApply();
    }

    /**
     * Perbarui kolom bobot_ahp di tabel kriterias dan hitung ulang ranking SAW.
     *
     * @param array<string, float> $weights
     */
    protected function applyWeightsAndRecalculateSaw(array $weights): void
    {
        foreach ($weights as $kode => $bobot) {
            Kriteria::where('kode', $kode)->update([
                'bobot_ahp' => round($bobot, 4),
            ]);
        }

        $this->sawService->calculateAndSave();
    }

    /**
     * Ambil nilai perbandingan pasangan (id1, id2) dengan fallback resiprokal jika tersimpan terbalik.
     *
     * @param array<string, float> $pairMap
     */
    private function resolvePairValue(array $pairMap, int $id1, int $id2): float
    {
        $forwardKey = "{$id1}-{$id2}";
        if (isset($pairMap[$forwardKey]) && $pairMap[$forwardKey] > 0) {
            return $pairMap[$forwardKey];
        }

        $reverseKey = "{$id2}-{$id1}";
        if (isset($pairMap[$reverseKey]) && $pairMap[$reverseKey] > 0) {
            return 1.0 / $pairMap[$reverseKey];
        }

        return 1.0;
    }
}
