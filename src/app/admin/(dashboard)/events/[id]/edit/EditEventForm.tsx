'use client';

import { useState } from 'react';
import { updateEvent } from "./actions";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import LocationInput from "@/components/LocationInput";

interface Event {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    locationLat: number | null;
    locationLng: number | null;
    imageUrl: string | null;
    startTime: Date;
    endTime: Date | null;
    isOnline: boolean;
    capacity: number | null;
}

interface EditEventFormProps {
    event: Event;
}

export default function EditEventForm({ event }: EditEventFormProps) {
    const [imageUrl, setImageUrl] = useState(event.imageUrl || '');
    const [isOnline, setIsOnline] = useState(event.isOnline || false);

    // Format date for datetime-local input
    const formatDateForInput = (date: Date) => {
        const d = new Date(date);
        const offset = d.getTimezoneOffset();
        const localDate = new Date(d.getTime() - offset * 60 * 1000);
        return localDate.toISOString().slice(0, 16);
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">編輯活動</h1>
                <Link href={`/admin/events/${event.id}`} className="text-gray-600 hover:text-gray-900">取消</Link>
            </div>

            <form action={updateEvent} className="space-y-6">
                <input type="hidden" name="id" value={event.id} />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">活動名稱</label>
                    <input
                        name="title"
                        type="text"
                        required
                        defaultValue={event.title}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">活動說明 (支援 Markdown)</label>
                    <textarea
                        name="description"
                        rows={5}
                        defaultValue={event.description || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                </div>

                {/* Image Upload */}
                <ImageUpload
                    onUpload={(url) => setImageUrl(url)}
                    currentImage={imageUrl}
                />
                <input type="hidden" name="imageUrl" value={imageUrl} />

                {/* Capacity */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">預期人數 (選填)</label>
                    <input
                        name="capacity"
                        type="number"
                        min="1"
                        defaultValue={event.capacity || ''}
                        placeholder="輸入預期參加人數"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Online Event Toggle */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200">
                    <input
                        type="checkbox"
                        id="isOnline"
                        name="isOnline"
                        value="true"
                        checked={isOnline}
                        onChange={(e) => setIsOnline(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isOnline" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                        這是一個線上活動
                    </label>
                </div>

                {/* Location with Map */}
                {!isOnline && (
                    <LocationInput defaultValue={event.location || ''} />
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
                        <input
                            name="startTime"
                            type="datetime-local"
                            required
                            defaultValue={formatDateForInput(event.startTime)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">結束時間</label>
                        <input
                            name="endTime"
                            type="datetime-local"
                            defaultValue={event.endTime ? formatDateForInput(event.endTime) : ''}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-medium"
                    >
                        儲存變更
                    </button>
                </div>
            </form>
        </div>
    );
}
