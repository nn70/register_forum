'use client';

import { useState } from 'react';
import { getAttendeeHistory } from '@/app/actions';

interface HistoryRecord {
    eventName: string;
    eventTime: Date;
    checkedIn: boolean;
    isOnline: boolean;
    location: string | null;
}

export default function AttendeeNameCell({
    name,
    email,
    phone
}: {
    name: string,
    email: string,
    phone: string
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [loading, setLoading] = useState(false);

    const handleOpen = async () => {
        setIsOpen(true);
        if (history.length === 0) {
            setLoading(true);
            try {
                const data = await getAttendeeHistory(email);
                setHistory(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <>
            <button
                onClick={handleOpen}
                className="font-medium text-slate-900 hover:text-purple-600 hover:underline text-left"
            >
                {name}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                    <div
                        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    {name}
                                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">會員</span>
                                </h3>
                                <div className="mt-2 space-y-1 text-sm text-slate-500">
                                    <p className="flex items-center gap-2">
                                        📧 {email}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        📱 {phone}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                📅 參加紀錄 ({history.length} 場)
                            </h4>

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                </div>
                            ) : history.length > 0 ? (
                                <div className="space-y-4">
                                    {history.map((record, idx) => (
                                        <div key={idx} className="flex gap-4 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                                            <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm">
                                                {record.isOnline ? '💻' : '🏢'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-800 truncate">{record.eventName}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {new Date(record.eventTime).toLocaleDateString('zh-TW')}
                                                    {' · '}
                                                    {record.isOnline ? '線上活動' : record.location || '無地點'}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end justify-center">
                                                {record.checkedIn ? (
                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium whitespace-nowrap">
                                                        已出席
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full font-medium whitespace-nowrap">
                                                        未出席
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    尚無其他參加紀錄
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
