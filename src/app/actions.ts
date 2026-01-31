
'use server'

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendRegistrationEmail } from "@/lib/email";
import { generateSlug, ensureUniqueSlug } from "@/lib/slug";

export async function createEvent(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session) {
        throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const startTimeStr = formData.get("startTime") as string;
    const endTimeStr = formData.get("endTime") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const locationLatStr = formData.get("locationLat") as string;
    const locationLngStr = formData.get("locationLng") as string;
    const isOnline = formData.get("isOnline") === 'true';
    const capacityStr = formData.get("capacity") as string;

    if (!title || !startTimeStr) {
        throw new Error("Missing required fields");
    }

    const startTime = new Date(startTimeStr);

    // Generate unique slug
    const baseSlug = generateSlug(startTime, title);
    const slug = await ensureUniqueSlug(baseSlug, async (s) => {
        const existing = await prisma.event.findUnique({ where: { slug: s } });
        return existing !== null;
    });

    await prisma.event.create({
        data: {
            slug,
            title,
            description,
            location: isOnline ? '線上活動' : location,
            startTime,
            endTime: endTimeStr ? new Date(endTimeStr) : null,
            imageUrl: imageUrl || null,
            locationLat: locationLatStr ? parseFloat(locationLatStr) : null,
            locationLng: locationLngStr ? parseFloat(locationLngStr) : null,
            isOnline,
            capacity: capacityStr ? parseInt(capacityStr) : null,
        }
    });


    revalidatePath('/admin');
    redirect('/admin');
}

export async function registerAttendee(prevState: any, formData: FormData) {
    const eventId = formData.get("eventId") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;

    if (!eventId || !name || !email || !phone) {
        return { success: false, message: "Missing required fields" };
    }

    try {
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) {
            return { success: false, message: "Event not found" };
        }

        // Check if event is expired (6 hours after start time)
        const expirationTime = new Date(event.startTime).getTime() + 6 * 60 * 60 * 1000;
        if (Date.now() > expirationTime) {
            return { success: false, message: "報名已截止 (活動已結束)" };
        }

        const attendee = await prisma.attendee.create({
            data: {
                eventId,
                name,
                email,
                phone,
            }
        });

        await sendRegistrationEmail(event, attendee);

        await sendRegistrationEmail(event, attendee);

        // Update user phone number if logged in
        const session = await getServerSession(authOptions);
        if (session && session.user?.email && phone) {
            try {
                await prisma.user.update({
                    where: { email: session.user.email },
                    data: { phone }
                });
            } catch (e) {
                // Ignore schema errors if phone field is missing in client
                console.warn("Failed to update user phone:", e);
            }
        }

        return { success: true, message: "" };
    } catch (e) {
        console.error(e);
        return { success: false, message: "Failed to register" };
    }
}

export async function checkInAttendee(prevState: any, formData: FormData) {
    const eventId = formData.get("eventId") as string;
    const phone = formData.get("phone") as string;

    // Normalize phone? Remove dashes/spaces.
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';

    if (!eventId || !cleanPhone) {
        return { success: false, message: "請輸入手機號碼" };
    }

    try {
        // Find attendee. Assuming strict match on phone for now.
        // If users reg with "0912-345-678" and input "0912345678", logic should align.
        // For current MVP, trusting exact string match or simple clean.

        // Try precise match first
        let attendee = await prisma.attendee.findFirst({
            where: {
                eventId,
                phone: { equals: phone } // or just phone
            }
        });

        if (!attendee) {
            // Try searching broadly? Or just fail.
            return { success: false, message: "查無此號碼的報名資料" };
        }

        if (attendee.checkedIn) {
            return { success: true, message: "已經報到過了！" };
        }

        await prisma.attendee.update({
            where: { id: attendee.id },
            data: {
                checkedIn: true,
                checkInTime: new Date()
            }
        });

        revalidatePath(`/admin/events/${eventId}`);
        return { success: true, message: "報到成功！" };

    } catch (e) {
        console.error(e);
        return { success: false, message: "系統錯誤" };
    }
}
