'use server'

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";

export async function applyForStaff(prevState: any, formData: FormData) {
    const eventId = formData.get("eventId") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const message = formData.get("message") as string;

    if (!eventId || !name || !email || !phone) {
        return { success: false, message: "請填寫所有必填欄位" };
    }

    // Check if already applied
    const existing = await prisma.staffApplication.findFirst({
        where: { eventId, email }
    });

    if (existing) {
        return { success: false, message: "您已經申請過此活動的工作人員" };
    }

    // Get event with creator info
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { creator: true }
    });

    if (!event) {
        return { success: false, message: "活動不存在" };
    }

    // Create application
    await prisma.staffApplication.create({
        data: {
            eventId,
            name,
            email,
            phone,
            message: message || null,
        }
    });

    // Notify event creator
    if (event.creator?.email) {
        try {
            await sendEmail({
                to: event.creator.email,
                subject: `[工作人員申請] ${name} 申請加入「${event.title}」`,
                html: `
                    <h2>新的工作人員申請</h2>
                    <p><strong>活動：</strong>${event.title}</p>
                    <p><strong>申請人：</strong>${name}</p>
                    <p><strong>Email：</strong>${email}</p>
                    <p><strong>電話：</strong>${phone}</p>
                    ${message ? `<p><strong>自我介紹：</strong>${message}</p>` : ''}
                    <p style="margin-top: 20px;">
                        <a href="${process.env.NEXTAUTH_URL}/admin/events/${eventId}">前往管理後台審核</a>
                    </p>
                `
            });
        } catch (e) {
            console.error("Failed to send notification email:", e);
        }
    }

    revalidatePath(`/events/${event.slug || event.id}`);
    return { success: true, message: "申請已送出，請等待活動主辦人審核" };
}

export async function updateStaffStatus(formData: FormData) {
    const applicationId = formData.get("applicationId") as string;
    const status = formData.get("status") as string;

    if (!applicationId || !status) {
        throw new Error("Missing required fields");
    }

    const application = await prisma.staffApplication.update({
        where: { id: applicationId },
        data: { status },
        include: { event: true }
    });

    // Notify applicant
    try {
        const statusText = status === 'approved' ? '已通過' : '未通過';
        await sendEmail({
            to: application.email,
            subject: `[審核結果] 您的「${application.event.title}」工作人員申請${statusText}`,
            html: `
                <h2>工作人員申請審核結果</h2>
                <p><strong>活動：</strong>${application.event.title}</p>
                <p><strong>審核結果：</strong>${statusText}</p>
                ${status === 'approved' ? '<p>恭喜您！請於活動當天提前到場報到。</p>' : '<p>感謝您的申請，期待下次有機會合作。</p>'}
            `
        });
    } catch (e) {
        console.error("Failed to send status email:", e);
    }

    revalidatePath(`/admin/events/${application.eventId}`);
}
