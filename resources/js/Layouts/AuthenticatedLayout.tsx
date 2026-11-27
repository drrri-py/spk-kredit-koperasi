import React, { useState, useEffect, PropsWithChildren, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';

interface AuthenticatedProps {
    header?: ReactNode;
}

export default function AuthenticatedLayout({ header, children }: PropsWithChildren<AuthenticatedProps>) {
    const { auth, flash } = usePage().props as any;
    const user = auth?.user || { name: 'Petugas Analis', email: 'admin@koperasi.com', role: 'admin' };
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        if (flash?.success) {
            setToastMessage(flash.success);
            const timer = setTimeout(() => {
                setToastMessage(null);
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const isAnggota = user?.role === 'anggota';

    const navItems = isAnggota
        ? [
              {
                  name: 'Status Pengajuan',
                  href: '/anggota/dashboard',
                  icon: (
                      <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                  ),
              },
              {
                  name: 'Formulir Permohonan',
                  href: '/anggota/pengajuan',
                  icon: (
                      <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                  ),
              },
              {
                  name: 'Panduan Prosedur (SOP)',
                  href: '/panduan',
                  icon: (
                      <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                  ),
              },
          ]
        : [
              {
                  name: 'Panel Utama',
                  href: '/dashboard',
                  icon: (
                      <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                  ),
              },
              {
                  name: 'Kriteria & Bobot AHP',
                  href: '/kriteria',
                  icon: (
                      <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                  ),
              },
              {
                  name: 'Daftar Berkas Debitur',
                  href: '/debitur',
                  icon: (
                      <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                  ),
              },
              {
                  name: 'Registrasi Debitur',
                  href: '/debitur/tambah',
                  icon: (
                      <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                  ),
              },
              {
                  name: 'Kalkulasi SPK SAW',
                  href: '/spk-saw',
                  icon: (
                      <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                  ),
              },
              {
                  name: 'Panduan Prosedur (SOP)',
                  href: '/panduan',
                  icon: (
                      <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                  ),
              },
          ];

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 text-xs">
            {toastMessage && (
                <div className="fixed top-4 right-4 z-50 flex items-center bg-slate-900 text-white px-4 py-2.5 rounded shadow border border-slate-800 text-xs font-medium">
                    <span>{toastMessage}</span>
                    <button onClick={() => setToastMessage(null)} className="ml-3 text-slate-400 hover:text-white">
                        ✕
                    </button>
                </div>
            )}

            {/* Sidebar Bersih */}
            <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="h-16 px-4 border-b border-slate-200 flex items-center">
                    <img
                        src="/images/logo-koperasi.png"
                        alt="Logo Koperasi Indonesia"
                        className="h-10 w-10 object-contain mr-3"
                    />
                    <div>
                        <h2 className="font-bold text-xs text-slate-900 tracking-tight leading-tight uppercase">
                            KOPKAR MANUNGGAL
                        </h2>
                        <p className="text-[10px] text-slate-500 font-medium">
                            {isAnggota ? 'Portal Layanan Anggota' : 'Panel Analis Kredit'}
                        </p>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = currentPath === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-3 py-2.5 rounded text-xs transition ${
                                    isActive
                                        ? 'bg-slate-100 text-slate-950 font-bold border-l-2 border-slate-900'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                }`}
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-slate-200">
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div className="overflow-hidden pr-2">
                            <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                            <p className="text-[10px] text-slate-500 capitalize">{user.role || 'Anggota'}</p>
                        </div>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="text-xs text-slate-500 hover:text-red-700 font-semibold"
                            title="Keluar"
                        >
                            Keluar
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Area Utama */}
            <div className="flex-1 pl-64 flex flex-col min-h-screen">
                <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
                    <div>{header}</div>
                    <div className="text-xs text-slate-500 font-medium">
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>

                <main className="p-6 flex-1 bg-slate-50">{children}</main>
            </div>
        </div>
    );
}