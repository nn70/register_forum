
'use client';

import { useActionState } from "react";
// 
import { registerAttendee } from "@/app/actions";

const initialState = {
    message: '',
    success: false
}

export default function RegistrationForm({ eventId }: { eventId: string }) {
    const [state, formAction, isPending] = useActionState(registerAttendee, initialState);

    if (state?.success) {
        return (
            <div className="bg-green-100 p-6 rounded border border-green-200 text-green-800 text-center">
                <h3 className="text-xl font-bold mb-2">Registration Successful!</h3>
                <p>Check your email for confirmation and calendar invite.</p>
            </div>
        )
    }

    return (
        <form action={formAction} className="space-y-4 max-w-lg">
            <input type="hidden" name="eventId" value={eventId} />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="John Doe"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                    name="phone"
                    type="tel"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0912345678"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                    name="email"
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="john@example.com"
                />
            </div>

            {state?.message && <div className="text-red-600 bg-red-50 p-3 rounded">{state.message}</div>}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? 'Submitting...' : 'Confirm Registration'}
            </button>
        </form>
    )
}
