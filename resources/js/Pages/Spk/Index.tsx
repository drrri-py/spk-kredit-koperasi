import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface KriteriaDetail {
    id: number;
    kriteria_id: number;
    kriteria?: {
        id: number;
        kode: string;
        nama_kriteria: string;
        tipe: 'benefit' | 'cost';
        bobot_persen: number;
    };
    nilai_skor: number;
}

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
    nominal_pengajuan: number;
    tenor_bulan: number;
    saw_result?: SawResult | null;
    penilaian_details?: KriteriaDetail[];
}

interface Kriteria {
    id: number;
    kode: string;
    nama_kriteria: string;
    tipe: 'benefit' | 'cost';
    bobot_persen: number;
}

interface Props {
    kriterias?: Kriteria[];
    debiturs?: Debitur[];
}

export default function SpkSawIndex({ kriterias = [], debiturs = [] }: Props) {
    const [activeTab, setActiveTab] = useState<'rekap' | 'matriks'>('rekap');

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const assessedDebiturs = (debiturs || []).filter(
        (d) => d.penilaian_details && d.penilaian_details.length > 0
    );

    const kriteriaExtremes: Record<number, { max: number; min: number }> = {};
    (kriterias || []).forEach((k) => {
        const scores = assessedDebiturs
            .map((d) => {
                const detail = d.penilaian_details?.find((p) => p.kriteria_id === k.id);
                return detail ? Number(detail.nilai_skor) : 0;
            })
            .filter((s) => s > 0);

        kriteriaExtremes[k.id] = {
            max: scores.length > 0 ? Math.max(...scores) : 1,
            min: scores.length > 0 ? Math.min(...scores) : 1,
        };
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-base font-bold text-slate-900">Kalkulasi Metode SPK (AHP - SAW)</h1>
                        <p className="text-xs text-slate-500">
                            Evaluasi perankingan preferensi dan rekomendasi persetujuan plafon kredit anggota
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <a
                            href="/spk-saw/export-excel"
                            className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded transition"
                        >
                            Ekspor Excel (.csv)
                        </a>
                        <Link
                            href="/spk-saw/cetak"
                            className="inline-flex items-center px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded transition"
                        >
                            Cetak Laporan PDF
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Kalkulasi SPK SAW - Petugas Analis" />

            <div className="space-y-4 max-w-7xl mx-auto">
                {/* Banner Konsistensi AHP */}
                <div className="bg-white border border-slate-200 rounded p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                            <span className="text-xs font-bold text-slate-900 uppercase">
                                Parameter Integrasi AHP - SAW
                            </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                            Pembobotan kriteria menggunakan AHP dengan rasio inkonsistensi valid:{' '}
                            <span className="font-mono font-semibold text-slate-900">CR = 0.0360 &lt; 0.10</span> (Matriks Konsisten).
                        </p>
                    </div>
                    <div className="flex space-x-1 bg-slate-100 p-1 rounded border border-slate-200 text-xs font-medium">
                        <button
                            type="button"
                            onClick={() => setActiveTab('rekap')}
                            className={`px-3 py-1 rounded transition ${
                                activeTab === 'rekap'
                                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Hasil Keputusan & Plafon
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('matriks')}
                            className={`px-3 py-1 rounded transition ${
                                activeTab === 'matriks'
                                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Matriks Ternormalisasi (R)
                        </button>
                    </div>
                </div>

                {activeTab === 'rekap' ? (
                    /* TAB 1: HASIL KEPUTUSAN DAN PLAFON */
                    <div className="bg-white border border-slate-200 rounded overflow-hidden">
                        <div className="p-4 border-b border-slate-200">
                            <h2 className="text-xs font-bold text-slate-900 uppercase">
                                Rekapitulasi Nilai Preferensi (V) & Rekomendasi Plafon
                            </h2>
                            <p className="text-[11px] text-slate-500">
                                Diurutkan berdasarkan perankingan nilai preferensi tertinggi
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                                    <tr>
                                        <th className="py-3 px-3 text-center w-12">Rank</th>
                                        <th className="py-3 px-4">No. Anggota & Nama</th>
                                        <th className="py-3 px-4">Unit Kerja</th>
                                        <th className="py-3 px-4 text-right">Pengajuan</th>
                                        <th className="py-3 px-3 text-center">Nilai (V)</th>
                                        <th className="py-3 px-3 text-center">Status Keputusan</th>
                                        <th className="py-3 px-4 text-right">Rekomendasi Plafon</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 text-slate-700">
                                    {(debiturs || []).length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-slate-400">
                                                Belum ada data permohonan debitur yang dinilai.
                                            </td>
                                        </tr>
                                    ) : (
                                        debiturs.map((debitur, idx) => {
                                            const res = debitur.saw_result;
                                            return (
                                                <tr key={debitur.id} className="hover:bg-slate-50">
                                                    <td className="py-3 px-3 text-center font-bold text-slate-900 font-mono">
                                                        {res?.ranking || idx + 1}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <p className="font-semibold text-slate-900">{debitur.nama_lengkap}</p>
                                                        <p className="text-[11px] text-slate-400 font-mono">{debitur.no_anggota}</p>
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-600 font-medium">
                                                        {debitur.unit_kerja || 'Karyawan'}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                                                        {formatRupiah(debitur.nominal_pengajuan)}
                                                    </td>
                                                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                                                        {res ? Number(res.nilai_preferensi).toFixed(4) : '-'}
                                                    </td>
                                                    <td className="py-3 px-3 text-center">
                                                        {res ? (
                                                            <span
                                                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                    res.status_kelayakan === 'LAYAK'
                                                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                                                        : res.status_kelayakan === 'DIPERTIMBANGKAN'
                                                                        ? 'bg-amber-50 text-amber-800 border border-amber-300'
                                                                        : 'bg-red-50 text-red-800 border border-red-300'
                                                                }`}
                                                            >
                                                                {res.status_kelayakan}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 italic">Belum Dinilai</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                                                        {res ? formatRupiah(res.rekomendasi_plafon) : '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* TAB 2: MATRIKS TERNORMALISASI R */
                    <div className="bg-white border border-slate-200 rounded overflow-hidden">
                        <div className="p-4 border-b border-slate-200">
                            <h2 className="text-xs font-bold text-slate-900 uppercase">
                                Matriks Ternormalisasi (R)
                            </h2>
                            <p className="text-[11px] text-slate-500">
                                Normalisasi formula Benefit (R = Nilai / Nilai Maksimal) dan Cost (R = Nilai Minimal / Nilai)
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                                    <tr>
                                        <th className="py-3 px-4">Nama Debitur</th>
                                        {kriterias.map((k) => (
                                            <th key={k.id} className="py-3 px-3 text-center font-mono">
                                                {k.kode} ({(k.bobot_persen * 100).toFixed(0)}%)
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 text-slate-700 font-mono">
                                    {assessedDebiturs.length === 0 ? (
                                        <tr>
                                            <td colSpan={kriterias.length + 1} className="py-8 text-center text-slate-400 font-sans">
                                                Belum ada data penilaian kriteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        assessedDebiturs.map((debitur) => (
                                            <tr key={debitur.id} className="hover:bg-slate-50">
                                                <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                                                    {debitur.nama_lengkap}
                                                </td>
                                                {kriterias.map((k) => {
                                                    const detail = debitur.penilaian_details?.find((p) => p.kriteria_id === k.id);
                                                    const xVal = detail ? Number(detail.nilai_skor) : 0;
                                                    const ext = kriteriaExtremes[k.id];

                                                    let rVal = 0;
                                                    if (xVal > 0 && ext) {
                                                        rVal = k.tipe === 'benefit' 
                                                            ? (ext.max > 0 ? xVal / ext.max : 0) 
                                                            : (xVal > 0 ? ext.min / xVal : 0);
                                                    }

                                                    return (
                                                        <td key={k.id} className="py-3 px-3 text-center">
                                                            {rVal > 0 ? rVal.toFixed(4) : '-'}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}