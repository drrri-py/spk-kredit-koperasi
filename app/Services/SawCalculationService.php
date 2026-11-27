<?php

namespace App\Services;

use App\Models\Kriteria;
use App\Models\Debitur;
use App\Models\SawResult;

class SawCalculationService
{
    public function calculateAndSave(): array
    {
        $kriterias = Kriteria::with('subKriterias')->get();
        // Hanya memproses debitur yang statusnya sudah diverifikasi
        $debiturs = Debitur::with(['penilaianDetails.kriteria'])->where('status_verifikasi', 'diverifikasi')->get();

        // Guard clause jika belum ada data agar tidak crash
        if ($kriterias->isEmpty() || $debiturs->isEmpty()) {
            return [
                'status' => 'empty',
                'message' => 'Belum ada data debitur yang diverifikasi untuk dihitung.',
                'kriterias' => $kriterias,
                'matrix_x' => [],
                'matrix_r' => [],
                'results' => []
            ];
        }

        // 1. Matriks Keputusan (X)
        $matrixX = [];
        foreach ($debiturs as $debitur) {
            foreach ($debitur->penilaianDetails as $detail) {
                $matrixX[$debitur->id][$detail->kriteria->kode] = (float) $detail->nilai_skor;
            }
        }

        // 2. Cari Nilai Max dan Min tiap Kriteria
        $extremes = [];
        foreach ($kriterias as $kriteria) {
            $columnValues = [];
            foreach ($debiturs as $debitur) {
                if (isset($matrixX[$debitur->id][$kriteria->kode])) {
                    $columnValues[] = $matrixX[$debitur->id][$kriteria->kode];
                }
            }

            $extremes[$kriteria->kode] = [
                'max' => !empty($columnValues) ? max($columnValues) : 1,
                'min' => !empty($columnValues) ? min($columnValues) : 1,
            ];
        }

        // 3. Normalisasi Matriks (R) & Hitung Nilai Preferensi (V)
        $matrixR = [];
        $sawScores = [];

        foreach ($debiturs as $debitur) {
            $totalV = 0;
            $matrixR[$debitur->id] = [];

            foreach ($kriterias as $kriteria) {
                $kode = $kriteria->kode;
                $val = $matrixX[$debitur->id][$kode] ?? 0;

                // Rumus SAW Benefit vs Cost
                if ($kriteria->tipe === 'benefit') {
                    $max = $extremes[$kode]['max'];
                    $r = $max > 0 ? ($val / $max) : 0;
                } else {
                    $min = $extremes[$kode]['min'];
                    $r = $val > 0 ? ($min / $val) : 0;
                }

                $matrixR[$debitur->id][$kode] = round($r, 4);
                $totalV += ($r * (float) $kriteria->bobot_ahp);
            }

            $preferensi = round($totalV, 4);

            // Klasifikasi Kelayakan Kredit Koperasi
            if ($preferensi >= 0.75) {
                $status = 'LAYAK';
                $rekomendasiPlafon = (float) $debitur->nominal_pengajuan;
                $catatan = 'Memenuhi kualifikasi kelayakan kredit penuh (Plafon 100%).';
            } elseif ($preferensi >= 0.60) {
                $status = 'DIPERTIMBANGKAN';
                $rekomendasiPlafon = (float) $debitur->nominal_pengajuan * 0.70; // Plafon 70%
                $catatan = 'Disetujui dengan penyesuaian plafon pinjaman 70%.';
            } else {
                $status = 'TIDAK LAYAK';
                $rekomendasiPlafon = 0;
                $catatan = 'Skor preferensi di bawah batas standar kelayakan koperasi.';
            }

            $sawScores[] = [
                'debitur_id' => $debitur->id,
                'no_anggota' => $debitur->no_anggota,
                'nama_lengkap' => $debitur->nama_lengkap,
                'unit_kerja' => $debitur->unit_kerja,
                'nominal_pengajuan' => (float) $debitur->nominal_pengajuan,
                'tenor_bulan' => $debitur->tenor_bulan,
                'nilai_preferensi' => $preferensi,
                'status_kelayakan' => $status,
                'rekomendasi_plafon' => $rekomendasiPlafon,
                'catatan_analisis' => $catatan,
            ];
        }

        // 4. Perankingan berdasarkan nilai preferensi tertinggi
        usort($sawScores, fn($a, $b) => $b['nilai_preferensi'] <=> $a['nilai_preferensi']);

        // 5. Simpan / Perbarui Hasil ke Tabel Database saw_results
        foreach ($sawScores as $index => &$item) {
            $item['ranking'] = $index + 1;

            SawResult::updateOrCreate(
                ['debitur_id' => $item['debitur_id']],
                [
                    'nilai_preferensi' => $item['nilai_preferensi'],
                    'ranking' => $item['ranking'],
                    'status_kelayakan' => $item['status_kelayakan'],
                    'rekomendasi_plafon' => $item['rekomendasi_plafon'],
                    'catatan_analisis' => $item['catatan_analisis'],
                ]
            );
        }

        return [
            'status' => 'success',
            'kriterias' => $kriterias,
            'matrix_x' => $matrixX,
            'matrix_r' => $matrixR,
            'results' => $sawScores
        ];
    }
}