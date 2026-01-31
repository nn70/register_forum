'use client';

import { useState } from 'react';
import Link from 'next/link';

interface AdminMobileNavProps {
    isSuper: boolean;
}

export default function AdminMobileNav({ isSuper }: AdminMobileNavProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="md:hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-16 left-0 right-0 bg-slate-800 border-t border-slate-700 shadow-xl z-50 p-4 space-y-2">
                    <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all font-medium"
                    >
                        儀表板
                    </Link>
                    <Link
                        href="/admin/events"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all font-medium"
                    >
                        活動管理
                    </Link>
                    <Link
                        href="/admin/attendees"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all font-medium"
                    >
                        報名名單
                    </Link>
                    <Link
                        href="/admin/participants"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all font-medium"
                    >
                        參加者分析
                    </Link>
                    {isSuper && (
                        <Link
                            href="/admin/users"
                            onClick={() => setIsOpen(false)}
                            className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all font-medium"
                        >
                            使用者管理
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
