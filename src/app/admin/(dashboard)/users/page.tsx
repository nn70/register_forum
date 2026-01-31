import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isSuperAdmin, getAllUsers, SUPER_ADMIN_EMAIL } from "@/lib/roles";
import { updateUserRole } from "./actions";

export default async function UsersPage() {
    const session = await getServerSession(authOptions);

    if (!isSuperAdmin(session?.user?.email)) {
        redirect("/admin");
    }

    const users = await getAllUsers();

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800">使用者管理</h2>
                <p className="text-slate-500 text-sm mt-1">
                    管理系統使用者和管理員權限
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead className="bg-slate-50 text-left border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">使用者</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">電子郵件</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">角色</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(user => {
                            const isSuper = user.email === SUPER_ADMIN_EMAIL;
                            const isAdmin = user.role === "admin" || isSuper;

                            return (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {user.image ? (
                                                <img
                                                    src={user.image}
                                                    alt=""
                                                    className="w-10 h-10 rounded-full"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                                    <span className="text-slate-500">👤</span>
                                                </div>
                                            )}
                                            <span className="font-medium text-slate-800">
                                                {user.name || '未命名'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isSuper ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                                <span>👑</span> 超級管理員
                                            </span>
                                        ) : isAdmin ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                <span>⚡</span> 管理員
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                                一般使用者
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {!isSuper && (
                                            <form action={updateUserRole}>
                                                <input type="hidden" name="email" value={user.email || ''} />
                                                <input type="hidden" name="makeAdmin" value={isAdmin ? "false" : "true"} />
                                                <button
                                                    type="submit"
                                                    className={`text-sm px-4 py-2 rounded-lg transition-all ${isAdmin
                                                        ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                                                        }`}
                                                >
                                                    {isAdmin ? '撤銷管理員' : '設為管理員'}
                                                </button>
                                            </form>
                                        )}
                                        {isSuper && (
                                            <span className="text-xs text-slate-400">無法修改</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-16 text-center text-slate-500">
                                    <div className="text-4xl mb-2">👥</div>
                                    尚無使用者
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
