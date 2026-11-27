import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

interface KriteriaDetail {
    id: number;
    kriteria: {
        kode: string;
        nama_kriteria: string;
    };
    nilai_skor: number;
}

interface SawResult {
    nilai_preferensi: number;
    ranking: number;
    status_kelayakan: string;
    rekomendasi_plafon: number;
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
    status_verifikasi: string;
    saw_result?: SawResult | null;
    penilaian_details?: KriteriaDetail[];
}

interface Props {
    debiturs: Debitur[];
}

export default function DebiturIndex({ debiturs }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'semua' | 'menunggu' | 'selesai'>('semua');

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const countMenunggu = debiturs.filter(
        (d) => d.status_verifikasi === 'menunggu_penilaian' || !d.saw_result
    ).length;
    const countSelesai = debiturs.filter(
        (d) => d.status_verifikasi !== 'menunggu_penilaian' && d.saw_result
    ).length;

    const filteredDebiturs = debiturs.filter((d) => {
        const isMenunggu = d.status_verifikasi === 'menunggu_penilaian' || !d.saw_result;

        if (filterStatus === 'menunggu' && !isMenunggu) return false;
        if (filterStatus === 'selesai' && isMenunggu) return false;

        const query = searchQuery.toLowerCase();
        return (
            d.nama_lengkap.toLowerCase().includes(query) ||
            d.no_anggota.toLowerCase().includes(query) ||
            (d.unit_kerja && d.unit_kerja.toLowerCase().includes(query))
        );
    });

    const handleDelete = (id: number, nama: string) => {
        if (confirm(`Hapus permanen berkas permohonan debitur: "${nama}"? Data penilaian dan hasil kalkulasi SAW terkait akan turut dihapus.`)) {
            router.delete(`/debitur/${id}`);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-base font-bold text-slate-900">Daftar Berkas Permohonan Debitur</h1>
                        <p className="text-xs text-slate-500">
                            Kelola data permohonan pinjaman anggota dan verifikasi parameter kelayakan kredit
                        </p>
                    </div>
                    <Link
                        href="/debitur/tambah"
                        className="inline-flex items-center px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded transition"
                    >
                        + Registrasi Debitur Baru
                    </Link>
                </div>
            }
        >
            <Head title="Daftar Berkas Debitur - Petugas Analis" />

            <div className="space-y-4 max-w-7xl mx-auto">
                {/* Kontrol Penyaringan Data */}
                <div className="bg-white p-3.5 border border-slate-200 rounded flex flex-col md:flex-row items-center justify-between gap-3">
                    {/* Tab Status Berkas */}
                    <div className="flex items-center space-x-1.5 w-full md:w-auto">
                        <button
                            onClick={() => setFilterStatus('semua')}
                            className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                                filterStatus === 'semua'
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Semua Berkas ({debiturs.length})
                        </button>

                        <button
                            onClick={() => setFilterStatus('menunggu')}
                            className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                                filterStatus === 'menunggu'
                                    ? 'bg-amber-800 text-white'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                            }`}
                        >
                            Menunggu Penilaian ({countMenunggu})
                        </button>

                        <button
                            onClick={() => setFilterStatus('selesai')}
                            className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                                filterStatus === 'selesai'
                                    ? 'bg-emerald-800 text-white'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            }`}
                        >
                            Selesai Dinilai ({countSelesai})
                        </button>
                    </div>

                    {/* Kolom Pencarian */}
                    <div className="w-full md:w-72">
                        <input
                            type="text"
                            placeholder="Cari nama, no. anggota, atau divisi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full text-xs rounded border-slate-300 focus:border-slate-800 focus:ring-slate-800 py-1.5 px-3"
                        />
                    </div>
                </div>

                {/* Tabel Data Debitur */}
                <div className="bg-white border border-slate-200 rounded overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="py-3 px-4">Identitas Anggota</th>
                                    <th className="py-3 px-4">Unit Kerja</th>
                                    <th className="py-3 px-4">Nominal Permohonan</th>
                                    <th className="py-3 px-4">Status Berkas</th>
                                    <th className="py-3 px-4">Hasil SPK SAW</th>
                                    <th className="py-3 px-4 text-center">Aksi Analis</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-slate-700">
                                {filteredDebiturs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-slate-400">
                                            Tidak ditemukan data permohonan debitur pada kategori ini.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDebiturs.map((debitur) => {
                                        const isMenunggu =
                                            debitur.status_verifikasi === 'menunggu_penilaian' ||
                                            !debitur.saw_result;

                                        return (
                                            <tr key={debitur.id} className="hover:bg-slate-50/80 transition">
                                                <td className="py-3 px-4">
                                                    <p className="font-semibold text-slate-900 text-xs">
                                                        {debitur.nama_lengkap}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                                        {debitur.no_anggota} | Telp: {debitur.telepon}
                                                    </p>
                                                </td>

                                                <td className="py-3 px-4 text-slate-600 font-medium">
                                                    {debitur.unit_kerja || 'Karyawan'}
                                                </td>

                                                <td className="py-3 px-4">
                                                    <p className="font-semibold text-slate-900">
                                                        {formatRupiah(debitur.nominal_pengajuan)}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500">
                                                        Tenor: {debitur.tenor_bulan} Bulan
                                                    </p>
                                                </td>

                                                <td className="py-3 px-4">
                                                    {isMenunggu ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                                            Menunggu Penilaian
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                            Diverifikasi
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-4">
                                                    {debitur.saw_result ? (
                                                        <div>
                                                            <span
                                                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                    debitur.saw_result.status_kelayakan === 'LAYAK'
                                                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                                                        : debitur.saw_result.status_kelayakan === 'DIPERTIMBANGKAN'
                                                                        ? 'bg-amber-50 text-amber-800 border border-amber-300'
                                                                        : 'bg-red-50 text-red-800 border border-red-300'
                                                                }`}
                                                            >
                                                                {debitur.saw_result.status_kelayakan}
                                                            </span>
                                                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                                                V = {Number(debitur.saw_result.nilai_preferensi).toFixed(4)} (Peringkat #{debitur.saw_result.ranking})
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-400 italic">
                                                            Belum dinilai
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center space-x-1.5">
                                                        <Link
                                                            href={`/debitur/${debitur.id}/edit`}
                                                            className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                                                                isMenunggu
                                                                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                                                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                            }`}
                                                        >
                                                            {isMenunggu ? 'Beri Nilai' : 'Ubah'}
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(debitur.id, debitur.nama_lengkap)}
                                                            className="px-2 py-1 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded text-xs font-medium transition"
                                                            title="Hapus berkas"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}