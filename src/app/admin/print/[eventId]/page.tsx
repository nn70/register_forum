import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/roles";
import PrintButton from "@/components/PrintButton";

export default async function PrintQRCodePage({ params }: { params: { eventId: string } }) {
    const { eventId } = await params;

    // Auth Check
    const session = await getServerSession(authOptions);
    if (!session) redirect("/admin/login");

    const hasAccess = session.user?.role === 'admin'
        || session.user?.role === 'super_admin'
        || session.user?.role === 'viewer'
        || await canAccessAdmin(session.user?.email);

    if (!hasAccess) redirect("/admin/no-access");

    const event = await prisma.event.findUnique({
        where: { id: eventId }
    });

    if (!event) return notFound();

    const checkInUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkin/${event.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(checkInUrl, { width: 400, margin: 2 });

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
            {/* Print Button (Hidden when printing) */}
            <div className="fixed top-8 right-8 print:hidden">
                <PrintButton />
            </div>

            <div className="max-w-2xl w-full border-4 border-slate-900 p-12 rounded-3xl">
                <p className="text-2xl text-slate-500 font-bold tracking-widest uppercase mb-4">EVENT CHECK-IN</p>

                <h1 className="text-5xl font-black text-slate-900 mb-8 leading-tight">
                    {event.title}
                </h1>

                <div className="bg-slate-50 p-8 rounded-3xl inline-block mb-8">
                    <img src={qrCodeDataUrl} alt="Check-in QR Code" className="w-80 h-80" />
                </div>

                <div className="space-y-4">
                    <p className="text-3xl font-bold text-slate-700">👇 請掃描 QR Code 進行報到</p>
                    <p className="text-xl text-slate-500">Scan to check-in</p>
                </div>

                <div className="mt-12 pt-8 border-t-2 border-slate-100 flex justify-between text-left text-slate-500">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider mb-1">DATE</p>
                        <p className="text-xl font-bold text-slate-800">
                            {new Date(event.startTime).toLocaleDateString('zh-TW')}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider mb-1">LOCATION</p>
                        <p className="text-xl font-bold text-slate-800">
                            {event.location || 'Online'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
