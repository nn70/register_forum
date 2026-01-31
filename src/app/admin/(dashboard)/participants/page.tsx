
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canAccessAdmin } from "@/lib/roles";
import AttendeeNameCell from "../events/AttendeeNameCell";

export default async function ParticipantsPage({
    searchParams
}: {

    searchParams: Promise<{ filter?: string }>
}) {
    const session = await getServerSession(authOptions);
    if (!session || !(await canAccessAdmin(session.user?.email))) {
        redirect("/admin/no-access");
    }

    const { filter } = await searchParams;
    const isVipFilter = filter === 'vip';

    // Fetch all attendees with event info
    const attendees = await prisma.attendee.findMany({
        include: {
            event: {
                select: {
                    title: true,
                    location: true,
                    description: true,
                    startTime: true,
                    isOnline: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Fetch all system users to match avatars
    const users = await prisma.user.findMany();
    const userMap = new Map(users.map(u => [u.email, u]));

    // Aggregate data by email
    const aggregated = new Map<string, {
        name: string;
        email: string;
        phone: string;
        attendCount: number;
        locations: string[];
        lastSeen: Date;
        events: string[];
    }>();

    attendees.forEach((a: any) => {
        const email = a.email.toLowerCase();
        const existing = aggregated.get(email);

        // Determine location Category
        let locationCategory = '未知地點';

        if (a.event.isOnline) {
            locationCategory = '線上活動';
        } else if (a.event.location) {
            // Regex to extract City + District (Address parsing)
            // Matches 2-3 chars ending in 縣/市 (City) followed by 2-3 chars ending in 區/鄉/鎮/市 (District)
            const match = a.event.location.match(/(.{2,3}[縣市])(.{2,3}[區鄉鎮市])/);
            if (match) {
                locationCategory = `${match[1]}${match[2]}`;
            } else {
                // Fallback to simpler city extraction or full string if short
                const simpleMatch = a.event.location.match(/.{2,3}[縣市]/);
                locationCategory = simpleMatch ? simpleMatch[0] : a.event.location;
            }
        }

        const eventDate = new Date(a.event.startTime);

        if (existing) {
            existing.attendCount += 1;
            existing.locations.push(locationCategory);
            existing.events.push(a.event.title);
            if (eventDate > existing.lastSeen) {
                existing.lastSeen = eventDate;
            }
            // Update phone/name if newer? Keep original for now.
        } else {
            aggregated.set(email, {
                name: a.name,
                email: email,
                phone: a.phone,
                attendCount: 1,
                locations: [locationCategory],
                lastSeen: eventDate,
                events: [a.event.title]
            });
        }
    });

    // Helper to find mode (most frequent item)
    const getFavoriteLocation = (locations: string[]) => {
        if (locations.length === 0) return '無';
        const counts = new Map<string, number>();
        let maxCount = 0;
        let mode = locations[0];

        locations.forEach(loc => {
            const count = (counts.get(loc) || 0) + 1;
            counts.set(loc, count);
            if (count > maxCount) {
                maxCount = count;
                mode = loc;
            }
        });
        return mode;
    };

    // Convert map to array and sort
    let participants = Array.from(aggregated.values()).map(p => ({
        ...p,
        favoriteLocation: getFavoriteLocation(p.locations),
        userProfile: userMap.get(p.email)
    }));

    // Sort by count desc
    participants.sort((a, b) => b.attendCount - a.attendCount);

    // Filter
    if (isVipFilter) {
        participants = participants.filter(p => p.attendCount > 1);
    }

    const totalParticipants = aggregated.size;
    const vipCount = Array.from(aggregated.values()).filter(p => p.attendCount > 1).length;
    const returnRate = totalParticipants > 0 ? Math.round((vipCount / totalParticipants) * 100) : 0;

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800">參加者分析</h2>
                <p className="text-slate-500 text-sm mt-1">
                    分析參加者的活動參與度與偏好
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-gray-500 text-sm mb-1">總參加人數 (不重複)</p>
                    <p className="text-3xl font-bold text-slate-800">{totalParticipants}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-gray-500 text-sm mb-1">回頭客 (參加超過1次)</p>
                    <p className="text-3xl font-bold text-purple-600">{vipCount}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-gray-500 text-sm mb-1">回訪率</p>
                    <p className="text-3xl font-bold text-blue-600">{returnRate}%</p>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
                <div className="p-4 border-b border-slate-100 flex gap-4 items-center">
                    <span className="text-sm font-medium text-slate-600">篩選：</span>
                    <a
                        href="/admin/participants"
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!isVipFilter ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        全部 ({totalParticipants})
                    </a>
                    <a
                        href="/admin/participants?filter=vip"
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isVipFilter ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        多次參加者 ({vipCount})
                    </a>
                </div>

                {/* Table */}
                <table className="w-full min-w-[800px]">
                    <thead className="bg-slate-50 text-left border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">參加者</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">參加次數</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">偏好地區</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">最後活躍</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">聯絡資訊</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {participants.map(p => (
                            <tr key={p.email} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {p.userProfile?.image ? (
                                            <img src={p.userProfile.image} alt="" className="w-10 h-10 rounded-full" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                                {p.name[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <AttendeeNameCell
                                                name={p.name}
                                                email={p.email}
                                                phone={p.phone}
                                            />
                                            {p.userProfile && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
                                                    會員
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${p.attendCount > 1
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {p.attendCount}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    <span className="flex items-center gap-1.5">
                                        <span>📍</span>
                                        {p.favoriteLocation}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {p.lastSeen.toLocaleDateString('zh-TW')}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    <div>{p.email}</div>
                                    <div className="text-xs text-slate-400">{p.phone}</div>
                                </td>
                            </tr>
                        ))}
                        {participants.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                                    尚無資料
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Maybe a bar chart here later? For now just raw data is good. */}
            </div>
        </div>
    );
}
