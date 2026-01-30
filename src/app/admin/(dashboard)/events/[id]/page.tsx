
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import Link from "next/link";

export default async function AdminEventPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const event = await prisma.event.findUnique({
        where: { id },
        include: { attendees: { orderBy: { createdAt: 'desc' } } }
    });

    if (!event) return notFound();

    const checkInUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkin/${event.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(checkInUrl);

    return (
        <div>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <Link href="/admin" className="text-gray-500 hover:text-gray-900 text-sm mb-2 block">← Back to Dashboard</Link>
                    <h1 className="text-3xl font-bold">{event.title}</h1>
                    <div className="text-gray-600 mt-1">
                        {new Date(event.startTime).toLocaleString()} @ {event.location || 'Online'}
                    </div>
                </div>
                <div className="text-center p-4 bg-white rounded shadow-sm">
                    <img src={qrCodeDataUrl} alt="Check-in QR Code" className="w-32 h-32 mx-auto" />
                    <p className="text-xs text-gray-500 mt-2">Scan to Check-in</p>
                    <a href={checkInUrl} target="_blank" className="text-xs text-blue-500 underline">Open Link</a>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Registration Link</h3>
                    <code className="block bg-gray-100 p-2 rounded text-sm break-all">
                        {`${process.env.NEXTAUTH_URL}/events/${event.id}`}
                    </code>
                </div>
                <div className="bg-white p-6 rounded shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Stats</h3>
                    <div className="flex justify-between">
                        <div>
                            <p className="text-2xl font-bold">{event.attendees.length}</p>
                            <p className="text-gray-500">Registered</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">
                                {event.attendees.filter(a => a.checkedIn).length}
                            </p>
                            <p className="text-gray-500">Checked In</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded shadow text-sm">
                <div className="px-6 py-4 border-b border-gray-100 mb-2">
                    <h3 className="font-semibold text-gray-800">Attendee List</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Phone</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Registered</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {event.attendees.map(attendee => (
                                <tr key={attendee.id}>
                                    <td className="px-6 py-3 font-medium text-gray-900">{attendee.name}</td>
                                    <td className="px-6 py-3">{attendee.phone}</td>
                                    <td className="px-6 py-3 text-gray-500">{attendee.email}</td>
                                    <td className="px-6 py-3">
                                        {attendee.checkedIn ? (
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Checked In</span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">Pending</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-gray-400">
                                        {new Date(attendee.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {event.attendees.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No attendees yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
