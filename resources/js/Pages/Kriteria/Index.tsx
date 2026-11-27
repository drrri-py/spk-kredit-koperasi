import React, { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

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

interface AhpPair {
    kriteria_1_id: number;
    kriteria_2_id: number;
    kode_1: string;
    kode_2: string;
    nama_1: string;
    nama_2: string;
    nilai: number;
}

interface AhpData {
    kriterias: string[];
    n: number;
    matrix: Record<string, Record<string, number>>;
    normalized_matrix: Record<string, Record<string, number>>;
    column_sums: Record<string, number>;
    weights: Record<string, number>;
    pairs: AhpPair[];
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

const SAATY_OPTIONS: { value: number; label: string }[] = [
    { value: 9, label: '9 (Mutlak lebih penting)' },
    { value: 8, label: '8' },
    { value: 7, label: '7 (Sangat lebih penting)' },
    { value: 6, label: '6' },
    { value: 5, label: '5 (Lebih penting)' },
    { value: 4, label: '4' },
    { value: 3, label: '3 (Sedikit lebih penting)' },
    { value: 2, label: '2' },
    { value: 1, label: '1 (Sama penting)' },
    { value: 0.5, label: '1/2' },
    { value: 0.3333, label: '1/3 (Kurang penting)' },
    { value: 0.25, label: '1/4' },
    { value: 0.2, label: '1/5 (Jauh kurang penting)' },
    { value: 0.1667, label: '1/6' },
    { value: 0.1429, label: '1/7 (Sangat kurang penting)' },
    { value: 0.125, label: '1/8' },
    { value: 0.1111, label: '1/9 (Mutlak kurang penting)' },
];

const RANDOM_INDEX: Record<number, number> = {
    1: 0.0,
    2: 0.0,
    3: 0.58,
    4: 0.9,
    5: 1.12,
    6: 1.24,
    7: 1.32,
    8: 1.41,
    9: 1.45,
    10: 1.49,
};

function findClosestSaatyValue(val: number): number {
    let closest = SAATY_OPTIONS[8].value;
    let minDiff = Infinity;
    for (const opt of SAATY_OPTIONS) {
        const diff = Math.abs(opt.value - val);
        if (diff < minDiff) {
            minDiff = diff;
            closest = opt.value;
        }
    }
    return closest;
}

export default function Index({ kriterias, ahp }: Props) {
    const [tab, setTab] = useState<'daftar' | 'matriks_ahp'>('daftar');
    const [processing, setProcessing] = useState(false);

    const { flash } = usePage<PageProps<{ flash?: { success?: string; warning?: string; error?: string } }>>().props;

    // State nilai pasangan segitiga atas, keyed by "kode_1-kode_2"
    const [pairValues, setPairValues] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        for (const p of ahp.pairs) {
            initial[`${p.kode_1}-${p.kode_2}`] = findClosestSaatyValue(Number(p.nilai));
        }
        return initial;
    });

    // Hitung preview AHP secara live saat dropdown diubah
    const liveAhp = useMemo(() => {
        const kodes = kriterias.map((k) => k.kode);
        const n = kodes.length;
        if (n === 0) {
            return ahp;
        }

        const matrix: Record<string, Record<string, number>> = {};
        for (let i = 0; i < n; i++) {
            const row = kodes[i];
            matrix[row] = {};
            for (let j = 0; j < n; j++) {
                const col = kodes[j];
                if (i === j) {
                    matrix[row][col] = 1;
                } else if (i < j) {
                    matrix[row][col] = pairValues[`${row}-${col}`] ?? ahp.matrix?.[row]?.[col] ?? 1;
                } else {
                    const upper = pairValues[`${col}-${row}`] ?? ahp.matrix?.[col]?.[row] ?? 1;
                    matrix[row][col] = upper > 0 ? 1 / upper : 1;
                }
            }
        }

        const columnSums: Record<string, number> = {};
        for (const col of kodes) {
            let sum = 0;
            for (const row of kodes) {
                sum += matrix[row][col];
            }
            columnSums[col] = sum;
        }

        const weights: Record<string, number> = {};
        for (const row of kodes) {
            let rowSum = 0;
            for (const col of kodes) {
                const colSum = columnSums[col];
                rowSum += colSum > 0 ? matrix[row][col] / colSum : 0;
            }
            weights[row] = rowSum / n;
        }

        let lambdaSum = 0;
        for (const row of kodes) {
            let ws = 0;
            for (const col of kodes) {
                ws += matrix[row][col] * weights[col];
            }
            lambdaSum += weights[row] > 0 ? ws / weights[row] : 0;
        }

        const lambdaMax = lambdaSum / n;
        const ci = n > 1 ? (lambdaMax - n) / (n - 1) : 0;
        const ri = RANDOM_INDEX[n] ?? 1.49;
        const cr = ri > 0 ? ci / ri : 0;

        return {
            kriterias: kodes,
            n,
            matrix,
            column_sums: columnSums,
            weights,
            lambda_max: lambdaMax,
            ci,
            ri,
            cr,
            is_consistent: cr <= 0.1,
        };
    }, [kriterias, pairValues, ahp]);

    const handlePairChange = (kode1: string, kode2: string, value: number) => {
        setPairValues((prev) => ({
            ...prev,
            [`${kode1}-${kode2}`]: value,
        }));
    };

    const handleResetDefault = () => {
        const reset: Record<string, number> = {};
        for (const p of ahp.pairs) {
            reset[`${p.kode_1}-${p.kode_2}`] = findClosestSaatyValue(Number(p.nilai));
        }
        setPairValues(reset);
    };

    const handleSubmitAhp = (e: React.FormEvent) => {
        e.preventDefault();
        const comparisons = ahp.pairs.map((p) => ({
            kriteria_1_id: p.kriteria_1_id,
            kriteria_2_id: p.kriteria_2_id,
            nilai: pairValues[`${p.kode_1}-${p.kode_2}`] ?? p.nilai,
        }));

        setProcessing(true);
        router.post(
            route('kriteria.ahp.update'),
            { comparisons },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Master Kriteria & Pembobotan AHP</h1>
                    <p className="text-xs text-slate-400">Parameter acuan dan perhitungan bobot dinamis metode AHP</p>
                </div>
            }
        >
            <Head title="Kriteria & AHP" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-sm font-medium">
                        {flash.success}
                    </div>
                )}
                {flash?.warning && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl text-sm font-medium">
                        {flash.warning}
                    </div>
                )}

                {/* Tab Switcher */}
                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 max-w-md">
                    <button
                        type="button"
                        onClick={() => setTab('daftar')}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                            tab === 'daftar' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600'
                        }`}
                    >
                        1. Daftar Kriteria & Sub
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('matriks_ahp')}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                            tab === 'matriks_ahp' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600'
                        }`}
                    >
                        2. Matriks & Uji Konsistensi AHP
                    </button>
                </div>

                {tab === 'daftar' ? (
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-[0px_18px_40px_rgba(112,144,176,0.08)] border border-slate-100">
                            <h2 className="text-sm font-bold text-slate-800 mb-4">
                                {kriterias.length} Kriteria Utama Analisis Kredit
                            </h2>
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
                                                    {Number(k.bobot_ahp).toFixed(4)}
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                                                    {(Number(k.bobot_ahp) * 100).toFixed(2)}%
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
                                            Bobot: {Number(k.bobot_ahp).toFixed(4)}
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
                    <form onSubmit={handleSubmitAhp} className="space-y-6">
                        {/* Banner Konsistensi Dinamis */}
                        <div
                            className={`rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 ${
                                liveAhp.is_consistent
                                    ? 'bg-emerald-500 shadow-emerald-100'
                                    : 'bg-rose-500 shadow-rose-100'
                            }`}
                        >
                            <div>
                                <h3 className="text-lg font-bold">
                                    {liveAhp.is_consistent
                                        ? 'Hasil Uji Konsistensi AHP: KONSISTEN (VALID)'
                                        : 'Hasil Uji Konsistensi AHP: TIDAK KONSISTEN'}
                                </h3>
                                <p className="text-white/90 text-xs mt-1">
                                    {liveAhp.is_consistent
                                        ? 'Nilai Consistency Ratio (CR) berada di bawah ambang batas toleransi Saaty (CR ≤ 0.10). Bobot siap diterapkan ke perhitungan SAW.'
                                        : 'Nilai Consistency Ratio (CR) melebihi 0.10. Sesuaikan kembali skala perbandingan agar matriks konsisten sebelum bobot diterapkan.'}
                                </p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl text-center shrink-0">
                                <span className="block text-[10px] uppercase font-bold text-white/90">Nilai CR</span>
                                <span className="text-2xl font-black font-mono">{liveAhp.cr.toFixed(4)}</span>
                                <span className="block text-[10px] text-white/90">
                                    ({(liveAhp.cr * 100).toFixed(2)}% {liveAhp.is_consistent ? '≤' : '>'} 10%)
                                </span>
                            </div>
                        </div>

                        {/* Matriks Perbandingan Berpasangan Interaktif */}
                        <div className="bg-white rounded-3xl p-6 shadow-[0px_18px_40px_rgba(112,144,176,0.08)] border border-slate-100 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm">
                                        Matriks Perbandingan Berpasangan (Pairwise Comparison)
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Ubah nilai perbandingan pada segitiga atas (skala Saaty 1–9). Nilai resiprokal di segitiga bawah terhitung otomatis.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleResetDefault}
                                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                                    >
                                        Reset ke Tersimpan
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                                    >
                                        {processing ? 'Menghitung...' : 'Hitung & Simpan Bobot AHP'}
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-center text-sm font-mono">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase">
                                            <th className="py-3 px-4 text-left">Kriteria</th>
                                            {liveAhp.kriterias.map((k) => (
                                                <th key={k} className="py-3 px-4">
                                                    {k}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {liveAhp.kriterias.map((row, rowIdx) => (
                                            <tr key={row} className="border-b border-slate-50">
                                                <td className="py-3 px-4 font-bold text-slate-800 text-left">{row}</td>
                                                {liveAhp.kriterias.map((col, colIdx) => {
                                                    if (rowIdx === colIdx) {
                                                        return (
                                                            <td key={col} className="py-3 px-2">
                                                                <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold">
                                                                    1.00
                                                                </span>
                                                            </td>
                                                        );
                                                    }

                                                    if (rowIdx < colIdx) {
                                                        const currentVal = pairValues[`${row}-${col}`] ?? liveAhp.matrix[row][col];
                                                        return (
                                                            <td key={col} className="py-2 px-2">
                                                                <select
                                                                    value={currentVal}
                                                                    onChange={(e) =>
                                                                        handlePairChange(row, col, parseFloat(e.target.value))
                                                                    }
                                                                    aria-label={`Perbandingan ${row} terhadap ${col}`}
                                                                    className="w-28 text-xs font-mono font-semibold text-indigo-700 bg-indigo-50/70 border border-indigo-200 rounded-xl px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                                >
                                                                    {SAATY_OPTIONS.map((opt) => (
                                                                        <option key={opt.value} value={opt.value}>
                                                                            {opt.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                        );
                                                    }

                                                    return (
                                                        <td key={col} className="py-3 px-4 text-slate-500 text-xs">
                                                            {Number(liveAhp.matrix[row][col]).toFixed(2)}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                        <tr className="bg-slate-50 font-bold text-indigo-600">
                                            <td className="py-3 px-4 text-left">Jumlah Kolom</td>
                                            {liveAhp.kriterias.map((k) => (
                                                <td key={k} className="py-3 px-4">
                                                    {liveAhp.column_sums[k].toFixed(4)}
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Hasil Priority Vector (Bobot Kriteria) */}
                        <div className="bg-white rounded-3xl p-6 shadow-[0px_18px_40px_rgba(112,144,176,0.08)] border border-slate-100 space-y-3">
                            <h3 className="font-bold text-slate-800 text-sm">Preview Bobot Prioritas AHP (Priority Vector)</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {kriterias.map((k) => {
                                    const w = liveAhp.weights[k.kode] ?? Number(k.bobot_ahp);
                                    return (
                                        <div
                                            key={k.id}
                                            className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1"
                                        >
                                            <span className="text-xs font-mono font-bold text-indigo-600">{k.kode}</span>
                                            <p className="text-xs font-semibold text-slate-700 truncate" title={k.nama_kriteria}>
                                                {k.nama_kriteria}
                                            </p>
                                            <p className="text-lg font-black font-mono text-slate-800">{w.toFixed(4)}</p>
                                            <span className="text-[11px] text-slate-400">{(w * 100).toFixed(2)}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Parameter Indeks Konsistensi */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <span className="text-xs text-slate-400 font-bold block mb-1">Jumlah Kriteria (n)</span>
                                <span className="text-xl font-bold font-mono text-slate-800">{liveAhp.n}</span>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <span className="text-xs text-slate-400 font-bold block mb-1">&lambda; Max</span>
                                <span className="text-xl font-bold font-mono text-slate-800">{liveAhp.lambda_max.toFixed(4)}</span>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <span className="text-xs text-slate-400 font-bold block mb-1">Consistency Index (CI)</span>
                                <span className="text-xl font-bold font-mono text-slate-800">{liveAhp.ci.toFixed(4)}</span>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <span className="text-xs text-slate-400 font-bold block mb-1">Random Index (RI)</span>
                                <span className="text-xl font-bold font-mono text-slate-800">{liveAhp.ri.toFixed(2)}</span>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
