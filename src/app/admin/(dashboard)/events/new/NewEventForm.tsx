'use client';

import { useState } from 'react';
import { createEvent } from "@/app/actions";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import LocationInput from "@/components/LocationInput";

export default function NewEventForm() {
    const [imageUrl, setImageUrl] = useState('');

    // Default start time to now (local time)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const defaultStartTime = `${year}-${month}-${day}T${hours}:${minutes}`;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">建立新活動</h1>
                            <p className="text-slate-500 text-sm mt-1">填寫活動資訊並發布</p>
                        </div>
                        <Link href="/admin" className="text-slate-500 hover:text-slate-700 transition-colors">
                            取消
                        </Link>
                    </div>
                </div>

                <form action={createEvent} className="p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            活動名稱 <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="title"
                            type="text"
                            required
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder="例如：2026 年度科技研討會"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            活動說明
                        </label>
                        <textarea
                            name="description"
                            rows={5}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                            placeholder="詳細描述活動內容、議程等..."
                        ></textarea>
                        <p className="text-xs text-slate-500 mt-1">支援 Markdown 格式</p>
                    </div>


                    {/* Image Upload */}
                    <ImageUpload
                        onUpload={(url) => setImageUrl(url)}
                        currentImage={imageUrl}
                    />
                    <input type="hidden" name="imageUrl" value={imageUrl} />

                    {/* Online Event Toggle */}
                    <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-xl">
                        <input
                            type="checkbox"
                            id="isOnline"
                            name="isOnline"
                            value="true"
                            onChange={(e) => {
                                const input = document.getElementById('location-input-container');
                                if (input) {
                                    input.style.display = e.target.checked ? 'none' : 'block';
                                }
                            }}
                            className="w-5 h-5 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                        />
                        <label htmlFor="isOnline" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                            這是一個線上活動
                        </label>
                    </div>

                    {/* Capacity */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            預期人數 (選填)
                        </label>
                        <input
                            name="capacity"
                            type="number"
                            min="1"
                            placeholder="輸入預期參加人數"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                        <p className="text-xs text-slate-500 mt-1">設定後可在活動列表查看報名進度</p>
                    </div>

                    {/* Location with Map */}
                    <div id="location-input-container">
                        <LocationInput />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                開始時間 <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="startTime"
                                type="datetime-local"
                                required
                                defaultValue={defaultStartTime}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                結束時間
                            </label>
                            <input
                                name="endTime"
                                type="datetime-local"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                        >
                            建立活動
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
