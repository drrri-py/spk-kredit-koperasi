<?php

namespace Database\Seeders;

use App\Models\AhpComparison;
use App\Models\User;
use App\Models\Kriteria;
use App\Models\SubKriteria;
use App\Models\Debitur;
use App\Models\PenilaianDetail;
use App\Services\AhpCalculationService;
use App\Services\SawCalculationService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Akun Admin / Analis Kredit
        $admin = User::updateOrCreate(
            ['email' => 'admin@koperasi.com'],
            [
                'name' => 'Petugas Analis Kredit',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'no_anggota' => 'ADM-001',
            ]
        );

        // 2. Akun Anggota untuk Demonstrasi Sidang (Budi Santoso)
        $member = User::updateOrCreate(
            ['email' => 'budi@koperasi.com'],
            [
                'name' => 'Budi Santoso',
                'password' => Hash::make('password123'),
                'role' => 'anggota',
                'no_anggota' => 'KOP-MP-001',
            ]
        );

        // 3. Master Kriteria & Sub-Kriteria AHP
        $kriterias = [
            [
                'kode' => 'C1',
                'nama_kriteria' => 'Penghasilan Bulanan',
                'tipe' => 'benefit',
                'bobot_ahp' => 0.35,
                'sub' => [
                    ['deskripsi' => '> Rp 3.500.000', 'nilai_bobot' => 90],
                    ['deskripsi' => 'Rp 2.600.000 - Rp 3.500.000 (Area UMK Cirebon)', 'nilai_bobot' => 80],
                    ['deskripsi' => 'Rp 1.800.000 - Rp 2.599.000', 'nilai_bobot' => 60],
                    ['deskripsi' => '< Rp 1.800.000', 'nilai_bobot' => 40],
                ]
            ],
            [
                'kode' => 'C2',
                'nama_kriteria' => 'Jumlah Tanggungan',
                'tipe' => 'cost',
                'bobot_ahp' => 0.15,
                'sub' => [
                    ['deskripsi' => 'Tidak Ada (0 Orang)', 'nilai_bobot' => 90],
                    ['deskripsi' => '1 - 2 Orang', 'nilai_bobot' => 80],
                    ['deskripsi' => '3 - 4 Orang', 'nilai_bobot' => 60],
                    ['deskripsi' => '> 4 Orang', 'nilai_bobot' => 40],
                ]
            ],
            [
                'kode' => 'C3',
                'nama_kriteria' => 'Nilai Jaminan (Agunan)',
                'tipe' => 'benefit',
                'bobot_ahp' => 0.15,
                'sub' => [
                    ['deskripsi' => 'Sertifikat Rumah / Tanah (SHM)', 'nilai_bobot' => 90],
                    ['deskripsi' => 'BPKB Mobil', 'nilai_bobot' => 80],
                    ['deskripsi' => 'BPKB Sepeda Motor', 'nilai_bobot' => 70],
                    ['deskripsi' => 'Simpanan Sukarela / Tanpa Agunan Fisik', 'nilai_bobot' => 30],
                ]
            ],
            [
                'kode' => 'C4',
                'nama_kriteria' => 'Riwayat Pembayaran',
                'tipe' => 'benefit',
                'bobot_ahp' => 0.25,
                'sub' => [
                    ['deskripsi' => 'Sangat Baik (Selalu tepat waktu)', 'nilai_bobot' => 90],
                    ['deskripsi' => 'Baik (Pernah terlambat 1-7 hari)', 'nilai_bobot' => 70],
                    ['deskripsi' => 'Anggota Baru / Belum Ada Riwayat Pinjaman', 'nilai_bobot' => 60],
                    ['deskripsi' => 'Cukup (Sering terlambat 8-30 hari)', 'nilai_bobot' => 50],
                    ['deskripsi' => 'Buruk (Macet / Menunggak > 30 hari)', 'nilai_bobot' => 20],
                ]
            ],
            [
                'kode' => 'C5',
                'nama_kriteria' => 'Lama Menjadi Anggota',
                'tipe' => 'benefit',
                'bobot_ahp' => 0.10,
                'sub' => [
                    ['deskripsi' => '> 5 Tahun', 'nilai_bobot' => 90],
                    ['deskripsi' => '3 - 5 Tahun', 'nilai_bobot' => 80],
                    ['deskripsi' => '1 - 2 Tahun', 'nilai_bobot' => 60],
                    ['deskripsi' => '< 1 Tahun', 'nilai_bobot' => 50],
                ]
            ],
        ];

        $kriteriaModels = [];
        foreach ($kriterias as $k) {
            $model = Kriteria::updateOrCreate(
                ['kode' => $k['kode']],
                [
                    'nama_kriteria' => $k['nama_kriteria'],
                    'tipe' => $k['tipe'],
                    'bobot_ahp' => $k['bobot_ahp']
                ]
            );
            $kriteriaModels[$k['kode']] = $model;

            foreach ($k['sub'] as $sub) {
                SubKriteria::updateOrCreate(
                    [
                        'kriteria_id' => $model->id,
                        'deskripsi' => $sub['deskripsi']
                    ],
                    ['nilai_bobot' => $sub['nilai_bobot']]
                );
            }
        }

        // 3b. Matriks Perbandingan Berpasangan Awal AHP (Skala Saaty)
        $defaultComparisons = [
            ['C1', 'C2', 3.0],
            ['C1', 'C3', 3.0],
            ['C1', 'C4', 2.0],
            ['C1', 'C5', 4.0],
            ['C2', 'C3', 1.0],
            ['C2', 'C4', 0.5],
            ['C2', 'C5', 2.0],
            ['C3', 'C4', 0.5],
            ['C3', 'C5', 2.0],
            ['C4', 'C5', 3.0],
        ];

        foreach ($defaultComparisons as [$k1, $k2, $nilai]) {
            if (isset($kriteriaModels[$k1], $kriteriaModels[$k2])) {
                AhpComparison::updateOrCreate(
                    [
                        'kriteria_1_id' => $kriteriaModels[$k1]->id,
                        'kriteria_2_id' => $kriteriaModels[$k2]->id,
                    ],
                    ['nilai' => $nilai]
                );
            }
        }

        // Hitung bobot AHP dari matriks perbandingan awal
        $ahpService = new AhpCalculationService(new SawCalculationService());
        $ahpService->calculateAndApply();

        // 4. Data Alternatif Debitur
        $sampleDebitur = [
            [
                'no_anggota' => 'KOP-MP-001',
                'nama_lengkap' => 'Budi Santoso',
                'nik' => '3209012304850001',
                'unit_kerja' => 'Divisi Produksi',
                'alamat' => 'Jl. Fatahillah No. 12, Plered, Cirebon',
                'telepon' => '081234567890',
                'nominal_pengajuan' => 10000000,
                'tenor_bulan' => 12,
                'skor' => ['C1' => 90, 'C2' => 90, 'C3' => 90, 'C4' => 90, 'C5' => 90]
            ],
            [
                'no_anggota' => 'KOP-MP-002',
                'nama_lengkap' => 'Siti Aminah',
                'nik' => '3209015408900002',
                'unit_kerja' => 'Divisi Keuangan & Pajak',
                'alamat' => 'Perumahan Sumber Indah Blok C-5, Cirebon',
                'telepon' => '082198765432',
                'nominal_pengajuan' => 15000000,
                'tenor_bulan' => 18,
                'skor' => ['C1' => 80, 'C2' => 80, 'C3' => 80, 'C4' => 90, 'C5' => 80]
            ],
            [
                'no_anggota' => 'KOP-MP-003',
                'nama_lengkap' => 'Ahmad Fauzi',
                'nik' => '3209011102920003',
                'unit_kerja' => 'Divisi Logistik & Gudang',
                'alamat' => 'Desa Karangwangi, Cirebon',
                'telepon' => '085712341234',
                'nominal_pengajuan' => 8000000,
                'tenor_bulan' => 10,
                'skor' => ['C1' => 40, 'C2' => 40, 'C3' => 30, 'C4' => 20, 'C5' => 50]
            ],
            [
                'no_anggota' => 'KOP-MP-004',
                'nama_lengkap' => 'Rina Kurniawati',
                'nik' => '3209016503950004',
                'unit_kerja' => 'Divisi HRD & Umum',
                'alamat' => 'Jl. Sunan Gunung Jati No. 45, Cirebon',
                'telepon' => '081388990011',
                'nominal_pengajuan' => 12000000,
                'tenor_bulan' => 12,
                'skor' => ['C1' => 80, 'C2' => 80, 'C3' => 70, 'C4' => 60, 'C5' => 60]
            ],
        ];

        foreach ($sampleDebitur as $d) {
            $debitur = Debitur::updateOrCreate(
                ['no_anggota' => $d['no_anggota']],
                [
                    'user_id' => $admin->id,
                    'nama_lengkap' => $d['nama_lengkap'],
                    'nik' => $d['nik'],
                    'unit_kerja' => $d['unit_kerja'],
                    'alamat' => $d['alamat'],
                    'telepon' => $d['telepon'],
                    'nominal_pengajuan' => $d['nominal_pengajuan'],
                    'tenor_bulan' => $d['tenor_bulan'],
                    'status_verifikasi' => 'diverifikasi',
                ]
            );

            foreach ($d['skor'] as $kode => $skorVal) {
                PenilaianDetail::updateOrCreate(
                    [
                        'debitur_id' => $debitur->id,
                        'kriteria_id' => $kriteriaModels[$kode]->id,
                    ],
                    ['nilai_skor' => $skorVal]
                );
            }
        }

        // 5. Jalankan kalkulasi SAW
        $calculator = new SawCalculationService();
        $calculator->calculateAndSave();
    }
}