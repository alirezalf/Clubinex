import { Link } from '@inertiajs/react';
import { Award } from 'lucide-react';
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
            <div className={`w-full h-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold ${isCollapsed ? "text-xs" : "text-sm"}`}>
                {user.first_name?.[0] || 'U'}
            </div>
        );
    };

    return (
        <div className={clsx("transition-all duration-300", isCollapsed ? "px-2 py-3" : "px-4 py-4")}>
            <Link 
                href={route('profile')}
                className={clsx(
                    "flex items-center gap-3 rounded-xl transition-all duration-200 group border relative overflow-hidden",
                    isCollapsed 
                        ? "justify-center p-1.5 border-transparent hover:bg-white/10" 
                        : "p-3 border-black/5 hover:border-primary-200 hover:shadow-sm"
                )}
                // Use color-mix to adapt background based on text color (var(--sidebar-text))
                style={{ backgroundColor: 'color-mix(in srgb, var(--sidebar-text), transparent 90%)' }}
                title="مشاهده پروفایل"
            >
                <div className="relative shrink-0">
                    <div className={clsx(
                        "rounded-full p-0.5 shadow-sm ring-1 ring-black/5 group-hover:ring-primary-200 transition-all overflow-hidden bg-white",
                        isCollapsed ? "w-9 h-9" : "w-12 h-12"
                    )}>
                        <div className="w-full h-full rounded-full overflow-hidden">
                            {renderAvatar()}
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                
                {!isCollapsed && (
                    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                        {/* Inherit color from parent (var(--sidebar-text)) */}
                        <h3 className="font-bold text-base truncate group-hover:text-primary-600 transition-colors text-inherit">
                            {user.first_name} {user.last_name}
                        </h3>
                        <div className="flex items-center gap-1.5 opacity-90 mt-1 text-inherit">
                            <div className="bg-primary-600 text-white p-0.5 rounded-full shadow-sm">
                                <Award size={10} />
                            </div>
                            <span className="font-black text-sm">{user.points?.toLocaleString() ?? 0}</span>
                            <span className="text-[10px] opacity-80">امتیاز</span>
                        </div>
                    </div>
                )}
            </Link>
        </div>
    );
}