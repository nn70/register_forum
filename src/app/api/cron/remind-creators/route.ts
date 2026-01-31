import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { sendCreatorReminderEmail } from "@/lib/email";

export async function GET(request: Request) {
    // Check for authorization (optional, verifying cron secret)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow running without auth in dev local
        if (process.env.NODE_ENV !== 'development' && process.env.CRON_SECRET) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
    }

    try {
        const now = new Date();
        // Target: Events starting in 48 hours (approximately)
        // Window: Between now+48h and now+49h
        // Or wider: Events starting in next 48 hours that haven't been reminded.

        const targetStart = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        const events = await prisma.event.findMany({
            where: {
                startTime: {
                    lte: targetStart, // Starting within 48 hours
                    gt: now // And in the future
                },
                creatorReminderSent: false,
                creatorId: { not: null } // Must have a creator
            },
            include: {
                creator: true
            }
        });

        console.log(`[Cron] Found ${events.length} events to remind.`);

        const results = [];

        for (const event of events) {
            if (event.creator && event.creator.email) {
                // Determine if it is actually roughly "tomorrow" or just "soon".
                // User asked for "Day before", so < 24 hours is good.

                await sendCreatorReminderEmail(event, event.creator);

                // Update reminder sent status
                await prisma.event.update({
                    where: { id: event.id },
                    data: { creatorReminderSent: true }
                });

                results.push({ event: event.title, creator: event.creator.email, status: 'sent' });
            }
        }

        return NextResponse.json({ success: true, processed: results.length, details: results });
    } catch (error) {
        console.error('[Cron] Error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
