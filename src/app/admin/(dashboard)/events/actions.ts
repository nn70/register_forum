'use server';

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteEvent(eventId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        throw new Error("Unauthorized");
    }

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { creatorId: true }
    });

    if (!event) {
        throw new Error("Event not found");
    }

    const isCreator = event.creatorId === session.user.id; // Assuming user.id is available in session, wait, schema user ID is user.id. NextAuth session usually has user.id if configured. 
    // Wait, typical NextAuth session might only have email depending on config.
    // Let's check auth.ts or check based on email if creatorId is not easily matched. 
    // Actually schema says creatorId is String. User model has ID.
    // Let's fetch the user by email first to get ID.

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    if (!user) throw new Error("User not found");

    const isOwner = event.creatorId === user.id;
    const isSuper = isSuperAdmin(session.user.email);

    if (!isOwner && !isSuper) {
        throw new Error("Forbidden: You can only delete your own events.");
    }

    await prisma.event.update({
        where: { id: eventId },
        data: { deletedAt: new Date() }
    });

    revalidatePath('/admin/events');
    revalidatePath(`/admin/events/${eventId}`);
    redirect('/admin/events');
}

export async function restoreEvent(eventId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        throw new Error("Unauthorized");
    }

    if (!isSuperAdmin(session.user.email)) {
        throw new Error("Forbidden: Only Super Admin can restore events.");
    }

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { deletedAt: true }
    });

    if (!event || !event.deletedAt) {
        throw new Error("Event is not deleted");
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (event.deletedAt < sevenDaysAgo) {
        throw new Error("Cannot restore: Event is older than 7 days.");
    }

    await prisma.event.update({
        where: { id: eventId },
        data: { deletedAt: null }
    });

    revalidatePath('/admin/events');
    revalidatePath(`/admin/events/${eventId}`);
}
