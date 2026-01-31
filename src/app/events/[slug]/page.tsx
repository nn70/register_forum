
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import RegistrationForm from "./RegistrationForm";
import StaffApplicationForm from "./StaffApplicationForm";
import AddToCalendar from "@/components/AddToCalendar";
import { EventDataProvider } from "./EventDataContext";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function EventPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    let userData = null;
    if (session?.user?.email && session.user.email !== 'guest@example.com') {
        try {
            // Try to fetch with phone field
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { name: true, email: true, phone: true }
            });
            userData = user;
        } catch (e) {
            console.error("Failed to fetch user with phone:", e);
            // Fallback: fetch without phone if schema is not updated
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { name: true, email: true }
            });
            userData = { ...user, phone: null };
        }
    }

    let event = await prisma.event.findUnique({
        where: { slug }
    });

    if (!event) {
        event = await prisma.event.findUnique({
            where: { id: slug }
        });
    }

    if (!event) {
        return notFound();
    }

    const getMapLink = () => {
        if (event.locationLat && event.locationLng) {
            return `https://www.google.com/maps?q=${event.locationLat},${event.locationLng}`;
        }
        if (event.location) {
            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;
        }
        return null;
    };


    const isExpired = new Date(event.startTime).getTime() + 6 * 60 * 60 * 1000 < Date.now();
    const isUpcoming = new Date(event.startTime) > new Date();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Hero Section with Image */}
            <div className="relative">
                {event.imageUrl ? (
                    <div className="h-72 md:h-96 relative">
                        <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    </div>
                ) : (
                    <div className="h-72 md:h-96 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
                )}

                {/* Back Button */}
                <Link
                    href="/"
                    className="absolute top-4 left-4 px-4 py-2 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-black/50 transition-all text-sm"
                >
                    ← 返回首頁
                </Link>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-12">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Event Header */}
                    <div className="p-8 md:p-10">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                活動
                            </span>
                            {isUpcoming ? (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    報名中
                                </span>
                            ) : isExpired ? (
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                                    活動已結束
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                    活動進行中
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">{event.title}</h1>

                        {/* Event Meta */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-lg">📅</span>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">日期時間</p>
                                    <p className="font-medium text-slate-800">
                                        {new Date(event.startTime).toLocaleDateString('zh-TW', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            weekday: 'short'
                                        })}
                                        {' '}
                                        {new Date(event.startTime).toLocaleTimeString('zh-TW', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <span className="text-lg">📍</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-500">活動地點</p>
                                    <p className="font-medium text-slate-800">
                                        {event.location || '線上活動'}
                                        {getMapLink() && (
                                            <a
                                                href={getMapLink()!}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ml-2 text-blue-600 hover:underline text-sm"
                                            >
                                                查看地圖
                                            </a>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Add to Calendar */}
                        <AddToCalendar
                            title={event.title}
                            description={event.description}
                            location={event.location}
                            startTime={event.startTime}
                            endTime={event.endTime}
                        />
                    </div>

                    {/* Description */}
                    {event.description && (
                        <div className="px-8 md:px-10 pb-8">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">活動說明</h2>
                            <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-600">
                                {event.description}
                            </div>
                        </div>
                    )}

                    {/* Registration Form */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 md:p-10 border-t border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span>✍️</span> 立即報名
                        </h2>
                        {isExpired ? (
                            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">🚫</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">報名已截止</h3>
                                <p className="text-slate-500">
                                    本活動已結束報名，感謝您的關注。
                                </p>
                            </div>
                        ) : (
                            <EventDataProvider>
                                <RegistrationForm eventId={event.id} initialUser={userData} />

                                {/* Weather Warning */}
                                <div className="mt-8 mb-8 p-6 md:p-8 bg-orange-50 border-t border-orange-100 text-center rounded-xl">
                                    <p className="text-orange-800 text-sm md:text-base font-medium">
                                        部分活動如遇雨將取消，請注意天氣狀況並關注活動最新消息。
                                        <br className="hidden md:block" />
                                        活動資訊還請以主辦方公告為主。造成不便，敬請見諒。
                                    </p>
                                </div>

                                {/* Staff Application Section */}
                                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                                    <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                                        <span>🙋</span> 申請成為工作人員
                                    </h2>
                                    <p className="text-slate-500 text-sm mb-6">
                                        想要協助本活動嗎？填寫以下表單申請成為志工/工作人員
                                    </p>
                                    <StaffApplicationForm eventId={event.id} />
                                </div>
                            </EventDataProvider>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
