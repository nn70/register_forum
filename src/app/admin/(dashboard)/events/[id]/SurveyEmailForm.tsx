'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { sendSurveyEmail } from './survey-actions';

interface SurveyEmailFormProps {
    eventId: string;
    eventTitle: string;
    attendeeCount: number;
}

export default function SurveyEmailForm({ eventId, eventTitle, attendeeCount }: SurveyEmailFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [emailType, setEmailType] = useState<'pre' | 'post'>('pre');
    const [state, formAction, isPending] = useActionState(sendSurveyEmail, null);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium text-sm"
            >
                <span>📧</span> 發送問卷郵件
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-800">📧 發送問卷郵件</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                        >
                            ×
                        </button>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">
                        將發送給「{eventTitle}」的 {attendeeCount} 位報名者
                    </p>
                </div>

                <form action={formAction} className="p-6 space-y-4">
                    <input type="hidden" name="eventId" value={eventId} />
                    <input type="hidden" name="emailType" value={emailType} />

                    {/* Email Type Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">郵件類型</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setEmailType('pre')}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${emailType === 'pre'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                📋 活動前問卷
                            </button>
                            <button
                                type="button"
                                onClick={() => setEmailType('post')}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${emailType === 'post'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                ✅ 活動後問卷
                            </button>
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            郵件主旨 <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="subject"
                            type="text"
                            required
                            defaultValue={emailType === 'pre' ? `${eventTitle} - 活動前調查` : `${eventTitle} - 滿意度調查`}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                            placeholder="請輸入郵件主旨"
                        />
                    </div>

                    {/* Survey Link */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            問卷連結（選填）
                        </label>
                        <input
                            name="surveyLink"
                            type="url"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                            placeholder="https://forms.google.com/..."
                        />
                        <p className="text-xs text-slate-500 mt-1">例如 Google Forms、Typeform 連結</p>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            郵件內容 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="message"
                            rows={5}
                            required
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm resize-none"
                            placeholder={emailType === 'pre'
                                ? "為了讓活動更順利進行，請花 2 分鐘填寫以下問卷..."
                                : "感謝您參與本次活動！我們想了解您的參與體驗，請花 2 分鐘填寫滿意度調查..."
                            }
                        ></textarea>
                    </div>

                    {/* Result Message */}
                    {state?.message && (
                        <div className={`p-3 rounded-xl text-sm ${state.success
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {state.message}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors text-sm"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || attendeeCount === 0}
                            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {isPending ? '發送中...' : `發送給 ${attendeeCount} 人`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
