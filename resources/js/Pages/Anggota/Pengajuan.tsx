import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

interface Props {
    user: {
        id: number;
        name: string;
        email: string;
        no_anggota: string;
    };
    existingDebitur?: {
        nominal_pengajuan: number;
        tenor_bulan: number;
        status_verifikasi: string;
    } | null;
    hasActiveLoan?: boolean;
}

export default function Pengajuan({ user, existingDebitur, hasActiveLoan }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        nik: '',
        unit_kerja: '',
        telepon: '',
        alamat: '',
        nominal_pengajuan: '',
        tenor_bulan: '12',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/anggota/pengajuan');
    };

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
                    <h1 className="text-base font-bold text-slate-900">Formulir Permohonan Pinjaman</h1>
                    <p className="text-xs text-slate-500">
                        Pengajuan fasilitas kredit anggota Koperasi Karyawan Manunggal Perkasa
                    </p>
                </div>
            }
        >
            <Head title="Formulir Pengajuan Pinjaman" />

            <div className="max-w-4xl mx-auto space-y-5">
                {/* Kartu Ringkasan Data Anggota Pemohon */}
                <div className="bg-white border border-slate-200 rounded p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Identitas Pemohon
                        </span>
                        <h2 className="text-sm font-bold text-slate-900 mt-0.5">{user?.name}</h2>
                        <p className="text-xs text-slate-600 mt-0.5">
                            Nomor Anggota: <span className="font-mono font-medium text-slate-900">{user?.no_anggota || '-'}</span> | Email: {user?.email}
                        </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        Anggota Terdaftar
                    </span>
                </div>

                {hasActiveLoan ? (
                    /* Pemberitahuan Jika Sudah Memiliki Berkas Aktif */
                    <div className="bg-white border border-slate-200 rounded p-8 text-center space-y-4">
                        <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">Permohonan Pinjaman Sedang Dalam Proses</h3>
                        <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                            Nomor Anggota <strong>{user?.no_anggota}</strong> telah tercatat memiliki permohonan pinjaman aktif sebesar{' '}
                            <span className="font-semibold text-slate-900">{formatRupiah(existingDebitur?.nominal_pengajuan || 0)}</span>.
                            Berdasarkan ketentuan SOP Koperasi, anggota hanya dapat mengajukan permohonan baru setelah proses evaluasi sebelumnya selesai atau pinjaman telah dilunasi.
                        </p>
                        <div className="pt-2">
                            <Link
                                href="/anggota/dashboard"
                                className="inline-flex items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded transition"
                            >
                                Kembali ke Status Pengajuan
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* Formulir Input Permohonan Baru */
                    <form onSubmit={submit} className="bg-white border border-slate-200 rounded p-6 space-y-6">
                        <div className="border-b border-slate-200 pb-3">
                            <h2 className="text-sm font-bold text-slate-900 uppercase">
                                Data Rincian Pengajuan Pembiayaan
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Lengkapi data permohonan kredit dengan informasi yang valid dan sesuai dokumen resmi.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Nominal Pengajuan */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Nominal Pinjaman yang Diajukan (Rp) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="500000"
                                    placeholder="Contoh: 10000000"
                                    className="w-full text-xs rounded border-slate-300 focus:border-slate-800 focus:ring-slate-800 py-2.5"
                                    value={data.nominal_pengajuan}
                                    onChange={(e) => setData('nominal_pengajuan', e.target.value)}
                                    required
                                />
                                <p className="text-[10px] text-slate-400 mt-0.5">Kelipatan Rp 500.000 (Minimal Rp 500.000)</p>
                                {errors.nominal_pengajuan && (
                                    <p className="text-red-600 text-xs mt-1">{errors.nominal_pengajuan}</p>
                                )}
                            </div>

                            {/* Jangka Waktu / Tenor */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Jangka Waktu Pengembalian (Tenor) <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full text-xs rounded border-slate-300 focus:border-slate-800 focus:ring-slate-800 py-2.5"
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
                                <p className="text-[10px] text-slate-400 mt-0.5">Pemotongan cicilan dilakukan via payroll gaji bulanan</p>
                                {errors.tenor_bulan && (
                                    <p className="text-red-600 text-xs mt-1">{errors.tenor_bulan}</p>
                                )}
                            </div>

                            {/* NIK / KTP */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Nomor Induk Kependudukan (NIK KTP) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    maxLength={16}
                                    placeholder="16 digit angka NIK"
                                    className="w-full text-xs font-mono rounded border-slate-300 focus:border-slate-800 focus:ring-slate-800 py-2.5"
                                    value={data.nik}
                                    onChange={(e) => setData('nik', e.target.value)}
                                    required
                                />
                                {errors.nik && <p className="text-red-600 text-xs mt-1">{errors.nik}</p>}
                            </div>

                            {/* Unit Kerja */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Unit Kerja / Divisi Perusahaan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Divisi Logistik / Administrasi"
                                    className="w-full text-xs rounded border-slate-300 focus:border-slate-800 focus:ring-slate-800 py-2.5"
                                    value={data.unit_kerja}
                                    onChange={(e) => setData('unit_kerja', e.target.value)}
                                    required
                                />
                                {errors.unit_kerja && <p className="text-red-600 text-xs mt-1">{errors.unit_kerja}</p>}
                            </div>

                            {/* Kontak Telepon / WhatsApp */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Nomor Telepon / WhatsApp Aktif <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="08xxxxxxxxxx"
                                    className="w-full text-xs font-mono rounded border-slate-300 focus:border-slate-800 focus:ring-slate-800 py-2.5"
                                    value={data.telepon}
                                    onChange={(e) => setData('telepon', e.target.value)}
                                    required
                                />
                                {errors.telepon && <p className="text-red-600 text-xs mt-1">{errors.telepon}</p>}
                            </div>

                            {/* Alamat Domisili */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Alamat Tempat Tinggal Saat Ini <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Alamat domisili lengkap"
                                    className="w-full text-xs rounded border-slate-300 focus:border-slate-800 focus:ring-slate-800 py-2.5"
                                    value={data.alamat}
                                    onChange={(e) => setData('alamat', e.target.value)}
                                    required
                                />
                                {errors.alamat && <p className="text-red-600 text-xs mt-1">{errors.alamat}</p>}
                            </div>
                        </div>

                        {/* Catatan Ketentuan Formal */}
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 space-y-1">
                            <p className="font-semibold text-slate-800">Ketentuan Evaluasi Kredit:</p>
                            <p className="text-[11px] leading-relaxed">
                                Formulir ini akan diteruskan ke antrean verifikasi petugas analis kredit koperasi. Evaluasi kelayakan dan rekomendasi nominal plafon ditentukan berdasarkan 5 kriteria prioritas (Penghasilan, Riwayat Kredit, Tanggungan, Agunan, dan Lama Keanggotaan) menggunakan metode AHP-SAW.
                            </p>
                        </div>

                        {/* Tombol Aksi */}
                        <div className="flex justify-end items-center space-x-3 pt-2 border-t border-slate-200">
                            <Link
                                href="/anggota/dashboard"
                                className="px-4 py-2 rounded text-xs font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition"
                            >
                                Batalkan
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2 rounded text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan Berkas...' : 'Kirim Permohonan Pinjaman'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AuthenticatedLayout>
    );
}