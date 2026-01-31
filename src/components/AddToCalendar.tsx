'use client';

interface AddToCalendarProps {
    title: string;
    description?: string | null;
    location?: string | null;
    startTime: Date;
    endTime?: Date | null;
}

export default function AddToCalendar({ title, description, location, startTime, endTime }: AddToCalendarProps) {
    const formatDate = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d{3}/g, '').slice(0, -1);
    };

    const generateGoogleCalendarUrl = () => {
        const start = formatDate(new Date(startTime));
        const end = endTime
            ? formatDate(new Date(endTime))
            : formatDate(new Date(new Date(startTime).getTime() + 2 * 60 * 60 * 1000));

        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: title,
            dates: `${start}/${end}`,
            details: description || '',
            location: location || '',
        });

        return `https://www.google.com/calendar/render?${params.toString()}`;
    };

    return (
        <a
            href={generateGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-700 font-medium shadow-sm"
        >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            加入 Google 行事曆
        </a>
    );
}
