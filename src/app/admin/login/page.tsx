
'use client';

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLogin() {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.push("/admin");
        }
    }, [session, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="p-8 bg-white rounded shadow-md text-center">
                <h1 className="mb-6 text-2xl font-bold">Admin Login</h1>
                <p className="mb-6 text-gray-600">Please sign in to access the dashboard.</p>
                <button
                    onClick={() => signIn("google", { callbackUrl: "/admin" })}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}
