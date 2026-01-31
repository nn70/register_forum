'use server';

import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("Upload Request:", {
        hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
        nodeEnv: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL
    });

    const form = await request.formData();
    const file = form.get('file') as File;

    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: 'File too large (max 2MB)' }, { status: 400 });
    }

    try {
        // Try Vercel Blob if token exists
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            const blob = await put(`events/${Date.now()}-${file.name}`, file, {
                access: 'public',
            });
            return NextResponse.json({ url: blob.url });
        }

        // Fallback to local filesystem (Only in Local Development)
        // Vercel sets process.env.VERCEL = '1'
        else if (!process.env.VERCEL) {
            console.log("Upload: Using local filesystem");
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Generate filename
            const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');

            // Ensure dir exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filepath = path.join(uploadDir, filename);
            fs.writeFileSync(filepath, buffer);

            // Return local URL
            const url = `/uploads/${filename}`;
            return NextResponse.json({ url });
        } else {
            throw new Error("Vercel Blob storage is not configured. Please add a Blob Store to your Vercel project.");
        }
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed: ' + (error as Error).message }, { status: 500 });
    }
}
