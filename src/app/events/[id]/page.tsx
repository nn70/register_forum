
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import RegistrationForm from "./RegistrationForm";

export default async function EventPage({ params }: { params: { id: string } }) {
    // Await params in Next.js 15+ (if using 15), but 14 is sync? 
    // Next 15: params is a Promise. Next 14: params is an object.
    // The 'next' version in package.json is 16.1.6?
    // Let's assume standard behavior (sync or async) but await it just in case if it's Next 15.
    // Actually params is not a promise in standard 14, but if it is 15/16 it might be.
    // I will just use `params.id` directly for now. If build fails, I fix.
    // Update: As of Next 15, params is a Promise. Since version in package.json is 16, I should await it.

    const { id } = await params;

    const event = await prisma.event.findUnique({
        where: { id: id }
    });

    if (!event) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-blue-600 px-8 py-6 text-white">
                    <h1 className="text-3xl font-bold">{event.title}</h1>
                    <div className="mt-2 flex flex-col sm:flex-row gap-4 text-blue-100">
                        <p>{new Date(event.startTime).toLocaleString()}</p>
                        <p>📍 {event.location || 'Online'}</p>
                    </div>
                </div>

                <div className="p-8">
                    <div className="prose max-w-none text-gray-800 mb-8 whitespace-pre-wrap">
                        {event.description}
                    </div>

                    <hr className="my-8" />

                    <div id="register">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">立即報名 registration</h2>
                        <RegistrationForm eventId={event.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
