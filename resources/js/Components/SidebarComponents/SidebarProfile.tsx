import { Link } from '@inertiajs/react';
import { Award, ChevronLeft, Sparkles, Crown } from 'lucide-react';
import clsx from 'clsx';
import React from 'react';

interface Props {
    isCollapsed: boolean;
    user: any;
}

export default function SidebarProfile({ isCollapsed, user }: Props) {
    const renderAvatar = () => {
        if (user.avatar) {
            return <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />;
        }
        return (
            <div className={`w-full h-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold ${isCollapsed ? "text-sm" : "text-lg"}`}>
                {user.first_name?.[0] || 'U'}
                {!isCollapsed && user.last_name?.[0]}
            </div>
        );
    };

    return (
        <div className={clsx("transition-all duration-300 relative group", isCollapsed ? "px-2 py-3" : "px-4 py-4")}>
            {/* افکت پس‌زمینه در هاور */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />

            <Link
                href={route('profile')}
                className={clsx(
                    "relative flex items-center gap-3 rounded-xl transition-all duration-300 group/link",
                    isCollapsed
                        ? "justify-center p-1.5"
                        : "p-3 border hover:shadow-lg"
                )}
                style={{
                    backgroundColor: 'color-mix(in srgb, var(--sidebar-text), transparent 92%)',
                    borderColor: 'color-mix(in srgb, var(--sidebar-text), transparent 85%)'
                }}
                title="مشاهده پروفایل"
            >
                {/* بخش آواتار */}
                <div className="relative shrink-0">
                    <div className={clsx(
                        "rounded-full p-0.5 shadow-lg transition-all duration-300 group-hover/link:scale-105",
                        isCollapsed ? "w-10 h-10" : "w-14 h-14"
                    )}>
                        <div className="w-full h-full rounded-full overflow-hidden ring-2 ring-white/20 group-hover/link:ring-amber-500/50 transition-all">
                            {renderAvatar()}
                        </div>
                    </div>

                    {/* نشان آنلاین */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg" />

                    {/* نشان ویژه برای کاربران خاص */}
                    {user.is_agent && (
                        <div className="absolute -top-1 -left-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white">
                            <Crown size={8} className="text-white" />
                        </div>
                    )}
                </div>

                {/* اطلاعات کاربر */}
                {!isCollapsed && (
                    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bold text-base truncate group-hover/link:text-amber-600 transition-colors" style={{ color: 'var(--sidebar-text)' }}>
                                {user.first_name} {user.last_name}
                            </h3>
                            <ChevronLeft size={14} className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" style={{ color: 'var(--sidebar-text)' }} />
                        </div>

                        <div className="flex items-center justify-between mt-1.5">
                            <div className="flex items-center gap-1.5">
                                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-1 rounded-full shadow-sm">
                                    <Award size={10} className="text-white" />
                                </div>
                                <span className="font-black text-sm text-amber-600">{user.points?.toLocaleString() ?? 0}</span>
                                <span className="text-[9px] opacity-60" style={{ color: 'var(--sidebar-text)' }}>امتیاز</span>
                            </div>

                            {/* نقش کاربر */}
                            <span className="text-[8px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                                {user.roles?.includes('agent') ? 'نماینده' : 'کاربر'}
                            </span>
                        </div>
                    </div>
                )}
            </Link>
        </div>
    );
}
