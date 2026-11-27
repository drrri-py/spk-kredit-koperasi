<?php

namespace App\Http\Controllers;

use App\Models\Debitur;
use App\Models\Kriteria;
use App\Models\SawResult;
use App\Services\SawCalculationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SpkSawController extends Controller
{
    protected SawCalculationService $sawService;

    public function __construct(SawCalculationService $sawService)
    {
        $this->sawService = $sawService;
    }

    /**
     * Tampilkan Halaman Utama Kalkulasi SPK SAW
     */
    public function index(): Response
    {
        // Jalankan kalkulasi dan simpan hasil perankingan otomatis
        $this->sawService->calculateAndSave();

        // Ambil data kriteria urut berdasarkan ID
        $kriterias = Kriteria::orderBy('id', 'asc')->get();

        // Ambil data debitur beserta relasi penilaian dan hasil SAW
        $debiturs = Debitur::with(['penilaianDetails.kriteria', 'sawResult'])
            ->get()
            ->sortBy(function ($item) {
                return $item->sawResult ? $item->sawResult->ranking : 999;
            })
            ->values();

        // Render komponen Spk/Index
        return Inertia::render('Spk/Index', [
            'kriterias' => $kriterias,
            'debiturs'  => $debiturs,
        ]);
    }

    /**
     * Halaman Cetak Dokumen Rekapitulasi Resmi A4 / PDF
     */
    public function cetak(): Response
    {
        $debiturs = Debitur::with(['sawResult', 'penilaianDetails.kriteria'])
            ->get()
            ->sortBy(function ($item) {
                return $item->sawResult ? $item->sawResult->ranking : 999;
            })
            ->values();

        // Render komponen Spk/Cetak
        return Inertia::render('Spk/Cetak', [
            'debiturs' => $debiturs,
        ]);
    }

    /**
     * Ekspor Laporan Rekapitulasi SPK SAW ke Format Excel Resmi (.xls Ber-Styling Formal)
     */
    public function exportExcel()
    {
        $debiturs = Debitur::with(['sawResult', 'penilaianDetails.kriteria'])
            ->get()
            ->sortBy(function ($item) {
                return $item->sawResult ? $item->sawResult->ranking : 999;
            })
            ->values();

        $fileName = 'Laporan_Evaluasi_Kredit_KKMP_' . date('Ymd_His') . '.xls';

        $headers = [
            "Content-Type"        => "application/vnd.ms-excel; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=\"$fileName\"",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function () use ($debiturs) {
            $totalPlafon = $debiturs->sum(function ($d) {
                return $d->sawResult ? $d->sawResult->rekomendasi_plafon : 0;
            });

            $totalPengajuan = $debiturs->sum('nominal_pengajuan');
            $tanggalDokumen = date('d F Y, H:i') . ' WIB';

            echo '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
            echo '<head>';
            echo '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">';
            echo '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Rekapitulasi SPK</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->';
            echo '<style>
                    body { font-family: "Calibri", "Segoe UI", Arial, sans-serif; font-size: 11pt; color: #1e293b; }
                    .title-instansi { font-size: 14pt; font-weight: bold; text-align: left; }
                    .title-doc { font-size: 12pt; font-weight: bold; text-align: left; color: #0f172a; }
                    .meta-text { font-size: 10pt; color: #475569; }
                    .tbl-data { border-collapse: collapse; width: 100%; margin-top: 15px; }
                    .tbl-data th { background-color: #0f172a; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #0f172a; padding: 10px 8px; font-size: 10pt; text-transform: uppercase; }
                    .tbl-data td { border: 1px solid #cbd5e1; padding: 7px 8px; font-size: 10pt; vertical-align: middle; }
                    .center { text-align: center; }
                    .right { text-align: right; }
                    .currency { text-align: right; mso-number-format:"\#\,\#\#0"; }
                    .bold { font-weight: bold; }
                    .status-layak { background-color: #ecfdf5; color: #065f46; font-weight: bold; text-align: center; }
                    .status-dipertimbangkan { background-color: #fffbeb; color: #92400e; font-weight: bold; text-align: center; }
                    .status-tidak-layak { background-color: #fef2f2; color: #991b1b; font-weight: bold; text-align: center; }
                    .total-row { background-color: #f1f5f9; font-weight: bold; border-top: 2px solid #0f172a; }
                  </style>';
            echo '</head>';
            echo '<body>';

            // KOP & INFORMASI DOKUMEN
            echo '<table>';
            echo '<tr><td colspan="10" class="title-instansi">KOPERASI KARYAWAN MANUNGGAL PERKASA</td></tr>';
            echo '<tr><td colspan="10" class="title-doc">REKAPITULASI EVALUASI KELAYAKAN PINJAMAN KREDIT ANGGOTA</td></tr>';
            echo '<tr><td colspan="10" class="meta-text">Wilayah Kerja: Kabupaten Cirebon | Metode Evaluasi: Analytic Hierarchy Process (AHP) & Simple Additive Weighting (SAW)</td></tr>';
            echo '<tr><td colspan="10" class="meta-text">Tanggal Dokumen: ' . $tanggalDokumen . ' | Parameter Konsistensi AHP: CR = 0.0360 (Konsisten)</td></tr>';
            echo '<tr><td colspan="10"></td></tr>';
            echo '</table>';

            // TABEL DATA UTAMA
            echo '<table class="tbl-data">';
            echo '<thead>';
            echo '<tr>';
            echo '<th style="width: 45px;">Rank</th>';
            echo '<th style="width: 110px;">No. Anggota</th>';
            echo '<th style="width: 180px;">Nama Lengkap Debitur</th>';
            echo '<th style="width: 140px;">Unit Kerja / Bagian</th>';
            echo '<th style="width: 130px;">Permohonan (IDR)</th>';
            echo '<th style="width: 80px;">Tenor</th>';
            echo '<th style="width: 90px;">Preferensi (V)</th>';
            echo '<th style="width: 130px;">Status Keputusan</th>';
            echo '<th style="width: 140px;">Rekomendasi Plafon (IDR)</th>';
            echo '<th style="width: 320px;">Catatan Hasil Analisis Komite Kredit</th>';
            echo '</tr>';
            echo '</thead>';
            echo '<tbody>';

            if ($debiturs->isEmpty()) {
                echo '<tr><td colspan="10" class="center" style="padding: 20px; color: #94a3b8;">Belum ada data debitur yang dievaluasi.</td></tr>';
            } else {
                foreach ($debiturs as $index => $debitur) {
                    $saw = $debitur->sawResult;
                    $statusClass = 'center';

                    if ($saw) {
                        if ($saw->status_kelayakan === 'LAYAK') {
                            $statusClass = 'status-layak';
                        } elseif ($saw->status_kelayakan === 'DIPERTIMBANGKAN') {
                            $statusClass = 'status-dipertimbangkan';
                        } else {
                            $statusClass = 'status-tidak-layak';
                        }
                    }

                    echo '<tr>';
                    echo '<td class="center bold">' . ($saw ? $saw->ranking : ($index + 1)) . '</td>';
                    echo '<td class="center" style="mso-number-format:\'\@\';">' . htmlspecialchars($debitur->no_anggota) . '</td>';
                    echo '<td class="bold">' . htmlspecialchars($debitur->nama_lengkap) . '</td>';
                    echo '<td>' . htmlspecialchars($debitur->unit_kerja ?: 'Karyawan') . '</td>';
                    echo '<td class="currency">' . number_format($debitur->nominal_pengajuan, 0, ',', '.') . '</td>';
                    echo '<td class="center">' . $debitur->tenor_bulan . ' Bulan</td>';
                    echo '<td class="center bold">' . ($saw ? number_format($saw->nilai_preferensi, 4, '.', '') : '-') . '</td>';
                    echo '<td class="' . $statusClass . '">' . ($saw ? $saw->status_kelayakan : 'BELUM DINILAI') . '</td>';
                    echo '<td class="currency bold">' . ($saw ? number_format($saw->rekomendasi_plafon, 0, ',', '.') : '0') . '</td>';
                    echo '<td>' . htmlspecialchars($saw ? $saw->catatan_analisis : 'Menunggu verifikasi penilaian kriteria') . '</td>';
                    echo '</tr>';
                }

                // BARIS TOTAL & RINGKASAN
                echo '<tr class="total-row">';
                echo '<td colspan="4" class="right bold">TOTAL AKUMULASI :</td>';
                echo '<td class="currency bold">' . number_format($totalPengajuan, 0, ',', '.') . '</td>';
                echo '<td colspan="3" class="right bold">TOTAL PLAFON DISETUJUI :</td>';
                echo '<td class="currency bold">' . number_format($totalPlafon, 0, ',', '.') . '</td>';
                echo '<td></td>';
                echo '</tr>';
            }

            echo '</tbody>';
            echo '</table>';

            // KETERANGAN AMBANG BATAS
            echo '<table style="margin-top: 15px; font-size: 9pt; color: #475569;">';
            echo '<tr><td colspan="10"><strong>Ketentuan Ambang Batas Preferensi (V):</strong> [1] Layak: V &ge; 0.75 (Plafon 100%) | [2] Dipertimbangkan: 0.60 &le; V &lt; 0.75 (Plafon disesuaikan 70%) | [3] Tidak Layak: V &lt; 0.60 (Ditolak)</td></tr>';
            echo '</table>';

            echo '</body>';
            echo '</html>';
        };

        return response()->stream($callback, 200, $headers);
    }
}