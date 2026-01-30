
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import React from "react";

export default async function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/admin/login");
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-slate-800 text-white p-4 flex justify-between items-center shadow-md">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    Event Admin
                </h1>
                <nav className="flex gap-6">
                    <Link href="/admin" className="hover:text-blue-300">Dashboard</Link>
                    <Link href="/admin/events" className="hover:text-blue-300">Events</Link>
                    <Link href="/admin/attendees" className="hover:text-blue-300">Attendees</Link>
                </nav>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">{session.user?.email}</span>
                    <Link href="/api/auth/signout" className="text-sm bg-red-600 px-3 py-1 rounded hover:bg-red-700">Sign Out</Link>
                </div>
            </header>
            <main className="flex-1 p-6 bg-gray-50">
                {children}
            </main>
        </div>
    );
}
