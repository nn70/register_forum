import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { isSuperAdmin } from "@/lib/roles";

export default async function EventsListPage() {
    const session = await getServerSession(authOptions);
    const isSuper = isSuperAdmin(session?.user?.email);

    // If Super Admin, show all. If not, filtered out deleted.
    const whereCondition = isSuper ? {} : { deletedAt: null };

    const events = await prisma.event.findMany({
        where: whereCondition,
        orderBy: { startTime: 'desc' },
        include: { _count: { select: { attendees: true } } }
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">活動管理</h2>
                    <p className="text-slate-500 text-sm mt-1">共 {events.length} 場活動</p>
                </div>
                {session?.user?.role !== 'viewer' && (
                    <Link
                        href="/admin/events/new"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium"
                    >
                        <span>＋</span> 建立新活動
                    </Link>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 text-left border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">活動名稱</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">日期</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">地點</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">報名人數</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {events.map((event: any) => (
                            <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-800">
                                        {event.title}
                                        {event.deletedAt && (
                                            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                                                已刪除
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {new Date(event.startTime).toLocaleDateString('zh-TW', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {event.location || '線上活動'}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-slate-700">
                                                {event._count.attendees} / {event.capacity || '--'}
                                            </span>
                                            <span className="text-xs text-slate-400">人</span>
                                        </div>
                                        {event.capacity && (
                                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                {(() => {
                                                    const percentage = Math.min((event._count.attendees / event.capacity) * 100, 100);
                                                    let colorClass = 'bg-red-500'; // < 25%
                                                    if (percentage >= 65) colorClass = 'bg-green-500'; // > 65%
                                                    else if (percentage >= 25) colorClass = 'bg-yellow-500'; // 25-65%

                                                    return (
                                                        <div
                                                            className={`h-full rounded-full ${colorClass}`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex gap-3">
                                        <Link
                                            href={`/admin/events/${event.id}`}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            查看
                                        </Link>
                                        <Link
                                            href={`/admin/events/${event.id}/edit`}
                                            className="text-slate-500 hover:text-slate-700"
                                        >
                                            編輯
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {events.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                                    <div className="text-4xl mb-2">📅</div>
                                    尚無活動，<Link href="/admin/events/new" className="text-blue-600 hover:underline">建立第一個活動</Link>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
