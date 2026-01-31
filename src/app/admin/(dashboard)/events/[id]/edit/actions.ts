'use server'

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function updateEvent(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session) {
        throw new Error("未授權");
    }

    const id = formData.get("id") as string;
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

    if (!id || !title || !startTimeStr) {
        throw new Error("缺少必填欄位");
    }

    await prisma.event.update({
        where: { id },
        data: {
            title,
            description,
            location: isOnline ? '線上活動' : location,
            startTime: new Date(startTimeStr),
            endTime: endTimeStr ? new Date(endTimeStr) : null,
            imageUrl: imageUrl || null,
            locationLat: locationLatStr ? parseFloat(locationLatStr) : null,
            locationLng: locationLngStr ? parseFloat(locationLngStr) : null,
            isOnline,
            capacity: capacityStr ? parseInt(capacityStr) : null,
        }
    });

    revalidatePath(`/admin/events/${id}`);
    revalidatePath('/admin');
    redirect(`/admin/events/${id}`);
}
