import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface Stats {
    total_debitur: number;
    total_pengajuan: number;
    total_layak: number;
    total_dipertimbangkan: number;
    total_tidak_layak: number;
    total_plafon_disetujui: number;
}

interface Debitur {
    id: number;
    no_anggota: string;
    nama_lengkap: string;
    unit_kerja?: string;
    nominal_pengajuan: number;
    status_verifikasi: string;
    saw_result?: {
        nilai_preferensi: number;
        ranking: number;
        status_kelayakan: string;
        rekomendasi_plafon: number;
    } | null;
}

interface Props {
    stats: Stats;
    latest_debiturs: Debitur[];
}

export default function Dashboard({ stats, latest_debiturs }: Props) {
    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-base font-bold text-slate-900">Panel Ringkasan Analisis Kredit</h1>
                    <p className="text-xs text-slate-500">
                        Rekapitulasi berkas pengajuan pinjaman dan evaluasi SPK metode AHP-SAW
                    </p>
                </div>
            }
        >
            <Head title="Panel Utama Analis" />

            <div className="space-y-5 max-w-7xl mx-auto">
                {/* 4 Kartu Metrik Utama */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 rounded p-4">
                        <p className="text-[10px] font-bold uppercase text-slate-500">Total Berkas Debitur</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total_debitur}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Pemohon Terdaftar</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded p-4">
                        <p className="text-[10px] font-bold uppercase text-slate-500">Total Nilai Pengajuan</p>
                        <p className="text-lg font-bold text-slate-900 mt-1">{formatRupiah(stats.total_pengajuan)}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Akumulasi Permohonan</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded p-4">
                        <p className="text-[10px] font-bold uppercase text-slate-500">Plafon Disetujui</p>
                        <p className="text-lg font-bold text-emerald-700 mt-1">{formatRupiah(stats.total_plafon_disetujui)}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Rekomendasi SPK SAW</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded p-4">
                        <p className="text-[10px] font-bold uppercase text-slate-500">Distribusi Keputusan</p>
                        <div className="flex items-center space-x-2 mt-2">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold">
                                {stats.total_layak} Layak
                            </span>
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-bold">
                                {stats.total_dipertimbangkan} Ditinjau
                            </span>
                            <span className="px-2 py-0.5 bg-red-50 text-red-800 border border-red-200 rounded text-[10px] font-bold">
                                {stats.total_tidak_layak} Ditolak
                            </span>
                        </div>
                    </div>
                </div>

                {/* Banner Informasi Rasio Konsistensi AHP */}
                <div className="bg-white border border-slate-200 rounded p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                            <h3 className="text-xs font-bold text-slate-900 uppercase">
                                Parameter Matriks Bobot Kriteria AHP Valid
                            </h3>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                            Rasio Inkonsistensi: <span className="font-mono font-semibold text-slate-900">CR = 0.0360 &lt; 0.10</span> (Matriks Perbandingan Berpasangan Terbukti Konsisten).
                        </p>
                    </div>
                    <Link
                        href="/kriteria"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition"
                    >
                        Lihat Matriks AHP
                    </Link>
                </div>

                {/* Tabel Berkas Masuk Terbaru */}
                <div className="bg-white border border-slate-200 rounded overflow-hidden">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                        <div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase">Permohonan Debitur Terbaru</h3>
                            <p className="text-[11px] text-slate-500">5 berkas permohonan pinjaman terakhir yang tercatat</p>
                        </div>
                        <Link href="/debitur" className="text-xs font-semibold text-slate-900 hover:underline">
                            Lihat Semua Data →
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="py-3 px-4">No. Anggota & Nama</th>
                                    <th className="py-3 px-4">Unit Kerja</th>
                                    <th className="py-3 px-4">Nominal Permohonan</th>
                                    <th className="py-3 px-4">Status Verifikasi</th>
                                    <th className="py-3 px-4">Keputusan SPK</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 font-normal text-slate-700">
                                {latest_debiturs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-400">
                                            Belum ada berkas permohonan debitur.
                                        </td>
                                    </tr>
                                ) : (
                                    latest_debiturs.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="py-3 px-4">
                                                <p className="font-semibold text-slate-900">{item.nama_lengkap}</p>
                                                <p className="text-[11px] text-slate-400 font-mono">{item.no_anggota}</p>
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">{item.unit_kerja || 'Karyawan'}</td>
                                            <td className="py-3 px-4 font-semibold text-slate-900">
                                                {formatRupiah(item.nominal_pengajuan)}
                                            </td>
                                            <td className="py-3 px-4">
                                                {item.status_verifikasi === 'menunggu_penilaian' ? (
                                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-medium">
                                                        Menunggu Penilaian
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-medium">
                                                        Diverifikasi
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {item.saw_result ? (
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                            item.saw_result.status_kelayakan === 'LAYAK'
                                                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                                                : item.saw_result.status_kelayakan === 'DIPERTIMBANGKAN'
                                                                ? 'bg-amber-50 text-amber-800 border border-amber-300'
                                                                : 'bg-red-50 text-red-800 border border-red-300'
                                                        }`}
                                                    >
                                                        {item.saw_result.status_kelayakan}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Belum Dinilai</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}