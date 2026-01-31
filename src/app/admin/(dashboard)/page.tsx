
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
    const events = await prisma.event.findMany({
        orderBy: { startTime: 'desc' },
        include: { _count: { select: { attendees: true } } }
    });

    const totalAttendees = events.reduce((sum, e) => sum + e._count.attendees, 0);
    const upcomingEvents = events.filter(e => new Date(e.startTime) > new Date()).length;

    return (
        <div>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <span className="text-2xl">📅</span>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{events.length}</p>
                            <p className="text-slate-500 text-sm">所有活動</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <span className="text-2xl">🎯</span>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{upcomingEvents}</p>
                            <p className="text-slate-500 text-sm">即將舉辦</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <span className="text-2xl">👥</span>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{totalAttendees}</p>
                            <p className="text-slate-500 text-sm">總報名人數</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">活動列表</h2>
                <Link
                    href="/admin/events/new"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium"
                >
                    <span>＋</span> 建立新活動
                </Link>
            </div>

            {/* Events Grid */}
            {events.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-slate-500 mb-4">尚無活動</p>
                    <Link href="/admin/events/new" className="text-blue-600 hover:underline">
                        建立第一個活動
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                        <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all group">
                            {event.imageUrl ? (
                                <div className="h-40 overflow-hidden">
                                    <img
                                        src={event.imageUrl}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                </div>
                            ) : (
                                <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                    <span className="text-4xl opacity-30">📅</span>
                                </div>
                            )}
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1">{event.title}</h3>
                                <p className="text-sm text-slate-500 mb-4">
                                    {new Date(event.startTime).toLocaleDateString('zh-TW', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                    {' · '}
                                    {event.location || '線上'}
                                </p>

                                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-slate-700">{event._count.attendees}</span>
                                        <span className="text-xs text-slate-400">人報名</span>
                                    </div>
                                    <Link
                                        href={`/admin/events/${event.id}`}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        管理 →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
