
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
    const events = await prisma.event.findMany({
        orderBy: { startTime: 'desc' },
        include: { _count: { select: { attendees: true } } }
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <Link href="/admin/events/new" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    + Create Event
                </Link>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-20 bg-white rounded shadow">
                    <p className="text-gray-500 mb-4">No events found.</p>
                    <Link href="/admin/events/new" className="text-blue-600 hover:underline">
                        Create your first event
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                        <div key={event.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
                            <h3 className="text-xl font-bold mb-2 text-gray-800 line-clamp-1">{event.title}</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                {new Date(event.startTime).toLocaleDateString()} {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description || 'No description'}</p>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold text-gray-700">{event._count.attendees}</span>
                                    <span className="text-xs text-gray-500">Attendees</span>
                                </div>
                                <Link href={`/admin/events/${event.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    Manage →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
