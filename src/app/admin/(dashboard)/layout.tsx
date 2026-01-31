
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import React from "react";
import { canAccessAdmin, isSuperAdmin } from "@/lib/roles";
import AdminMobileNav from "@/components/AdminMobileNav";

export default async function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/admin/login");
    }

    const hasAccess = session.user?.role === 'admin'
        || session.user?.role === 'super_admin'
        || session.user?.role === 'viewer'
        || await canAccessAdmin(session.user?.email);

    if (!hasAccess) {
        redirect("/admin/no-access");
    }

    const isSuper = isSuperAdmin(session.user?.email);

    return (
        <div className="min-h-screen flex flex-col bg-slate-100">
            {/* Header */}
            <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <span className="text-xl">🎯</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold">活動管理後台</h1>
                                {isSuper && (
                                    <span className="text-xs text-yellow-400">超級管理員</span>
                                )}
                            </div>
                        </div>

                        <nav className="hidden md:flex items-center gap-1">
                            <Link href="/admin" className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                                儀表板
                            </Link>
                            <Link href="/admin/events" className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                                活動管理
                            </Link>
                            <Link href="/admin/attendees" className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                                報名名單
                            </Link>
                            <Link href="/admin/participants" className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                                參加者分析
                            </Link>
                            {isSuper && (
                                <Link href="/admin/users" className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                                    使用者管理
                                </Link>
                            )}
                        </nav>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2">
                                {session.user?.image && (
                                    <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
                                )}
                                <span className="text-sm text-slate-300">{session.user?.name}</span>
                            </div>
                            <Link
                                href="/api/auth/signout"
                                className="px-3 py-1.5 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all text-sm"
                            >
                                登出
                            </Link>

                            {/* Mobile Navigation */}
                            <AdminMobileNav isSuper={isSuper} />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="py-4 text-center text-slate-500 text-sm border-t border-slate-200">
                <Link href="/" className="hover:text-slate-700 transition-colors">← 返回前台</Link>
            </footer>
        </div>
    );
}
