'use server'

import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function sendSurveyEmail(prevState: any, formData: FormData) {
    const eventId = formData.get("eventId") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;
    const surveyLink = formData.get("surveyLink") as string;
    const emailType = formData.get("emailType") as string; // 'pre' or 'post'

    if (!eventId || !subject || !message) {
        return { success: false, message: "請填寫所有必填欄位" };
    }

    // Get event with attendees
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { attendees: true }
    });

    if (!event) {
        return { success: false, message: "活動不存在" };
    }

    if (event.attendees.length === 0) {
        return { success: false, message: "此活動尚無報名者" };
    }

    const emailTypeLabel = emailType === 'pre' ? '活動前問卷' : '活動後問卷';

    let successCount = 0;
    let failCount = 0;

    // Send email to each attendee
    for (const attendee of event.attendees) {
        try {
            const htmlContent = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1e293b;">📋 ${emailTypeLabel}</h2>
                    <p style="color: #475569;">親愛的 ${attendee.name}，您好！</p>
                    <p style="color: #475569;">感謝您報名參加「<strong>${event.title}</strong>」</p>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <p style="color: #334155; white-space: pre-wrap;">${message}</p>
                    </div>
                    ${surveyLink ? `
                        <a href="${surveyLink}" style="display: inline-block; background: linear-gradient(to right, #6366f1, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                            填寫問卷
                        </a>
                    ` : ''}
                    <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">
                        此郵件由活動報名系統自動發送
                    </p>
                </div>
            `;

            await sendEmail({
                to: attendee.email,
                subject: `[${emailTypeLabel}] ${subject}`,
                html: htmlContent
            });
            successCount++;
        } catch (e) {
            console.error(`Failed to send to ${attendee.email}:`, e);
            failCount++;
        }
    }

    revalidatePath(`/admin/events/${eventId}`);

    if (failCount === 0) {
        return {
            success: true,
            message: `✅ 成功發送 ${successCount} 封郵件`
        };
    } else {
        return {
            success: true,
            message: `發送完成：成功 ${successCount} 封，失敗 ${failCount} 封`
        };
    }
}
