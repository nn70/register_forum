
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import Link from "next/link";
import { updateStaffStatus } from "@/app/staff-actions";
import SurveyEmailForm from "./SurveyEmailForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import DeleteEventButton from "../DeleteEventButton";
import { isSuperAdmin } from "@/lib/roles";

export default async function AdminEventPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            attendees: { orderBy: { createdAt: 'desc' } },
            staffApplications: { orderBy: { createdAt: 'desc' } }
        }
    });

    if (!event) return notFound();

    // Check soft delete status
    const isDeleted = !!event.deletedAt;
    const userEmail = session?.user?.email;
    const isSuper = isSuperAdmin(userEmail);

    // If deleted, only Super Admin can view
    if (isDeleted && !isSuper) {
        return notFound();
    }

    // Determine permissions
    // We need to fetch userId to match creatorId? 
    // Or just rely on Super Admin logic for now. 
    // Let's assume user.id is needed for owner check.
    // Fetch user id from email
    let isOwner = false;
    if (userEmail) {
        const user = await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true } });
        if (user && user.id === event.creatorId) {
            isOwner = true;
        }
    }

    const canDelete = !isDeleted && (isOwner || isSuper);
    const canRestore = isDeleted && isSuper;

    const checkInUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkin/${event.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(checkInUrl);

    const pendingStaff = event.staffApplications.filter((s: any) => s.status === 'pending').length;
    const approvedStaff = event.staffApplications.filter((s: any) => s.status === 'approved').length;

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <Link href="/admin" className="text-slate-500 hover:text-slate-700 text-sm mb-2 block">
                        ← 返回儀表板
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/events/${event.slug || event.id}`}
                            target="_blank"
                            className="group flex items-center gap-2 text-3xl font-bold text-slate-800 hover:text-blue-600 transition-colors"
                        >
                            {event.title}
                            <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </Link>
                        {isDeleted && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                                已刪除
                            </span>
                        )}
                    </div>
                    <div className="text-slate-600 mt-1 flex items-center gap-2">
                        <span>
                            {new Date(event.startTime).toLocaleDateString('zh-TW', { year: 'numeric', month: 'numeric', day: 'numeric' })}
                            {' '}
                            {new Date(event.startTime).toLocaleTimeString('zh-TW', { hour12: true, hour: 'numeric', minute: 'numeric' }).replace(':', '點')}分
                        </span>
                        <span>·</span>
                        {event.location ? (
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-600 hover:underline flex items-center gap-1"
                            >
                                📍 {event.location}
                            </a>
                        ) : (
                            '線上活動'
                        )}
                    </div>
                    {session?.user?.role !== 'viewer' && (
                        <div className="flex gap-2 mt-2 items-center">
                            {!isDeleted && (
                                <Link
                                    href={`/admin/events/${event.id}/edit`}
                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                    ✏️ 編輯
                                </Link>
                            )}

                            <DeleteEventButton
                                eventId={event.id}
                                eventTitle={event.title}
                                isDeleted={isDeleted}
                                deletedAt={event.deletedAt}
                                canRestore={canRestore}
                            />

                            {!isDeleted && (
                                <a
                                    href={`/api/events/${event.id}/export`}
                                    target="_blank"
                                    className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium px-3 py-1.5 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                >
                                    📥 匯出 Excel
                                </a>
                            )}
                        </div>
                    )}
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                    <img src={qrCodeDataUrl} alt="報到 QR Code" className="w-28 h-28 mx-auto" />
                    <p className="text-xs text-slate-500 mt-2 mb-3">掃描報到</p>
                    <Link
                        href={`/admin/print/${event.id}`}
                        target="_blank"
                        className="text-xs flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800 font-medium py-1 px-2 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        列印 QR Code
                    </Link>
                    <p className="text-xs text-red-500 mt-2 font-medium">請列印並張貼於活動現場</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                    <p className="text-2xl font-bold text-slate-800">{event.attendees.length}</p>
                    <p className="text-slate-500 text-sm">報名人數</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                    <p className="text-2xl font-bold text-green-600">
                        {event.attendees.filter((a: any) => a.checkedIn).length}
                    </p>
                    <p className="text-slate-500 text-sm">已報到</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                    <p className="text-2xl font-bold text-blue-600">{approvedStaff}</p>
                    <p className="text-slate-500 text-sm">工作人員</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                    <p className="text-2xl font-bold text-orange-600">{pendingStaff}</p>
                    <p className="text-slate-500 text-sm">待審核申請</p>
                </div>
            </div>

            {/* Registration Link & Survey */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">報名連結</h3>
                    <code className="block bg-slate-50 p-3 rounded-lg text-sm break-all text-slate-600">
                        {`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/events/${event.slug || event.id}`}
                    </code>
                </div>
                {session?.user?.role !== 'viewer' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">問卷通知</h3>
                        <p className="text-slate-500 text-sm mb-4">發送問卷郵件給所有報名者</p>
                        <SurveyEmailForm
                            eventId={event.id}
                            eventTitle={event.title}
                            attendeeCount={event.attendees.length}
                        />
                    </div>
                )}
            </div>

            {/* Staff Applications */}
            {event.staffApplications.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 mb-8 overflow-hidden overflow-x-auto">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-800">🙋 工作人員申請</h3>
                    </div>
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-slate-50 text-left">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold text-slate-600">姓名</th>
                                <th className="px-6 py-3 text-sm font-semibold text-slate-600">聯絡方式</th>
                                <th className="px-6 py-3 text-sm font-semibold text-slate-600">自我介紹</th>
                                <th className="px-6 py-3 text-sm font-semibold text-slate-600">狀態</th>
                                <th className="px-6 py-3 text-sm font-semibold text-slate-600">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {event.staffApplications.map((staff: any) => (
                                <tr key={staff.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-800">{staff.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        <div>{staff.email}</div>
                                        <div className="text-slate-400">{staff.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                                        {staff.message || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {staff.status === 'approved' && (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                已通過
                                            </span>
                                        )}
                                        {staff.status === 'rejected' && (
                                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                                已拒絕
                                            </span>
                                        )}
                                        {staff.status === 'pending' && (
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                                待審核
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {staff.status === 'pending' && session?.user?.role !== 'viewer' && (
                                            <div className="flex gap-2">
                                                <form action={updateStaffStatus}>
                                                    <input type="hidden" name="applicationId" value={staff.id} />
                                                    <input type="hidden" name="status" value="approved" />
                                                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                                                        通過
                                                    </button>
                                                </form>
                                                <form action={updateStaffStatus}>
                                                    <input type="hidden" name="applicationId" value={staff.id} />
                                                    <input type="hidden" name="status" value="rejected" />
                                                    <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
                                                        拒絕
                                                    </button>
                                                </form>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Attendees List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800">👥 報名名單</h3>
                </div>
                <table className="w-full min-w-[800px]">
                    <thead className="bg-slate-50 text-left">
                        <tr>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">姓名</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">電子郵件</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">手機號碼</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">狀態</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">報名時間</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {event.attendees.map((attendee: any) => (
                            <tr key={attendee.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-800">{attendee.name}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{attendee.email}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{attendee.phone}</td>
                                <td className="px-6 py-4">
                                    {attendee.checkedIn ? (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                            已報到
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                            待報到
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {new Date(attendee.createdAt).toLocaleString('zh-TW')}
                                </td>
                            </tr>
                        ))}
                        {event.attendees.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
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
