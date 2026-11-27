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

interface Debitur {
    id: number;
    no_anggota: string;
    nama_lengkap: string;
    nik?: string;
    unit_kerja?: string;
    alamat: string;
    telepon: string;
    nominal_pengajuan: number;
    tenor_bulan: number;
}

interface Props {
    debitur: Debitur;
    kriterias: Kriteria[];
    initial_penilaian: Record<number, number>;
}

export default function DebiturEdit({ debitur, kriterias, initial_penilaian }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        no_anggota: debitur.no_anggota || '',
        nama_lengkap: debitur.nama_lengkap || '',
        nik: debitur.nik || '',
        unit_kerja: debitur.unit_kerja || '',
        alamat: debitur.alamat || '',
        telepon: debitur.telepon || '',
        nominal_pengajuan: debitur.nominal_pengajuan || '',
        tenor_bulan: debitur.tenor_bulan || '12',
        penilaian: initial_penilaian || {},
    });

    const handlePenilaianChange = (kriteriaId: number, nilai: number) => {
        setData('penilaian', {
            ...data.penilaian,
            [kriteriaId]: nilai,
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/debitur/${debitur.id}`);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-base font-bold text-slate-900">Verifikasi & Penilaian Berkas Debitur</h1>
                        <p className="text-xs text-slate-500">
                            Evaluasi parameter kriteria AHP-SAW untuk debitur: {debitur.nama_lengkap} ({debitur.no_anggota})
                        </p>
                    </div>
                    <Link
                        href="/debitur"
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                        ← Kembali ke Daftar Debitur
                    </Link>
                </div>
            }
        >
            <Head title={`Penilaian Debitur - ${debitur.nama_lengkap}`} />

            <form onSubmit={submit} className="max-w-5xl mx-auto space-y-5">
                {/* Bagian 1: Data Pokok Debitur */}
                <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
                    <div className="border-b border-slate-200 pb-2">
                        <h2 className="text-xs font-bold text-slate-900 uppercase">
                            Bagian I: Data Pokok Anggota Pemohon
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Anggota</label>
                            <input
                                type="text"
                                className="w-full text-xs font-mono rounded border-slate-300 focus:border-slate-800 focus:ring-slate-800 py-2 bg-slate-50"
                                value={data.no_anggota}
                                onChange={(e) => setData('no_anggota', e.target.value)}
                                required
                            />
                            {errors.no_anggota && <p className="text-red-600 text-xs mt-1">{errors.no_anggota}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                            <input
                                type="text"
                                className="w-full text-xs rounded border-slate-300 focus:border-slate-800 focus:ring-slate-800 py-2"
                                value={data.nama_lengkap}
                                onChange={(e) => setData('nama_lengkap', e.target.value)}
                                required
                            />
                            {errors.nama_lengkap && <p className="text-red-600 text-xs mt-1">{errors.nama_lengkap}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Kerja / Divisi</label>
                            <input
                                type="text"
                                className="w-full text-xs rounded border-slate-300 focus:border-slate-800 focus:ring-slate-800 py-2"
                                value={data.unit_kerja}
                                onChange={(e) => setData('unit_kerja', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor KTP (NIK)</label>
                            <input
                                type="text"
                                className="w-full text-xs font-mono rounded border-slate-300 focus:border-slate-800 focus:ring-slate-800 py-2"
                                value={data.nik}
                                onChange={(e) => setData('nik', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Nominal Permohonan (Rp)</label>
                            <input
                                type="number"
                                step="500000"
                                className="w-full text-xs font-semibold rounded border-slate-300 focus:border-slate-800 focus:ring-slate-800 py-2"
                                value={data.nominal_pengajuan}
                                onChange={(e) => setData('nominal_pengajuan', e.target.value)}
                                required
                            />
                            {errors.nominal_pengajuan && <p className="text-red-600 text-xs mt-1">{errors.nominal_pengajuan}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Jangka Waktu (Tenor)</label>
                            <select
                                className="w-full text-xs rounded border-slate-300 focus:border-slate-800 focus:ring-slate-800 py-2"
                                value={data.tenor_bulan}
                                onChange={(e) => setData('tenor_bulan', e.target.value)}
                                required
                            >
                                <option value="6">6 Bulan</option>
                                <option value="10">10 Bulan</option>
                                <option value="12">12 Bulan (1 Tahun)</option>
                                <option value="18">18 Bulan</option>
                                <option value="24">24 Bulan (2 Tahun)</option>
                                <option value="36">36 Bulan (3 Tahun)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
                            <input
                                type="text"
                                className="w-full text-xs font-mono rounded border-slate-300 focus:border-slate-800 focus:ring-slate-800 py-2"
                                value={data.telepon}
                                onChange={(e) => setData('telepon', e.target.value)}
                                required
                            />
                            {errors.telepon && <p className="text-red-600 text-xs mt-1">{errors.telepon}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                            <input
                                type="text"
                                className="w-full text-xs rounded border-slate-300 focus:border-slate-800 focus:ring-slate-800 py-2"
                                value={data.alamat}
                                onChange={(e) => setData('alamat', e.target.value)}
                                required
                            />
                            {errors.alamat && <p className="text-red-600 text-xs mt-1">{errors.alamat}</p>}
                        </div>
                    </div>
                </div>

                {/* Bagian 2: Penilaian Parameter 5 Kriteria */}
                <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
                    <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
                        <div>
                            <h2 className="text-xs font-bold text-slate-900 uppercase">
                                Bagian II: Penilaian Parameter 5 Kriteria (AHP-SAW)
                            </h2>
                            <p className="text-[11px] text-slate-500">
                                Pilih parameter sub-kriteria yang sesuai dengan dokumen fisik berkas permohonan.
                            </p>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                            Total Bobot AHP: 100%
                        </span>
                    </div>

                    <div className="space-y-4">
                        {kriterias.map((kriteria) => {
                            const selectedSkor = data.penilaian[kriteria.id];

                            return (
                                <div key={kriteria.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-mono text-xs font-bold text-slate-900 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                                                {kriteria.kode}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-900">
                                                {kriteria.nama_kriteria}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                                            <span>Sifat: <strong className="uppercase font-semibold">{kriteria.tipe}</strong></span>
                                            <span>•</span>
                                            <span>Bobot AHP: <strong>{(Number(kriteria.bobot_ahp) * 100).toFixed(2)}%</strong></span>
                                        </div>
                                    </div>

                                    {/* Pilihan Radio / Sub-Kriteria */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                                        {kriteria.sub_kriterias.map((sub) => {
                                            const isChecked = Number(selectedSkor) === Number(sub.nilai_bobot);

                                            return (
                                                <label
                                                    key={sub.id}
                                                    className={`flex items-start p-2.5 rounded border text-xs cursor-pointer transition ${
                                                        isChecked
                                                            ? 'bg-white border-slate-900 text-slate-950 font-semibold shadow-xs'
                                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`kriteria_${kriteria.id}`}
                                                        value={sub.nilai_bobot}
                                                        checked={isChecked}
                                                        onChange={() => handlePenilaianChange(kriteria.id, Number(sub.nilai_bobot))}
                                                        className="mt-0.5 text-slate-900 focus:ring-slate-800"
                                                        required
                                                    />
                                                    <div className="ml-2">
                                                        <p className="leading-tight">{sub.deskripsi}</p>
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            Skor: {sub.nilai_bobot}
                                                        </span>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tombol Simpan Evaluasi */}
                <div className="flex justify-end items-center space-x-3 pt-2">
                    <Link
                        href="/debitur"
                        className="px-4 py-2 rounded text-xs font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition"
                    >
                        Batalkan
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-5 py-2 rounded text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition disabled:opacity-50"
                    >
                        {processing ? 'Menyimpan & Menghitung...' : 'Simpan Penilaian & Jalankan SPK SAW'}
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}