'use client';

import { useActionState, useState, useEffect } from 'react';
import { applyForStaff } from '@/app/staff-actions';
import { useEventData } from './EventDataContext';

interface StaffApplicationFormProps {
    eventId: string;
}

export default function StaffApplicationForm({ eventId }: StaffApplicationFormProps) {
    const [state, formAction, isPending] = useActionState(applyForStaff, null);
    const { eventData } = useEventData();
    const [useRegistrationData, setUseRegistrationData] = useState(false);

    const [formState, setFormState] = useState({
        name: '',
        phone: '',
        email: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setUseRegistrationData(checked);
        if (checked) {
            setFormState({
                name: eventData.name,
                email: eventData.email,
                phone: eventData.phone
            });
        }
    };

    // Update form state if checkbox is checked and eventData changes
    useEffect(() => {
        if (useRegistrationData) {
            setFormState({
                name: eventData.name,
                email: eventData.email,
                phone: eventData.phone
            });
        }
    }, [useRegistrationData, eventData]);

    if (state?.success) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✅</span>
                </div>
                <h3 className="text-lg font-bold text-blue-800 mb-2">申請已送出！</h3>
                <p className="text-blue-600 text-sm">{state.message}</p>
            </div>
        );
    }

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="eventId" value={eventId} />

            {/* Same as Above Checkbox */}
            <div className="flex items-center mb-4">
                <input
                    type="checkbox"
                    id="sameAsAbove"
                    checked={useRegistrationData}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="sameAsAbove" className="ml-2 text-sm text-slate-600 cursor-pointer select-none">
                    同上 (使用報名資料)
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        姓名 <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="name"
                        type="text"
                        required
                        value={formState.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-sm"
                        placeholder="您的姓名"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        手機號碼 <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="phone"
                        type="tel"
                        required
                        value={formState.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-sm"
                        placeholder="0912345678"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    電子郵件 <span className="text-red-500">*</span>
                </label>
                <input
                    name="email"
                    type="email"
                    required
                    value={formState.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-sm"
                    placeholder="example@email.com"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    自我介紹（選填）
                </label>
                <textarea
                    name="message"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-sm resize-none"
                    placeholder="簡單介紹您自己，或說明為什麼想擔任工作人員..."
                ></textarea>
            </div>

            {state?.message && !state.success && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    <p className="text-red-700 text-sm">{state.message}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
                {isPending ? '提交中...' : '申請成為工作人員'}
            </button>
        </form>
    );
}
