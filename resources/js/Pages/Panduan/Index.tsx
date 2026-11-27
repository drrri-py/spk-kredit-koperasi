import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function PanduanIndex() {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-base font-bold text-slate-900">
                        Standar Operasional Prosedur (SOP) Sistem
                    </h1>
                    <p className="text-xs text-slate-500">
                        Pedoman Pelaksanaan Evaluasi Kelayakan Kredit Koperasi Karyawan Manunggal Perkasa
                    </p>
                </div>
            }
        >
            <Head title="Panduan Alur Sistem (SOP) - SPK Koperasi" />

            <div className="max-w-5xl mx-auto space-y-6 text-slate-800">
                {/* RINGKASAN INTEGRASI METODE */}
                <div className="bg-white border border-slate-200 rounded p-5 space-y-2">
                    <div className="flex items-center space-x-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-900"></span>
                        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                            Landasan Integrasi Metode AHP & SAW
                        </h2>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600 text-justify">
                        Sistem Pendukung Keputusan (SPK) ini mengombinasikan dua metode analisis multi-kriteria:
                        <strong> Analytic Hierarchy Process (AHP)</strong> digunakan untuk menentukan pembobotan prioritas antar-kriteria 
                        berdasarkan perbandingan berpasangan (<em>pairwise comparison</em>) yang telah teruji konsisten 
                        (<em>Consistency Ratio</em> / <strong>CR = 0,0360 &lt; 0,10</strong>). Bobot kriteria tersebut kemudian diintegrasikan 
                        ke dalam metode <strong>Simple Additive Weighting (SAW)</strong> untuk menormalisasi matriks evaluasi dan menghitung 
                        nilai preferensi komprehensif bagi setiap debitur pemohon pinjaman.
                    </p>
                </div>

                {/* 4 TAHAPAN ALUR KERJA (SOP) */}
                <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
                    <div className="border-b border-slate-200 pb-2">
                        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                            Tahapan Prosedur Operasional Pengajuan Kredit
                        </h2>
                        <p className="text-[11px] text-slate-500">
                            Empat langkah sistematis dari pengajuan mandiri anggota hingga penetapan persetujuan plafon
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Langkah 1 */}
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-1.5">
                            <div className="flex items-center space-x-2">
                                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                                    1
                                </span>
                                <h3 className="text-xs font-bold text-slate-900">Pengajuan Mandiri oleh Anggota</h3>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed pl-7">
                                Anggota terdaftar melakukan login mandiri, mengakses menu permohonan kredit, lalu mengisi formulir nominal pengajuan, tenor cicilan, serta melengkapi identitas pemohon sesuai dokumen fisik KTP.
                            </p>
                        </div>

                        {/* Langkah 2 */}
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-1.5">
                            <div className="flex items-center space-x-2">
                                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                                    2
                                </span>
                                <h3 className="text-xs font-bold text-slate-900">Verifikasi Dokumen & Penilaian Kriteria</h3>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed pl-7">
                                Petugas analis kredit memeriksa keabsahan berkas permohonan pada daftar berkas, lalu memberikan skor parameter untuk 5 kriteria utama (Penghasilan, Tanggungan, Riwayat Kredit, Agunan, dan Lama Keanggotaan).
                            </p>
                        </div>

                        {/* Langkah 3 */}
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-1.5">
                            <div className="flex items-center space-x-2">
                                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                                    3
                                </span>
                                <h3 className="text-xs font-bold text-slate-900">Kalkulasi Otomatis Matriks SAW</h3>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed pl-7">
                                Sistem secara otomatis menyusun Matriks Keputusan (X), melakukan normalisasi (R) sesuai sifat kriteria (<em>Benefit</em> atau <em>Cost</em>), dan mengalikan matriks dengan bobot AHP guna memperoleh Nilai Preferensi (V).
                            </p>
                        </div>

                        {/* Langkah 4 */}
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-1.5">
                            <div className="flex items-center space-x-2">
                                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                                    4
                                </span>
                                <h3 className="text-xs font-bold text-slate-900">Penetapan Plafon & Pelaporan Dinas</h3>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed pl-7">
                                Sistem menetapkan status kelayakan dan rekomendasi nominal plafon kredit. Hasil evaluasi dapat langsung dicetak dalam format dokumen A4 resmi ber-kop dinas atau diekspor ke format spreadsheet Excel (.xls).
                            </p>
                        </div>
                    </div>
                </div>

                {/* RINCIAN 5 KRITERIA & BOBOT AHP */}
                <div className="bg-white border border-slate-200 rounded p-5 space-y-3">
                    <div className="border-b border-slate-200 pb-2">
                        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                            Struktur Parameter 5 Kriteria Penilaian
                        </h2>
                        <p className="text-[11px] text-slate-500">
                            Distribusi bobot hasil pembobotan perbandingan berpasangan metode AHP
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border border-slate-200">
                            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold">
                                <tr>
                                    <th className="py-2.5 px-3 border-b border-slate-200 w-16 text-center">Kode</th>
                                    <th className="py-2.5 px-4 border-b border-slate-200">Nama Kriteria</th>
                                    <th className="py-2.5 px-3 border-b border-slate-200 text-center w-28">Sifat Kriteria</th>
                                    <th className="py-2.5 px-3 border-b border-slate-200 text-center w-24">Bobot AHP</th>
                                    <th className="py-2.5 px-4 border-b border-slate-200">Keterangan / Tolok Ukur</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-slate-600">
                                <tr>
                                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">C1</td>
                                    <td className="py-2.5 px-4 font-semibold text-slate-800">Penghasilan Bulanan</td>
                                    <td className="py-2.5 px-3 text-center">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">BENEFIT</span>
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">35%</td>
                                    <td className="py-2.5 px-4 text-[11px]">Kapasitas kemampuan angsuran bulanan berdasarkan slip gaji resmi.</td>
                                </tr>
                                <tr>
                                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">C2</td>
                                    <td className="py-2.5 px-4 font-semibold text-slate-800">Jumlah Tanggungan</td>
                                    <td className="py-2.5 px-3 text-center">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">COST</span>
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">15%</td>
                                    <td className="py-2.5 px-4 text-[11px]">Beban pengeluaran keluarga. Semakin sedikit tanggungan, semakin tinggi skor kelayakan.</td>
                                </tr>
                                <tr>
                                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">C3</td>
                                    <td className="py-2.5 px-4 font-semibold text-slate-800">Riwayat Kredit / Kolektibilitas</td>
                                    <td className="py-2.5 px-3 text-center">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">BENEFIT</span>
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">25%</td>
                                    <td className="py-2.5 px-4 text-[11px]">Catatan kedisiplinan pelunasan pinjaman sebelumnya pada buku koperasi.</td>
                                </tr>
                                <tr>
                                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">C4</td>
                                    <td className="py-2.5 px-4 font-semibold text-slate-800">Jaminan / Agunan</td>
                                    <td className="py-2.5 px-3 text-center">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">BENEFIT</span>
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">15%</td>
                                    <td className="py-2.5 px-4 text-[11px]">Instrumen penjamin fasilitas kredit (BPKB, sertifikat, atau simpanan sukarela).</td>
                                </tr>
                                <tr>
                                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">C5</td>
                                    <td className="py-2.5 px-4 font-semibold text-slate-800">Lama Keanggotaan</td>
                                    <td className="py-2.5 px-3 text-center">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">BENEFIT</span>
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">10%</td>
                                    <td className="py-2.5 px-4 text-[11px]">Tingkat loyalitas dan partisipasi anggota dalam kegiatan simpan pinjam koperasi.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FORMULA NORMALISASI & KETENTUAN PLAFON */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Formula Normalisasi */}
                    <div className="bg-white border border-slate-200 rounded p-4 space-y-2">
                        <h3 className="text-xs font-bold text-slate-900 uppercase">
                            Formula Normalisasi Matriks SAW
                        </h3>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                            Elemen matriks ternormalisasi (R<sub>ij</sub>) dihitung berdasarkan tipe kriteria:
                        </p>
                        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 font-mono text-[11px] space-y-1.5 text-slate-800">
                            <div>
                                <span className="font-bold text-slate-900">Kriteria Benefit:</span>
                                <div className="pl-2 text-slate-600">R<sub>ij</sub> = X<sub>ij</sub> / Max(X<sub>ij</sub>)</div>
                            </div>
                            <div className="border-t border-slate-200 pt-1">
                                <span className="font-bold text-slate-900">Kriteria Cost:</span>
                                <div className="pl-2 text-slate-600">R<sub>ij</sub> = Min(X<sub>ij</sub>) / X<sub>ij</sub></div>
                            </div>
                        </div>
                    </div>

                    {/* Aturan Rekomendasi Plafon */}
                    <div className="bg-white border border-slate-200 rounded p-4 space-y-2">
                        <h3 className="text-xs font-bold text-slate-900 uppercase">
                            Ketentuan Ambang Batas Persetujuan
                        </h3>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                            Penetapan keputusan berdasarkan Nilai Preferensi akhir (V<sub>i</sub>):
                        </p>
                        <div className="space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between p-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded font-medium">
                                <span>V<sub>i</sub> &ge; 0,7500 : <strong>LAYAK</strong></span>
                                <span className="font-semibold">Plafon Disetujui 100%</span>
                            </div>
                            <div className="flex items-center justify-between p-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded font-medium">
                                <span>0,6000 &le; V<sub>i</sub> &lt; 0,7500 : <strong>DIPERTIMBANGKAN</strong></span>
                                <span className="font-semibold">Plafon Disesuaikan 70%</span>
                            </div>
                            <div className="flex items-center justify-between p-1.5 bg-red-50 text-red-900 border border-red-200 rounded font-medium">
                                <span>V<sub>i</sub> &lt; 0,6000 : <strong>TIDAK LAYAK</strong></span>
                                <span className="font-semibold">Permohonan Ditolak</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tautan Cepat Navigasi */}
                <div className="pt-2 flex justify-end space-x-3">
                    <Link
                        href="/debitur"
                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded transition"
                    >
                        Ke Daftar Berkas Debitur
                    </Link>
                    <Link
                        href="/spk-saw"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded transition"
                    >
                        Buka Kalkulasi SPK SAW
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}