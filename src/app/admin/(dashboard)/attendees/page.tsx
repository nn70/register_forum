import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function AttendeesListPage() {
    const attendees = await prisma.attendee.findMany({
        orderBy: { createdAt: 'desc' },
        include: { event: true }
    });

    const checkedInCount = attendees.filter((a: any) => a.checkedIn).length;

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800">報名名單</h2>
                <p className="text-slate-500 text-sm mt-1">
                    共 {attendees.length} 人報名 · {checkedInCount} 人已報到
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 text-left border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">姓名</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">電子郵件</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">手機號碼</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">報名活動</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">狀態</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">報名時間</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {attendees.map((attendee: any) => (
                            <tr key={attendee.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-800">
                                    {attendee.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {attendee.email}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {attendee.phone}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <Link
                                        href={`/admin/events/${attendee.eventId}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {attendee.event.title}
                                    </Link>
                                </td>
                                <td className="px-6 py-4">
                                    {attendee.checkedIn ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                            <span>✓</span> 已報到
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                            待報到
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {new Date(attendee.createdAt).toLocaleDateString('zh-TW')}
                                </td>
                            </tr>
                        ))}
                        {attendees.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                                    <div className="text-4xl mb-2">👥</div>
                                    尚無報名者
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
