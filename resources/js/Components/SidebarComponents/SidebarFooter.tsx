import { Link } from '@inertiajs/react';
import clsx from 'clsx';
import { Settings, LogOut } from 'lucide-react';
import React from 'react';

interface Props {
    isCollapsed: boolean;
    isAdmin: boolean;
}

export default function SidebarFooter({ isCollapsed, isAdmin }: Props) {
    return (
        <div className="p-3 border-t border-black/5 bg-black/5 backdrop-blur-sm shrink-0">
            <div className={clsx("grid gap-2", isCollapsed ? "grid-cols-1" : "grid-cols-2")}>
                <Link
                    href={isAdmin ? route('admin.settings') : route('profile')}
                    className={clsx(
                        "flex items-center justify-center gap-2 rounded-xl transition-all duration-200 group opacity-70 hover:opacity-100 hover:bg-white/50",
                        isCollapsed ? "p-2.5" : "py-2 px-3"
                    )}
                    title="تنظیمات"
                >
                    <Settings size={18} className="group-hover:rotate-45 transition-transform duration-500" />
                    {!isCollapsed && <span className="text-xs font-medium">تنظیمات</span>}
                </Link>
                
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className={clsx(
                        "flex items-center justify-center gap-2 rounded-xl transition-all duration-200 group text-red-600 hover:bg-red-50",
                        isCollapsed ? "p-2.5" : "py-2 px-3"
                    )}
                    title="خروج"
                >
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    {!isCollapsed && <span className="text-xs font-medium">خروج</span>}
                </Link>
            </div>
        </div>
    );
}