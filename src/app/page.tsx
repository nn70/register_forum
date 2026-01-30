
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function Home() {
  const events = await prisma.event.findMany({
    orderBy: { startTime: 'asc' },
    // Show all future events, or just all for now
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6">
      <h1 className="text-5xl font-extrabold mb-10 text-center drop-shadow-sm tracking-tight">
        Upcoming Events
      </h1>

      <div className="grid gap-6 w-full max-w-5xl grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {events.map(event => (
          <Link key={event.id} href={`/events/${event.id}`} className="group block bg-white text-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="mb-4">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Event</span>
            </div>
            <h2 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors">{event.title}</h2>
            <p className="text-gray-500 text-sm mb-6 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {new Date(event.startTime).toLocaleDateString()}
            </p>
            <div className="flex justify-between items-center text-blue-600 font-semibold mt-auto">
              <span>Register Now</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </Link>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center bg-white/10 backdrop-blur-sm p-10 rounded-2xl border border-white/20">
          <p className="text-2xl font-light">No upcoming events scheduled.</p>
        </div>
      )}

      <div className="mt-20">
        <Link href="/admin/login" className="text-white/40 hover:text-white transition-colors text-sm font-medium">
          Admin Portal
        </Link>
      </div>
    </div>
  )
}
