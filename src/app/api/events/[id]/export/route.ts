import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/roles";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // In Next.js 15+, params is a Promise
) {
    const { id } = await context.params;

    // Authorization Check
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const hasAccess = session.user?.role === 'admin'
        || session.user?.role === 'super_admin'
        || session.user?.role === 'viewer'
        || await canAccessAdmin(session.user?.email);

    if (!hasAccess) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            attendees: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!event) {
        return new NextResponse("Event not found", { status: 404 });
    }

    // Generate CSV
    // Add BOM for Excel UTF-8 compatibility
    let csvContent = '\uFEFF';

    // Headers
    csvContent += "姓名,電子郵件,手機號碼,報名時間,狀態\n";

    // Rows
    event.attendees.forEach(attendee => {
        const createdAt = new Date(attendee.createdAt).toLocaleString('zh-TW');
        const status = attendee.checkedIn ? "已報到" : "未報到";

        // Escape CSV fields
        const escape = (field: string | null) => {
            if (!field) return "";
            return `"${field.replace(/"/g, '""')}"`;
        };

        const row = [
            escape(attendee.name),
            escape(attendee.email),
            escape(attendee.phone),
            escape(createdAt),
            escape(status)
        ].join(",");

        csvContent += row + "\n";
    });

    // Valid filename
    const filename = `${event.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_名單.csv`;

    return new NextResponse(csvContent, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        },
    });
}
