import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditEventForm from "./EditEventForm";

export default async function EditEventPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const event = await prisma.event.findUnique({
        where: { id }
    });

    if (!event) {
        return notFound();
    }

    return <EditEventForm event={event} />;
}
