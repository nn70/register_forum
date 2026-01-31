import prisma from "./prisma";

// Super admin email - cannot be revoked
export const SUPER_ADMIN_EMAIL = "nn4work@gmail.com";

export type UserRole = "user" | "admin" | "super_admin" | "viewer";

/**
 * Get user role
 */
export async function getUserRole(email: string | null | undefined): Promise<UserRole> {
    if (!email) return "user";

    // Super admin is always super admin
    if (email === SUPER_ADMIN_EMAIL) {
        return "super_admin";
    }

    // Guest viewer
    if (email === "guest@example.com") {
        return "viewer";
    }

    // Check database for role
    const user = await prisma.user.findUnique({
        where: { email },
        select: { role: true }
    });

    if (user?.role === "admin") {
        return "admin";
    }

    // Viewer role is handled via session logic usually, but if we store it in DB later:
    if (user?.role === "viewer") {
        return "viewer";
    }

    return "user";
}

/**
 * Check if user can access admin dashboard
 */
export async function canAccessAdmin(email: string | null | undefined): Promise<boolean> {
    // Basic check based on DB role
    const role = await getUserRole(email);
    return role === "admin" || role === "super_admin" || role === "viewer";
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(email: string | null | undefined): boolean {
    return email === SUPER_ADMIN_EMAIL;
}

/**
 * Set user as admin
 */
export async function setUserAdmin(email: string, isAdmin: boolean): Promise<boolean> {
    // Cannot change super admin's role
    if (email === SUPER_ADMIN_EMAIL) {
        return false;
    }

    await prisma.user.update({
        where: { email },
        data: { role: isAdmin ? "admin" : "user" }
    });

    return true;
}

/**
 * Get all users with their roles
 */
export async function getAllUsers() {
    return prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
        },
        orderBy: { name: 'asc' }
    });
}
