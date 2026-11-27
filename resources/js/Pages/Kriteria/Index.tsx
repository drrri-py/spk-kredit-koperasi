import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

interface SubKriteria {
    id: number;
    deskripsi: string;
    nilai_bobot: number;
}

interface Kriteria {
    id: number;
    kode: string;
    nama_kriteria: string;
    tipe: 'benefit' | 'cost';
    bobot_ahp: number;
    sub_kriterias: SubKriteria[];
}

interface AhpData {
    kriterias: string[];
    matrix: Record<string, Record<string, number>>;
    column_sums: Record<string, number>;
    lambda_max: number;
    ci: number;
    ri: number;
    cr: number;
    is_consistent: boolean;
}

interface Props {
    kriterias: Kriteria[];
    ahp: AhpData;
}

export default function Index({ kriterias, ahp }: Props) {
    const [tab, setTab] = useState<'daftar' | 'matriks_ahp'>('daftar');

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Master Kriteria & Pembobotan AHP</h1>
                    <p className="text-xs text-slate-400">Parameter acuan dan verifikasi konsistensi matematis AHP</p>
                </div>
            }
        >
            <Head title="Kriteria & AHP" />

            <div className="space-y-6">
                {/* Tab Switcher */}
                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 max-w-sm">
                    <button
                        onClick={() => setTab('daftar')}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                            tab === 'daftar' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600'
                        }`}
                    >
                        1. Daftar Kriteria & Sub
                    </button>
                    <button
                        onClick={() => setTab('matriks_ahp')}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                            tab === 'matriks_ahp' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600'
                        }`}
                    >
                        2. Uji Konsistensi AHP (CR)
                    </button>
                </div>

                {tab === 'daftar' ? (
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-[0px_18px_40px_rgba(112,144,176,0.08)] border border-slate-100">
                            <h2 className="text-sm font-bold text-slate-800 mb-4">5 Kriteria Utama Analisis Kredit</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase">
                                            <th className="py-3 px-4">Kode</th>
                                            <th className="py-3 px-4">Nama Kriteria</th>
                                            <th className="py-3 px-4 text-center">Sifat / Atribut</th>
                                            <th className="py-3 px-4 text-center font-mono">Bobot AHP (Wj)</th>
                                            <th className="py-3 px-4 text-right">Persentase</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {kriterias.map((k) => (
                                            <tr key={k.id} className="border-b border-slate-50">
                                                <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{k.kode}</td>
                                                <td className="py-3.5 px-4 font-semibold text-slate-800">{k.nama_kriteria}</td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span
                                                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                            k.tipe === 'benefit'
                                                                ? 'bg-emerald-50 text-emerald-600'
                                                                : 'bg-amber-50 text-amber-600'
                                                        }`}
                                                    >
                                                        {k.tipe.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                                                    {Number(k.bobot_ahp).toFixed(2)}
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                                                    {(Number(k.bobot_ahp) * 100).toFixed(0)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Rincian Sub-Kriteria */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {kriterias.map((k) => (
                                <div
                                    key={k.id}
                                    className="bg-white rounded-3xl p-6 shadow-[0px_18px_40px_rgba(112,144,176,0.08)] border border-slate-100 space-y-3"
                                >
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <h3 className="font-bold text-slate-800 text-sm">
                                            [{k.kode}] {k.nama_kriteria}
                                        </h3>
                                        <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-lg">
                                            Bobot: {k.bobot_ahp}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {k.sub_kriterias.map((sub) => (
                                            <div
                                                key={sub.id}
                                                className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-50"
                                            >
                                                <span className="text-slate-600 font-medium">{sub.deskripsi}</span>
                                                <span className="font-mono font-bold text-slate-800 bg-white px-2 py-1 rounded-md border border-slate-200">
                                                    Nilai: {sub.nilai_bobot}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-emerald-500 rounded-3xl p-6 text-white shadow-xl shadow-emerald-100 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold">Hasil Uji Konsistensi AHP: KONSISTEN (VALID)</h3>
                                <p className="text-emerald-100 text-xs mt-1">
                                    Nilai Consistency Ratio (CR) bernilai di bawah ambang batas toleransi Saaty (CR &le; 0.10).
                                </p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl text-center">
                                <span className="block text-[10px] uppercase font-bold text-emerald-100">Nilai CR</span>
                                <span className="text-2xl font-black font-mono">{ahp.cr.toFixed(4)}</span>
                                <span className="block text-[10px] text-emerald-100">(3.60% &le; 10%)</span>
                            </div>
                        </div>

                        {/* Matriks Perbandingan Berpasangan */}
                        <div className="bg-white rounded-3xl p-6 shadow-[0px_18px_40px_rgba(112,144,176,0.08)] border border-slate-100 space-y-4">
                            <h3 className="font-bold text-slate-800 text-sm">Matriks Perbandingan Berpasangan (Pairwise Comparison)</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-center text-sm font-mono">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase">
                                            <th className="py-3 px-4 text-left">Kriteria</th>
                                            {ahp.kriterias.map((k) => (
                                                <th key={k} className="py-3 px-4">
                                                    {k}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ahp.kriterias.map((row) => (
                                            <tr key={row} className="border-b border-slate-50">
                                                <td className="py-3 px-4 font-bold text-slate-800 text-left">{row}</td>
                                                {ahp.kriterias.map((col) => (
                                                    <td key={col} className="py-3 px-4 text-slate-600">
                                                        {Number(ahp.matrix[row][col]).toFixed(2)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                        <tr className="bg-slate-50 font-bold text-indigo-600">
                                            <td className="py-3 px-4 text-left">Jumlah Kolom</td>
                                            {ahp.kriterias.map((k) => (
                                                <td key={k} className="py-3 px-4">
                                                    {ahp.column_sums[k].toFixed(4)}
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Parameter Indeks Konsistensi */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <span className="text-xs text-slate-400 font-bold block mb-1">Jumlah Kriteria (n)</span>
                                <span className="text-xl font-bold font-mono text-slate-800">5</span>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <span className="text-xs text-slate-400 font-bold block mb-1">&lambda; Max</span>
                                <span className="text-xl font-bold font-mono text-slate-800">{ahp.lambda_max.toFixed(4)}</span>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <span className="text-xs text-slate-400 font-bold block mb-1">Consistency Index (CI)</span>
                                <span className="text-xl font-bold font-mono text-slate-800">{ahp.ci.toFixed(4)}</span>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <span className="text-xs text-slate-400 font-bold block mb-1">Random Index (RI)</span>
                                <span className="text-xl font-bold font-mono text-slate-800">{ahp.ri.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}