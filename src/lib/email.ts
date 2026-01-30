
import nodemailer from "nodemailer";
import * as ics from "ics";
import { Event, Attendee } from "../generated/client";

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
