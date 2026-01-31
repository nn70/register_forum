'use client';

import { useState } from 'react';
import { deleteEvent, restoreEvent } from './actions';
import { useRouter } from 'next/navigation';

interface DeleteEventButtonProps {
    eventId: string;
    eventTitle: string;
    isDeleted?: boolean;
    deletedAt?: Date | null;
    canRestore?: boolean;
}

export default function DeleteEventButton({
    eventId,
    eventTitle,
    isDeleted = false,
    deletedAt,
    canRestore = false
}: DeleteEventButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (confirmText !== '確定') return;

        setIsPending(true);
        try {
            await deleteEvent(eventId);
            // Router redirect is handled in server action for delete, but usually client needs close
            setIsOpen(false);
        } catch (error) {
            console.error(error);
            alert('刪除失敗');
            setIsPending(false);
        }
    };

    const handleRestore = async () => {
        setIsPending(true);
        try {
            await restoreEvent(eventId);
            setIsPending(false);
            router.refresh(); // Refresh to see changes
        } catch (error) {
            console.error(error);
            alert('復原失敗: 可能已超過 7 天期限');
            setIsPending(false);
        }
    };

    if (isDeleted) {
        if (!canRestore) return null; // Or show non-restorable text?

        // Calculate days left
        const deadline = new Date(deletedAt!.getTime() + 7 * 24 * 60 * 60 * 1000);
        const now = new Date();
        const isExpired = now > deadline;

        if (isExpired) {
            return <span className="text-xs text-red-500 font-medium px-3 py-1 bg-red-50 rounded-lg">已過期無法復原</span>;
        }

        return (
            <button
                onClick={handleRestore}
                disabled={isPending}
                className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium px-3 py-1.5 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
                {isPending ? '處理中...' : '♻️ 復原活動'}
            </button>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
                🗑️ 刪除活動
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">刪除活動確認</h3>
                        <p className="text-slate-600 mb-4">
                            您確定要刪除 <span className="font-bold text-slate-800">{eventTitle}</span> 嗎？
                            <br />
                            <span className="text-red-500 font-medium text-sm block mt-2">
                                ⚠️ 注意：刪除後將保留 7 天，期間內超級管理員可協助復原。超過 7 天後將永久無法回復。
                            </span>
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                請輸入 "確定" 以繼續：
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="確定"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={confirmText !== '確定' || isPending}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isPending ? '刪除中...' : '確認刪除'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
