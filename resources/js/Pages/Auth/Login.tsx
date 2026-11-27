import React, { useEffect, FormEventHandler } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword?: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Masuk ke Sistem - Koperasi Manunggal Perkasa" />

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
                    Sistem Pendukung Keputusan Kelayakan Pemberian Pinjaman Kredit
                </p>
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200 rounded-lg">
                    {status && (
                        <div className="mb-4 font-medium text-xs text-emerald-700 bg-emerald-50 p-3 rounded border border-emerald-200">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="email" value="Alamat Email / Akun" className="text-xs font-semibold text-slate-700" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full text-xs border-slate-300 rounded focus:border-slate-800 focus:ring-slate-800 py-2.5"
                                autoComplete="username"
                                isFocused={true}
                                placeholder="nama@koperasi.com"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <InputLabel htmlFor="password" value="Kata Sandi" className="text-xs font-semibold text-slate-700" />
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs text-slate-600 hover:text-slate-900 underline"
                                    >
                                        Lupa sandi?
                                    </Link>
                                )}
                            </div>
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full text-xs border-slate-300 rounded focus:border-slate-800 focus:ring-slate-800 py-2.5"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-1" />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="ms-2 text-xs text-slate-600">Ingat sesi saya</span>
                            </label>
                        </div>

                        <div className="pt-2">
                            <PrimaryButton
                                className="w-full justify-center bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-xs py-2.5 rounded font-semibold tracking-normal transition"
                                disabled={processing}
                            >
                                {processing ? 'Memverifikasi...' : 'Masuk ke Sistem'}
                            </PrimaryButton>
                        </div>
                    </form>

                    <div className="mt-6 border-t border-slate-200 pt-4 text-center">
                        <p className="text-xs text-slate-500">
                            Belum memiliki akun anggota?{' '}
                            <Link href="/register" className="font-semibold text-slate-900 hover:underline">
                                Registrasi Anggota Baru
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