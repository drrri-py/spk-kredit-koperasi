import React, { useEffect, FormEventHandler } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        no_anggota: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Registrasi Akun Anggota - Koperasi Manunggal Perkasa" />

            {/* Header Instansi & Logo Resmi */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="flex justify-center mb-3">
                    <img
                        src="/images/logo-koperasi.png"
                        alt="Logo Koperasi Indonesia"
                        className="h-20 w-auto object-contain drop-shadow-sm"
                    />
                </div>
                <h2 className="text-center text-lg font-bold tracking-tight text-slate-900 uppercase">
                    Koperasi Karyawan Manunggal Perkasa
                </h2>
                <p className="mt-0.5 text-center text-xs text-slate-500">
                    Pendaftaran Mandiri Akun Layanan Anggota Koperasi
                </p>
            </div>

            {/* Form Registrasi Anggota */}
            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200 rounded-lg">
                    <form onSubmit={submit} className="space-y-4">
                        {/* Nomor Anggota Resmi */}
                        <div>
                            <InputLabel
                                htmlFor="no_anggota"
                                value="Nomor Anggota Koperasi"
                                className="text-xs font-semibold text-slate-700"
                            />
                            <TextInput
                                id="no_anggota"
                                name="no_anggota"
                                value={data.no_anggota}
                                className="mt-1 block w-full text-xs font-mono border-slate-300 rounded focus:border-slate-800 focus:ring-slate-800 py-2.5"
                                autoComplete="off"
                                placeholder="Contoh: KOP-MP-001"
                                isFocused={true}
                                onChange={(e) => setData('no_anggota', e.target.value)}
                                required
                            />
                            <p className="text-[10px] text-slate-400 mt-0.5">
                                Masukkan nomor anggota resmi yang terdaftar di buku keanggotaan koperasi.
                            </p>
                            <InputError message={errors.no_anggota} className="mt-1" />
                        </div>

                        {/* Nama Lengkap */}
                        <div>
                            <InputLabel
                                htmlFor="name"
                                value="Nama Lengkap Sesuai KTP"
                                className="text-xs font-semibold text-slate-700"
                            />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="mt-1 block w-full text-xs border-slate-300 rounded focus:border-slate-800 focus:ring-slate-800 py-2.5"
                                autoComplete="name"
                                placeholder="Nama lengkap pemohon"
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        {/* Email */}
                        <div>
                            <InputLabel
                                htmlFor="email"
                                value="Alamat Email Aktif"
                                className="text-xs font-semibold text-slate-700"
                            />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full text-xs border-slate-300 rounded focus:border-slate-800 focus:ring-slate-800 py-2.5"
                                autoComplete="username"
                                placeholder="anggota@email.com"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        {/* Kata Sandi */}
                        <div>
                            <InputLabel
                                htmlFor="password"
                                value="Kata Sandi Akun"
                                className="text-xs font-semibold text-slate-700"
                            />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full text-xs border-slate-300 rounded focus:border-slate-800 focus:ring-slate-800 py-2.5"
                                autoComplete="new-password"
                                placeholder="Minimal 8 karakter"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <InputError message={errors.password} className="mt-1" />
                        </div>

                        {/* Konfirmasi Kata Sandi */}
                        <div>
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="Ulangi Kata Sandi"
                                className="text-xs font-semibold text-slate-700"
                            />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full text-xs border-slate-300 rounded focus:border-slate-800 focus:ring-slate-800 py-2.5"
                                autoComplete="new-password"
                                placeholder="Ketik ulang kata sandi"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            <InputError message={errors.password_confirmation} className="mt-1" />
                        </div>

                        {/* Tombol Submit */}
                        <div className="pt-2">
                            <PrimaryButton
                                className="w-full justify-center bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-xs py-2.5 rounded font-semibold tracking-normal transition"
                                disabled={processing}
                            >
                                {processing ? 'Mendaftarkan Akun...' : 'Daftar Akun Anggota'}
                            </PrimaryButton>
                        </div>
                    </form>

                    {/* Tautan Kembali ke Login */}
                    <div className="mt-6 border-t border-slate-200 pt-4 text-center">
                        <p className="text-xs text-slate-500">
                            Sudah memiliki akun terdaftar?{' '}
                            <Link href={route('login')} className="font-semibold text-slate-900 hover:underline">
                                Masuk ke Sistem
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-6 text-center text-[11px] text-slate-400">
                    &copy; {new Date().getFullYear()} Koperasi Karyawan Manunggal Perkasa. Hak Cipta Dilindungi.
                </p>
            </div>
        </div>
    );
}