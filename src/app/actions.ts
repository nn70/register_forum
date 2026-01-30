
'use server'

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendRegistrationEmail } from "@/lib/email";

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

    if (!title || !startTimeStr) {
        throw new Error("Missing required fields");
    }

    await prisma.event.create({
        data: {
            title,
            description,
            location,
            startTime: new Date(startTimeStr),
            endTime: endTimeStr ? new Date(endTimeStr) : null,
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

        const attendee = await prisma.attendee.create({
            data: {
                eventId,
                name,
                email,
                phone,
            }
        });

        await sendRegistrationEmail(event, attendee);

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
        return { success: false, message: "Please enter your phone number" };
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
            return { success: false, message: "Registration not found with this number." };
        }

        if (attendee.checkedIn) {
            return { success: true, message: "Already checked in!" };
        }

        await prisma.attendee.update({
            where: { id: attendee.id },
            data: {
                checkedIn: true,
                checkInTime: new Date()
            }
        });

        revalidatePath(`/admin/events/${eventId}`);
        return { success: true, message: "Welcome!" };

    } catch (e) {
        console.error(e);
        return { success: false, message: "System error" };
    }
}
