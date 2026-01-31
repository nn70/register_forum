'use client';

import { useActionState, useEffect } from 'react';
import { registerAttendee } from '@/app/actions';
import { useEventData } from './EventDataContext';
import { signIn } from 'next-auth/react';

interface RegistrationFormProps {
    eventId: string;
    initialUser?: {
        name: string | null;
        email: string | null;
        phone: string | null;
    } | null;
}

export default function RegistrationForm({ eventId, initialUser }: RegistrationFormProps) {
    const [state, formAction, isPending] = useActionState(registerAttendee, null);
    const { setEventData } = useEventData();

    // Auto-fill form if user data is provided
    useEffect(() => {
        if (initialUser) {
            setEventData({
                name: initialUser.name || '',
                email: initialUser.email || '',
                phone: initialUser.phone || '' // Phone might be null if new user
            });
        }
    }, [initialUser, setEventData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'name' || name === 'email' || name === 'phone' || name === 'note') {
            setEventData({ [name]: value });
        }
    };

    if (state?.success) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🎉</span>
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">報名成功！</h3>
                <p className="text-green-600">確認郵件已發送到您的信箱，請查收。</p>
            </div>
        );
    }

    return (
        <form action={formAction} className="space-y-5">
            <input type="hidden" name="eventId" value={eventId} />

            {/* Google Login for Quick Fill */}
            {!initialUser && (
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="font-semibold text-purple-900">已經有帳號？</p>
                            <p className="text-sm text-purple-700">登入下次即可自動帶入報名資料</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => signIn('google', { callbackUrl: window.location.href })}
                            className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all text-sm font-medium shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            使用 Google 登入
                        </button>
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    姓名 <span className="text-red-500">*</span>
                </label>
                <input
                    name="name"
                    type="text"
                    required
                    defaultValue={initialUser?.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                    placeholder="請輸入您的姓名"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    電子郵件 <span className="text-red-500">*</span>
                </label>
                <input
                    name="email"
                    type="email"
                    required
                    defaultValue={initialUser?.email || ''}
                    readOnly={!!initialUser?.email} // Lock email if logged in? Maybe not necessary but good for consistency
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${initialUser?.email ? 'bg-slate-50 text-slate-500 pointer-events-none' : 'bg-white'}`}
                    placeholder="example@email.com"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    手機號碼 <span className="text-red-500">*</span>
                </label>
                <input
                    name="phone"
                    type="tel"
                    required
                    defaultValue={initialUser?.phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                    placeholder="0912345678"
                />
                <p className="mt-1 text-xs text-slate-500">報到時將使用此號碼確認身份</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    備註 <span className="text-gray-400 text-xs font-normal">（選填）</span>
                </label>
                <textarea
                    name="note"
                    rows={3}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white resize-none"
                    placeholder="有什麼想告訴我們的嗎？"
                />
            </div>

            {state?.message && !state.success && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-red-500">⚠️</span>
                    <p className="text-red-700 text-sm">{state.message}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        處理中...
                    </span>
                ) : (
                    '確認報名'
                )}
            </button>
        </form>
    );
}
