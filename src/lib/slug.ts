/**
 * Generate a URL-friendly slug from date and title
 * e.g., "2026-2-18-press-conference"
 */
export function generateSlug(date: Date, title: string): string {
    // Format date as YYYY-M-D
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateStr = `${year}-${month}-${day}`;

    // Convert title to slug
    const titleSlug = title
        .toLowerCase()
        .trim()
        // Common Chinese to English mappings
        .replace(/記者會/g, 'press-conference')
        .replace(/發表會/g, 'launch-event')
        .replace(/研討會/g, 'seminar')
        .replace(/論壇/g, 'forum')
        .replace(/會議/g, 'conference')
        .replace(/工作坊/g, 'workshop')
        .replace(/活動/g, 'event')
        .replace(/講座/g, 'lecture')
        .replace(/展覽/g, 'exhibition')
        .replace(/派對/g, 'party')
        .replace(/聚會/g, 'meetup')
        .replace(/年會/g, 'annual-meeting')
        // Remove remaining Chinese characters
        .replace(/[\u4e00-\u9fff]/g, '')
        // Replace spaces and special chars with hyphens
        .replace(/[^a-z0-9]+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-+|-+$/g, '')
        // Limit length
        .slice(0, 50);

    return `${dateStr}-${titleSlug || 'event'}`;
}

/**
 * Ensure slug is unique by appending a number if needed
 */
export async function ensureUniqueSlug(
    baseSlug: string,
    checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await checkExists(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}
