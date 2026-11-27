import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

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

interface Props {
    kriterias: Kriteria[];
}

export default function Create({ kriterias }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        no_anggota: '',
        nama_lengkap: '',
        nik: '',
        unit_kerja: '',
        alamat: '',
        telepon: '',
        nominal_pengajuan: '',
        tenor_bulan: '12',
        penilaian: {} as Record<number, number>,
    });

    const handleSubSelect = (kriteriaId: number, nilaiBobot: number) => {
        setData('penilaian', {
            ...data.penilaian,
            [kriteriaId]: nilaiBobot,
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/debitur');
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Form Pengajuan & Penilaian Debitur</h1>
                    <p className="text-xs text-slate-400">Input data anggota dan tentukan parameter skor kriteria</p>
                </div>
            }
        >
            <Head title="Tambah Debitur & Penilaian" />

            <form onSubmit={submit} className="max-w-5xl space-y-6">
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0px_18px_40px_rgba(112,144,176,0.08)] border border-slate-100 space-y-4">
                    <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
                        1. Informasi Anggota & Pinjaman
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">No. Anggota Koperasi</label>
                            <input
                                type="text"
                                placeholder="Contoh: KOP-MP-001"
                                className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.no_anggota}
                                onChange={(e) => setData('no_anggota', e.target.value)}
                                required
                            />
                            {errors.no_anggota && <p className="text-rose-500 text-xs mt-1">{errors.no_anggota}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Nama Lengkap</label>
                            <input
                                type="text"
                                placeholder="Nama sesuai KTP"
                                className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.nama_lengkap}
                                onChange={(e) => setData('nama_lengkap', e.target.value)}
                                required
                            />
                            {errors.nama_lengkap && <p className="text-rose-500 text-xs mt-1">{errors.nama_lengkap}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">NIK (No. KTP)</label>
                            <input
                                type="text"
                                placeholder="16 Digit NIK"
                                className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.nik}
                                onChange={(e) => setData('nik', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Unit Kerja / Bagian</label>
                            <input
                                type="text"
                                placeholder="Contoh: Logistik, Produksi, Admin"
                                className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.unit_kerja}
                                onChange={(e) => setData('unit_kerja', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Nominal Pengajuan (Rp)</label>
                            <input
                                type="number"
                                placeholder="Contoh: 10000000"
                                className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.nominal_pengajuan}
                                onChange={(e) => setData('nominal_pengajuan', e.target.value)}
                                required
                            />
                            {errors.nominal_pengajuan && <p className="text-rose-500 text-xs mt-1">{errors.nominal_pengajuan}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Tenor (Bulan)</label>
                            <input
                                type="number"
                                placeholder="Contoh: 12"
                                className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.tenor_bulan}
                                onChange={(e) => setData('tenor_bulan', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">No. WhatsApp / Telepon</label>
                            <input
                                type="text"
                                placeholder="08xxxxxxxxxx"
                                className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.telepon}
                                onChange={(e) => setData('telepon', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Alamat Domisili</label>
                            <input
                                type="text"
                                placeholder="Alamat lengkap tempat tinggal"
                                className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.alamat}
                                onChange={(e) => setData('alamat', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Form Penilaian Parameter Kriteria */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0px_18px_40px_rgba(112,144,176,0.08)] border border-slate-100 space-y-4">
                    <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
                        2. Parameter Penilaian SPK (Sub-Kriteria AHP)
                    </h2>

                    <div className="space-y-4">
                        {kriterias.map((k) => (
                            <div key={k.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                                        [{k.kode}] {k.nama_kriteria}
                                    </span>
                                    <span className="text-[11px] font-medium text-slate-400">
                                        Sifat: <strong className="uppercase">{k.tipe}</strong> | Bobot AHP: {Number(k.bobot_ahp).toFixed(2)}
                                    </span>
                                </div>

                                <select
                                    className="w-full text-sm rounded-xl border-slate-200 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                                    onChange={(e) => handleSubSelect(k.id, Number(e.target.value))}
                                    defaultValue=""
                                    required
                                >
                                    <option value="" disabled>
                                        -- Pilih Parameter {k.nama_kriteria} --
                                    </option>
                                    {k.sub_kriterias.map((sub) => (
                                        <option key={sub.id} value={sub.nilai_bobot}>
                                            {sub.deskripsi} (Skor: {sub.nilai_bobot})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <Link
                        href="/debitur"
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition disabled:opacity-50"
                    >
                        {processing ? 'Menyimpan...' : 'Simpan & Hitung SPK'}
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}