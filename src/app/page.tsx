
import Link from "next/link";
import prisma from "@/lib/prisma";
import HomePageClient from "./HomePageClient";

export default async function Home() {
  const events = await prisma.event.findMany({
    orderBy: { startTime: 'asc' },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='rgba(255,255,255,0.3)'%3E%3C/circle%3E%3C/svg%3E")`
        }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300">
                活動報名系統
              </span>
            </h1>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto mb-12">
              輕鬆報名各種精彩活動，即時接收通知，一鍵加入行事曆
            </p>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <HomePageClient events={events} />

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <p className="text-purple-300/60 text-sm">© 2026 活動報名系統</p>
          <Link
            href="/admin/login"
            className="text-purple-300/40 hover:text-purple-200 transition-colors text-sm"
          >
            管理員入口
          </Link>
        </div>
      </footer>
    </div>
  );
}
