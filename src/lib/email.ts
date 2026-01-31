
import nodemailer from "nodemailer";
import * as ics from "ics";
import { Event, Attendee } from "@prisma/client";

// Generic email sender
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const isConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;

    if (!isConfigured) {
        console.log("-----------------------------------------");
        console.log("MOCK EMAIL SENDING (Credentials not set)");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log("HTML: ", html.substring(0, 200) + "...");
        console.log("-----------------------------------------");
        return;
    }

    await transporter.sendMail({
        from: '"活動報名系統" <noreply@example.com>',
        to,
        subject,
        html
    });
}


export async function sendRegistrationEmail(event: Event, attendee: Attendee) {
    // 1. Generate ICS
    const startDate = new Date(event.startTime);
    const endDate = event.endTime ? new Date(event.endTime) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours if no end time

    const icsEvent: ics.EventAttributes = {
        start: [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate(), startDate.getHours(), startDate.getMinutes()],
        end: [endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate(), endDate.getHours(), endDate.getMinutes()],
        title: event.title,
        description: event.description || "",
        location: event.location || "",
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        organizer: { name: 'Event Organizer', email: 'organizer@example.com' },
        attendees: [
            { name: attendee.name, email: attendee.email, rsvp: true }
        ]
    };

    const { error, value: icsContent } = ics.createEvent(icsEvent);

    if (error) {
        console.error("Error generating ICS:", error);
        // Continue sending email without ICS or throw?
    }

    // 2. Setup Transporter
    // For dev, if no SMTP vars, use a mock or stream to console?
    // Nodemailer createTransport with stream transport is useful for testing, or just console.log properties.

    // If we have credentials, use them.
    const transporter = nodemailer.createTransport({
        service: 'gmail', // or generic smtp
        auth: {
            user: process.env.EMAIL_USER, // Add to env
            pass: process.env.EMAIL_PASS
        }
    });

    // Check if configured
    const isConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;

    if (!isConfigured) {
        console.log("-----------------------------------------");
        console.log("MOCK EMAIL SENDING (Credentials not set)");
        console.log(`To: ${attendee.email}`);
        console.log(`Subject: Registration Confirmed: ${event.title}`);
        console.log("Body: You have successfully registered.");
        if (icsContent) console.log("ICS Content generated.");
        console.log("-----------------------------------------");
        return;
    }

    // 3. Send Email
    await transporter.sendMail({
        from: '"Event System" <noreply@example.com>',
        to: attendee.email,
        subject: `Registration Confirmed: ${event.title}`,
        text: `Hi ${attendee.name},\n\nYou have successfully registered for "${event.title}".\n\nTime: ${startDate.toLocaleString()}\nLocation: ${event.location || 'N/A'}\n\nPlease find the calendar invitation attached.\n\nBest,\nEvent Team`,
        icalEvent: icsContent ? {
            filename: 'invite.ics',
            method: 'request',
            content: icsContent
        } : undefined
    });
}

export async function sendCreatorReminderEmail(event: any, creator: any) {
    // Check Config
    const isConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const manageUrl = `${process.env.NEXTAUTH_URL}/admin/events/${event.id}`;

    // AI Generate suggestion
    const aiPrompt = `請協助撰寫活動「${event.title}」的行前通知信。
    時間：${new Date(event.startTime).toLocaleString('zh-TW')}
    地點：${event.location || '線上'}
    
    重點提醒事項：
    1. 準時出席
    2. 攜帶物品
    3. 交通資訊`;

    // Mock HTML content for the suggestion
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>🔔 活動提醒：${event.title} 即將舉行</h2>
            <p>親愛的 ${creator.name}，</p>
            <p>提醒您，您主辦的活動即將在 48 小時內舉行！建議您現在發送一份「行前通知」給所有報名參加者。</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">💡 AI 建議信件內容</h3>
                <p>您可以參考或直接使用以下內容來發信：</p>
                <div style="background: white; padding: 15px; border: 1px solid #e2e8f0; border-radius: 4px;">
                    <p><strong>主旨：</strong> [行前通知] ${event.title} 即將開始！</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0;" />
                    <p>各位參加者好，</p>
                    <p>期待在 <strong>${event.title}</strong> 與您相見！</p>
                    <ul>
                        <li>⏰ 時間：${new Date(event.startTime).toLocaleString('zh-TW')}</li>
                        <li>📍 地點：${event.location || '線上活動'}</li>
                    </ul>
                    <p>請記得準時出席。如有任何問題，歡迎隨時聯繫我們。</p>
                </div>
            </div>

            <p style="text-align: center;">
                <a href="${manageUrl}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    前往後台發送通知
                </a>
            </p>
        </div>
    `;

    if (!isConfigured) {
        console.log("-----------------------------------------");
        console.log("MOCK REMINDER EMAIL TO CREATOR (Credentials not set)");
        console.log(`To: ${creator.email}`);
        console.log(`Subject: [提醒] 記得發送行前通知：${event.title}`);
        console.log("HTML Preview:", html.substring(0, 100) + "...");
        console.log("-----------------------------------------");
        return;
    }

    await transporter.sendMail({
        from: `"Event System" <${process.env.EMAIL_USER}>`,
        to: creator.email,
        subject: `[提醒] 記得發送行前通知：${event.title}`,
        html,
    });
}

export async function sendStaffStatusEmail(application: any, event: any) {
    // Check Config
    const isConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const statusText = application.status === 'approved' ? '已通過' : '未通過';
    const subject = `[審核結果] 您的「${event.title}」工作人員申請${statusText}`;

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: ${application.status === 'approved' ? '#16a34a' : '#dc2626'}; text-align: center;">工作人員申請審核結果</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>活動名稱：</strong>${event.title}</p>
                <p><strong>申請狀態：</strong><span style="color: ${application.status === 'approved' ? '#16a34a' : '#dc2626'}; font-weight: bold;">${statusText}</span></p>
                <p><strong>審核時間：</strong>${new Date().toLocaleString('zh-TW')}</p>
            </div>
            
            ${application.status === 'approved'
            ? `<p>恭喜您！您的申請已通過。</p>
                   <p>請務必於活動當天準時到場協助。詳細的工作分配將由主辦人另行通知。</p>`
            : `<p>感謝您對本活動的支持。</p>
                   <p>很遺憾通知您，本次工作人員招募因名額有限或其他考量，未能錄取您的申請。</p>
                   <p>期待下次還有機會能與您合作！</p>`
        }
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #64748b; font-size: 12px; text-align: center;">此郵件由系統自動發送，請勿直接回覆。</p>
        </div>
    `;

    if (!isConfigured) {
        console.log("-----------------------------------------");
        console.log("MOCK STAFF STATUS EMAIL (Credentials not set)");
        console.log(`To: ${application.email}`);
        console.log(`Subject: ${subject}`);
        console.log("HTML Preview:", html.substring(0, 100) + "...");
        console.log("-----------------------------------------");
        return;
    }

    await transporter.sendMail({
        from: `"Event System" <${process.env.EMAIL_USER}>`,
        to: application.email,
        subject,
        html,
    });
}
