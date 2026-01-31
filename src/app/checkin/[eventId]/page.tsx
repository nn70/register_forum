
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import CheckInForm from "./CheckInForm";

export default async function CheckInPage({ params }: { params: { eventId: string } }) {
    const { eventId } = await params;
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return notFound();

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border-t-4 border-blue-600">
                <h1 className="text-xl font-bold uppercase tracking-wide text-gray-500 mb-2">活動報到</h1>
                <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">{event.title}</h2>
                <CheckInForm eventId={eventId} />
            </div>
        </div>
    )
}
