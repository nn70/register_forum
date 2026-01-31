'use client';

import Link from "next/link";
import { useState, useEffect } from "react";

interface Event {
    id: string;
    slug: string | null;
    title: string;
    startTime: Date;
    endTime: Date | null;
    location: string | null;
    imageUrl: string | null;
}

export default function HomePageClient({ events }: { events: any[] }) {
    const [useLocalTime, setUseLocalTime] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const formatDate = (dateString: string | Date, type: 'date' | 'time') => {
        const date = new Date(dateString);

        // Default (false) = Asia/Taipei
        // Local (true) = undefined (Browser default)
        const timeZone = useLocalTime ? undefined : 'Asia/Taipei';

        if (type === 'date') {
            return date.toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short',
                timeZone
            });
        } else {
            return date.toLocaleTimeString('zh-TW', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone
            });
        }
    };

    // Calculate user's timezone for display
    const userTimeZone = mounted ? Intl.DateTimeFormat().resolvedOptions().timeZone : '讀取中...';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-3xl">🎯</span> 即將舉辦的活動
                    </h2>
                    <span className="text-purple-300 text-sm">共 {events.length} 場活動</span>
                </div>

                <button
                    onClick={() => setUseLocalTime(!useLocalTime)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${useLocalTime
                            ? 'bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-400/20'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                >
                    <span>{useLocalTime ? '🌍' : '🕰️'}</span>
                    {useLocalTime ? (
                        <span>顯示您所在時區 ({userTimeZone})</span>
                    ) : (
                        <span>使用電腦本機時區顯示（海外友善）</span>
                    )}
                </button>
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
                                    <div className={`p-2 rounded-lg transition-colors ${useLocalTime ? 'bg-yellow-400/10 -mx-2' : ''}`}>
                                        <p className="flex items-center gap-2">
                                            <span>📅</span>
                                            {formatDate(event.startTime, 'date')}
                                        </p>
                                        <p className="flex items-center gap-2 mt-1">
                                            <span>⏰</span>
                                            {formatDate(event.startTime, 'time')}
                                            {useLocalTime && mounted && (
                                                <span className="text-xs ml-1 opacity-70 border border-purple-200/50 rounded px-1">
                                                    您的時間
                                                </span>
                                            )}
                                        </p>
                                    </div>
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
    );
}
