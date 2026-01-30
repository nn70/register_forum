
'use client';
import { useActionState } from "react";
// 
import { checkInAttendee } from "@/app/actions";

const initialState = { success: false, message: "" };

export default function CheckInForm({ eventId }: { eventId: string }) {
    const [state, formAction, isPending] = useActionState(checkInAttendee, initialState);

    if (state?.success) {
        return (
            <div className="text-center py-10 animate-bounce-in">
                <div className="text-6xl mb-4">✅</div>
                <div className="text-green-600 font-bold text-2xl">Check-in Successful!</div>
                <p className="text-gray-600 mt-2">Welcome to the event.</p>
            </div>
        )
    }

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="eventId" value={eventId} />

            <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Phone Number</label>
                <input
                    name="phone"
                    type="tel"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter phone number"
                />
            </div>

            {state?.message && <p className={`text-center p-2 rounded ${state.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{state.message}</p>}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 text-white py-3 rounded font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
                {isPending ? 'Checking In...' : 'Confirm Check-in'}
            </button>
        </form>
    )
}
