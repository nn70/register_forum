import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function NoAccessPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='rgba(255,255,255,0.1)'%3E%3C/circle%3E%3C/svg%3E")`
            }}></div>

            <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12 max-w-md text-center shadow-2xl">
                <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-5xl">🔒</span>
                </div>

                <h1 className="text-3xl font-bold text-white mb-4">權限不足</h1>

                <p className="text-slate-400 mb-6 leading-relaxed">
                    您目前沒有管理員權限。<br />
                    如需申請權限，請聯繫系統管理員。
                </p>

                {session && (
                    <div className="bg-white/5 rounded-xl p-4 mb-8">
                        <p className="text-xs text-slate-500 mb-1">目前登入帳號</p>
                        <p className="text-slate-300 font-medium">{session.user?.email}</p>
                    </div>
                )}

                <div className="flex gap-4 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-white text-slate-800 rounded-xl font-medium hover:bg-slate-100 transition-all"
                    >
                        返回首頁
                    </Link>
                    <Link
                        href="/api/auth/signout"
                        className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all"
                    >
                        登出
                    </Link>
                </div>
            </div>
        </div>
    );
}
