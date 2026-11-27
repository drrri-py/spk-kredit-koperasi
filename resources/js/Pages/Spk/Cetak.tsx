import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

interface DebiturResult {
    id: number;
    no_anggota: string;
    nama_lengkap: string;
    unit_kerja?: string;
    nominal_pengajuan: number;
    tenor_bulan: number;
    saw_result?: {
        nilai_preferensi: number;
        ranking: number;
        status_kelayakan: 'LAYAK' | 'DIPERTIMBANGKAN' | 'TIDAK LAYAK';
        rekomendasi_plafon: number;
        catatan_analisis: string;
    } | null;
}

interface Props {
    debiturs: DebiturResult[];
    ahp?: {
        cr: number;
        is_consistent: boolean;
    };
}

export default function SpkCetak({ debiturs, ahp }: Props) {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const tanggalHariIni = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    return (
        <div className="bg-slate-100 min-h-screen py-6 print:py-0 print:bg-white text-slate-900 font-serif">
            <Head title="Cetak Rekapitulasi Kelayakan Kredit - Koperasi Manunggal Perkasa" />

            {/* Tombol Cetak / Navigasi (Otomatis Sembunyi Saat Cetak/PDF) */}
            <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center print:hidden px-4">
                <a
                    href="/spk-saw"
                    className="px-4 py-2 bg-slate-800 text-white text-xs font-sans font-semibold rounded hover:bg-slate-700 transition"
                >
                    ← Kembali ke Sistem
                </a>
                <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-emerald-700 text-white text-xs font-sans font-semibold rounded hover:bg-emerald-800 transition"
                >
                    Cetak Dokumen (A4 / PDF)
                </button>
            </div>

            {/* Lembar Dokumen Cetak A4 */}
            <div className="max-w-4xl mx-auto bg-white p-10 shadow-md print:shadow-none print:p-0 print:max-w-full border print:border-none border-slate-200">
                {/* KOP SURAT DINAS RESMI */}
                <div className="flex items-center border-b-4 border-double border-slate-900 pb-3 mb-6">
                    <img
                        src="/images/logo-koperasi.png"
                        alt="Logo Koperasi Indonesia"
                        className="h-24 w-auto object-contain mr-5"
                    />
                    <div className="text-center flex-1 pr-6">
                        <h1 className="text-base font-bold tracking-wider uppercase text-slate-900 font-sans">
                            KOPERASI KARYAWAN MANUNGGAL PERKASA
                        </h1>
                        <p className="text-xs text-slate-700 mt-0.5 font-sans">
                            Badan Hukum No: 518/BH/KDK.10.15/2010 | Wilayah Kerja: Kabupaten Cirebon
                        </p>
                        <p className="text-[11px] text-slate-600 font-sans">
                            Jl. Raya Cirebon - Jawa Barat | Surel: sekretariat@koperasimanunggal.co.id
                        </p>
                    </div>
                </div>

                {/* JUDUL DAN NOMOR SURAT */}
                <div className="text-center mb-6">
                    <h2 className="text-sm font-bold uppercase underline tracking-wide">
                        SURAT KEPUTUSAN KOMITE EVALUASI KREDIT PINJAMAN ANGGOTA
                    </h2>
                    <p className="text-xs text-slate-600 font-sans mt-1">
                        Nomor: 042/SK-KOM/KOP-MP/XI/2026
                    </p>
                    <p className="text-[11px] text-slate-500 font-sans">
                        Perihal: Penetapan Hasil Rekomendasi Kelayakan Kredit Menggunakan Integrasi AHP dan SAW
                    </p>
                </div>

                {/* PARAGRAF PENGANTAR */}
                <div className="text-xs font-sans text-slate-700 mb-4 leading-relaxed text-justify">
                    Berdasarkan hasil pembobotan kriteria menggunakan metode <em>Analytic Hierarchy Process</em> (AHP) 
                    dengan rasio konsistensi {(ahp?.is_consistent ?? true) ? 'valid' : 'tercatat'} (CR = {(ahp?.cr ?? 0).toFixed(4).replace('.', ',')} {(ahp?.is_consistent ?? true) ? '<' : '>'} 0,10) serta perankingan preferensi 
                    <em> Simple Additive Weighting</em> (SAW), maka komite analis kredit menetapkan daftar rekomendasi 
                    pemberian fasilitas pinjaman bagi anggota sebagai berikut:
                </div>

                {/* TABEL HASIL SPK */}
                <table className="w-full text-xs font-sans border-collapse border border-slate-800 mb-5">
                    <thead>
                        <tr className="bg-slate-100 text-slate-900 uppercase font-bold text-[11px]">
                            <th className="border border-slate-800 py-2 px-2 text-center w-12">Rank</th>
                            <th className="border border-slate-800 py-2 px-3 text-left">No. Anggota & Nama</th>
                            <th className="border border-slate-800 py-2 px-3 text-left">Unit Kerja</th>
                            <th className="border border-slate-800 py-2 px-3 text-right">Permohonan</th>
                            <th className="border border-slate-800 py-2 px-2 text-center w-20">Skor (V)</th>
                            <th className="border border-slate-800 py-2 px-2 text-center w-28">Status</th>
                            <th className="border border-slate-800 py-2 px-3 text-right">Rekomendasi Plafon</th>
                        </tr>
                    </thead>
                    <tbody>
                        {debiturs.map((item, index) => {
                            const res = item.saw_result;
                            return (
                                <tr key={item.id} className="text-slate-800">
                                    <td className="border border-slate-800 py-1.5 px-2 text-center font-bold">
                                        {res?.ranking || index + 1}
                                    </td>
                                    <td className="border border-slate-800 py-1.5 px-3">
                                        <div className="font-semibold">{item.nama_lengkap}</div>
                                        <div className="text-[10px] text-slate-500 font-mono">{item.no_anggota}</div>
                                    </td>
                                    <td className="border border-slate-800 py-1.5 px-3 text-[11px]">
                                        {item.unit_kerja || 'Karyawan'}
                                    </td>
                                    <td className="border border-slate-800 py-1.5 px-3 text-right font-mono">
                                        {formatRupiah(item.nominal_pengajuan)}
                                    </td>
                                    <td className="border border-slate-800 py-1.5 px-2 text-center font-mono font-bold">
                                        {res ? Number(res.nilai_preferensi).toFixed(4) : '-'}
                                    </td>
                                    <td className="border border-slate-800 py-1.5 px-2 text-center text-[10px] font-bold">
                                        {res?.status_kelayakan || 'PENDING'}
                                    </td>
                                    <td className="border border-slate-800 py-1.5 px-3 text-right font-mono font-semibold">
                                        {res ? formatRupiah(res.rekomendasi_plafon) : '-'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* CATATAN AMBANG BATAS */}
                <div className="border border-slate-300 bg-slate-50 p-2.5 rounded text-[10px] font-sans text-slate-600 mb-8 leading-relaxed">
                    <strong>Keterangan Penetapan Plafon:</strong> 
                    (1) Nilai Preferensi V<sub>i</sub> &ge; 0,75 = LAYAK (Persetujuan Plafon 100%); 
                    (2) 0,60 &le; V<sub>i</sub> &lt; 0,75 = DIPERTIMBANGKAN (Penyesuaian Plafon 70%); 
                    (3) V<sub>i</sub> &lt; 0,60 = TIDAK LAYAK (Permohonan Ditolak).
                </div>

                {/* BLOK TANDA TANGAN FORMAL (GARIS TITIK-TITIK KOSONG) */}
                <div className="grid grid-cols-2 text-xs font-sans text-slate-800 text-center pt-2">
                    <div>
                        <p>Mengetahui,</p>
                        <p className="font-semibold">Ketua Koperasi Karyawan</p>
                        <div className="h-24"></div>
                        <p className="font-semibold tracking-widest">( .................................................... )</p>
                        <p className="text-[11px] text-slate-500 mt-1">NIP / NIK. ........................................</p>
                    </div>

                    <div>
                        <p>Kabupaten Cirebon, {tanggalHariIni}</p>
                        <p className="font-semibold">Petugas Analis Kredit</p>
                        <div className="h-24"></div>
                        <p className="font-semibold tracking-widest">( .................................................... )</p>
                        <p className="text-[11px] text-slate-500 mt-1">No. Registrasi Petugas</p>
                    </div>
                </div>
            </div>
        </div>
    );
}