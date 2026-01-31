'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdmin, setUserAdmin } from "@/lib/roles";
import { revalidatePath } from "next/cache";

export async function updateUserRole(formData: FormData) {
    const session = await getServerSession(authOptions);

    // Only super admin can change roles
    if (!isSuperAdmin(session?.user?.email)) {
        throw new Error("Unauthorized");
    }

    const email = formData.get("email") as string;
    const makeAdmin = formData.get("makeAdmin") === "true";

    if (!email) {
        throw new Error("Email is required");
    }

    await setUserAdmin(email, makeAdmin);
    revalidatePath('/admin/users');
}
