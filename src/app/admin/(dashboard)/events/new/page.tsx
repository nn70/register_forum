
import { createEvent } from "@/app/actions";
import Link from "next/link";

export default function NewEventPage() {
    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Create New Event</h1>
                <Link href="/admin" className="text-gray-600 hover:text-gray-900">Cancel</Link>
            </div>

            <form action={createEvent} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                    <input
                        name="title"
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Annual Tech Forum 2024"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Markdown)</label>
                    <textarea
                        name="description"
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="# Detailed agenda..."
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">Supports Markdown for styling.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                        name="location"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Conference Room A"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                            name="startTime"
                            type="datetime-local"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                        <input
                            name="endTime"
                            type="datetime-local"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-medium"
                    >
                        Create Event
                    </button>
                </div>
            </form>
        </div>
    )
}
