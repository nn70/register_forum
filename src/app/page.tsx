
import Link from "next/link";
import prisma from "@/lib/prisma";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">🎯</span> 即將舉辦的活動
          </h2>
          <span className="text-purple-300 text-sm">共 {events.length} 場活動</span>
        </div>

        {events.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event: any) => (
              <Link
                key={event.id}
                href={`/events/${event.slug || event.id}`}
                className="group relative bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20"
              >
                {/* Event Image */}
                {event.imageUrl ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-purple-600/50 to-pink-600/50 flex items-center justify-center">
                    <span className="text-6xl opacity-50">📅</span>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-purple-500/30 text-purple-200 text-xs rounded-full font-medium">
                      活動
                    </span>
                    {new Date(event.startTime) > new Date() && (
                      <span className="px-2 py-1 bg-green-500/30 text-green-200 text-xs rounded-full font-medium">
                        報名中
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors line-clamp-2">
                    {event.title}
                  </h3>

                  <div className="space-y-2 text-sm text-purple-200">
                    <p className="flex items-center gap-2">
                      <span>📅</span>
                      {new Date(event.startTime).toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </p>
                    <p className="flex items-center gap-2">
                      <span>⏰</span>
                      {new Date(event.startTime).toLocaleTimeString('zh-TW', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="flex items-center gap-2">
                      <span>📍</span>
                      {event.location || '線上活動'}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-purple-300 text-sm group-hover:text-white transition-colors">
                      立即報名 →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl text-purple-200 mb-2">目前沒有活動</p>
            <p className="text-purple-300/60">請稍後再來查看</p>
          </div>
        )}
      </div>

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
