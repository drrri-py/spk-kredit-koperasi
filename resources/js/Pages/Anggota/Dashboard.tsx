import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface SawResult {
    nilai_preferensi: number;
    ranking: number;
    status_kelayakan: 'LAYAK' | 'DIPERTIMBANGKAN' | 'TIDAK LAYAK';
    rekomendasi_plafon: number;
    catatan_analisis: string;
}

interface Debitur {
    id: number;
    no_anggota: string;
    nama_lengkap: string;
    unit_kerja?: string;
    telepon: string;
    nominal_pengajuan: number;
    tenor_bulan: number;
    status_verifikasi: string;
    created_at?: string;
    saw_result?: SawResult | null;
}

interface User {
    id: number;
    name: string;
    email: string;
    no_anggota?: string;
}

interface Props {
    auth: {
        user: User;
    };
    debitur?: Debitur | null;
}

export default function DashboardAnggota({ auth, debitur }: Props) {
    const user = auth.user;

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    // Penentuan tahapan progres berkas pemohon
    const isSubmitted = !!debitur;
    const isAssessed = !!debitur?.saw_result;
    const isCompleted = isAssessed && debitur?.saw_result?.status_kelayakan;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-base font-bold text-slate-900">Portal Layanan Anggota</h1>
                        <p className="text-xs text-slate-500">
                            Monitoring status pengajuan kredit dan data keanggotaan Koperasi Manunggal Perkasa
                        </p>
                    </div>
                    {!debitur && (
                        <Link
                            href="/anggota/pengajuan"
                            className="inline-flex items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded transition"
                        >
                            + Ajukan Permohonan Pinjaman
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Dashboard Layanan Anggota - Koperasi" />

            <div className="max-w-5xl mx-auto space-y-5">
                {/* KARTU IDENTITAS ANGGOTA */}
                <div className="bg-white border border-slate-200 rounded p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded bg-slate-900 text-white font-bold text-lg flex items-center justify-center">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Anggota Aktif Koperasi
                            </span>
                            <h2 className="text-sm font-bold text-slate-900">{user.name}</h2>
                            <p className="text-xs text-slate-600 font-mono mt-0.5">
                                No. Registrasi: <strong>{user.no_anggota || '-'}</strong> | {user.email}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                        <span className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                            Unit Kerja: {debitur?.unit_kerja || 'Karyawan'}
                        </span>
                    </div>
                </div>

                {/* PELACAK TAHAPAN PENGAJUAN (STEP TRACKER) */}
                <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
                    <div className="border-b border-slate-200 pb-2">
                        <h2 className="text-xs font-bold text-slate-900 uppercase">
                            Progres Evaluasi Permohonan Pinjaman
                        </h2>
                        <p className="text-[11px] text-slate-500">
                            Tahapan alur verifikasi berkas oleh Komite Analis Kredit Koperasi
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        {/* Langkah 1 */}
                        <div
                            className={`p-3.5 rounded border ${
                                isSubmitted
                                    ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                                    : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <span
                                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                        isSubmitted ? 'bg-emerald-700 text-white' : 'bg-slate-300 text-slate-700'
                                    }`}
                                >
                                    1
                                </span>
                                <h3 className="text-xs font-bold">1. Formulir Terkirim</h3>
                            </div>
                            <p className="text-[11px] mt-1 pl-7 leading-relaxed">
                                {isSubmitted
                                    ? 'Berkas permohonan kredit Anda telah tersimpan di sistem koperasi.'
                                    : 'Anda belum mengirimkan formulir permohonan pinjaman.'}
                            </p>
                        </div>

                        {/* Langkah 2 */}
                        <div
                            className={`p-3.5 rounded border ${
                                isAssessed
                                    ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                                    : isSubmitted
                                    ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                                    : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <span
                                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                        isAssessed
                                            ? 'bg-emerald-700 text-white'
                                            : isSubmitted
                                            ? 'bg-amber-600 text-white'
                                            : 'bg-slate-300 text-slate-700'
                                    }`}
                                >
                                    2
                                </span>
                                <h3 className="text-xs font-bold">2. Penilaian 5 Kriteria</h3>
                            </div>
                            <p className="text-[11px] mt-1 pl-7 leading-relaxed">
                                {isAssessed
                                    ? 'Petugas telah menyelesaikan verifikasi parameter AHP-SAW.'
                                    : isSubmitted
                                    ? 'Menunggu penilaian dan validasi berkas fisik oleh petugas analis.'
                                    : 'Belum masuk tahap verifikasi analis.'}
                            </p>
                        </div>

                        {/* Langkah 3 */}
                        <div
                            className={`p-3.5 rounded border ${
                                isCompleted
                                    ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                                    : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <span
                                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                        isCompleted ? 'bg-emerald-700 text-white' : 'bg-slate-300 text-slate-700'
                                    }`}
                                >
                                    3
                                </span>
                                <h3 className="text-xs font-bold">3. Keputusan Plafon</h3>
                            </div>
                            <p className="text-[11px] mt-1 pl-7 leading-relaxed">
                                {isCompleted
                                    ? 'Hasil keputusan komite kredit telah diterbitkan secara resmi.'
                                    : 'Keputusan rekomendasi plafon akan muncul setelah proses hitung selesai.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* RINCIAN STATUS BERKAS DAN KEPUTUSAN */}
                {debitur ? (
                    <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
                        <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
                            <div>
                                <h2 className="text-xs font-bold text-slate-900 uppercase">
                                    Rincian Berkas Permohonan Aktif
                                </h2>
                                <p className="text-[11px] text-slate-500">
                                    Nomor Berkas: <span className="font-mono">{debitur.no_anggota}</span>
                                </p>
                            </div>

                            {debitur.saw_result ? (
                                <span
                                    className={`px-3 py-1 rounded text-xs font-bold ${
                                        debitur.saw_result.status_kelayakan === 'LAYAK'
                                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                            : debitur.saw_result.status_kelayakan === 'DIPERTIMBANGKAN'
                                            ? 'bg-amber-50 text-amber-800 border border-amber-300'
                                            : 'bg-red-50 text-red-800 border border-red-300'
                                    }`}
                                >
                                    STATUS: {debitur.saw_result.status_kelayakan}
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                    STATUS: MENUNGGU VERIFIKASI ANALIS
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-3 bg-slate-50 rounded border border-slate-200">
                                <span className="text-[10px] text-slate-500 uppercase font-semibold">
                                    Nominal yang Diajukan
                                </span>
                                <p className="text-sm font-bold text-slate-900 mt-0.5">
                                    {formatRupiah(debitur.nominal_pengajuan)}
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5">Tenor: {debitur.tenor_bulan} Bulan</p>
                            </div>

                            <div className="p-3 bg-slate-50 rounded border border-slate-200">
                                <span className="text-[10px] text-slate-500 uppercase font-semibold">
                                    Nilai Preferensi (SPK SAW)
                                </span>
                                <p className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                                    {debitur.saw_result
                                        ? `V = ${Number(debitur.saw_result.nilai_preferensi).toFixed(4)}`
                                        : 'Sedang dihitung'}
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    {debitur.saw_result
                                        ? `Peringkat Prioritas #${debitur.saw_result.ranking}`
                                        : 'Menunggu penilaian'}
                                </p>
                            </div>

                            <div className="p-3 bg-emerald-50/50 rounded border border-emerald-200">
                                <span className="text-[10px] text-emerald-700 uppercase font-bold">
                                    Rekomendasi Plafon Disetujui
                                </span>
                                <p className="text-sm font-bold text-emerald-800 mt-0.5">
                                    {debitur.saw_result
                                        ? formatRupiah(debitur.saw_result.rekomendasi_plafon)
                                        : '-'}
                                </p>
                                <p className="text-[11px] text-emerald-600 mt-0.5">
                                    {debitur.saw_result?.status_kelayakan === 'LAYAK'
                                        ? 'Persetujuan Plafon 100%'
                                        : debitur.saw_result?.status_kelayakan === 'DIPERTIMBANGKAN'
                                        ? 'Penyesuaian Plafon 70%'
                                        : 'Belum ada rekomendasi'}
                                </p>
                            </div>
                        </div>

                        {/* Catatan Komite Kredit */}
                        {debitur.saw_result?.catatan_analisis && (
                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                                <p className="font-semibold text-slate-800">Catatan Analis Kredit:</p>
                                <p className="text-slate-600 leading-relaxed text-[11px]">
                                    {debitur.saw_result.catatan_analisis}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* KONDISI JIKA BELUM ADA BERKAS */
                    <div className="bg-white border border-slate-200 rounded p-8 text-center space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase">
                            Belum Ada Riwayat Permohonan Pinjaman
                        </h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                            Anda belum mengajukan permohonan fasilitas pinjaman. Silakan gunakan formulir mandiri untuk mengajukan nominal pinjaman yang dibutuhkan.
                        </p>
                        <div className="pt-2">
                            <Link
                                href="/anggota/pengajuan"
                                className="inline-flex items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded transition"
                            >
                                Buka Formulir Pengajuan
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}