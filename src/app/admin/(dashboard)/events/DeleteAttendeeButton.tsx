'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteAttendee } from '@/app/actions';

export default function DeleteAttendeeButton({ attendeeId, eventId, attendeeName }: { attendeeId: string, eventId: string, attendeeName: string }) {
    const [isPending, setIsPending] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`確定要刪除報名者「${attendeeName}」嗎？此動作無法復原。`)) {
            return;
        }

        setIsPending(true);
        try {
            const result = await deleteAttendee(attendeeId, eventId);
            if (!result.success) {
                alert(result.message || '刪除失敗');
            }
        } catch (error) {
            console.error(error);
            alert('系統錯誤');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-red-500 hover:text-red-700 text-xs px-2 py-1 bg-red-50 hover:bg-red-100 rounded transition-colors"
        >
            {isPending ? '刪除中...' : '刪除'}
        </button>
    );
}
