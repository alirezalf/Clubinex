import { Link } from '@inertiajs/react';
import clsx from 'clsx';
import { Settings, LogOut, HelpCircle } from 'lucide-react';
import React, { useState } from 'react';

interface Props {
    isCollapsed: boolean;
    isAdmin: boolean;
}

export default function SidebarFooter({ isCollapsed, isAdmin }: Props) {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const items = [
        {
            key: 'settings',
            icon: Settings,
            label: 'تنظیمات',
            href: isAdmin ? route('admin.settings') : route('profile'),
            color: 'hover:text-amber-500 hover:bg-amber-50',
            iconColor: 'text-amber-500'
        },
        {
            key: 'help',
            icon: HelpCircle,
            label: 'درباره ما',
            href: route('about'),
            color: 'hover:text-blue-500 hover:bg-blue-50',
            iconColor: 'text-blue-500'
        },
        {
            key: 'logout',
            icon: LogOut,
            label: 'خروج',
            href: route('logout'),
            method: 'post',
            as: 'button',
            color: 'hover:text-red-500 hover:bg-red-50',
            iconColor: 'text-red-500'
        }
    ];

    if (isCollapsed) {
        return (
            <div className="shrink-0 border-t py-4 flex flex-col items-center justify-center relative group/footer cursor-pointer"
                 style={{ borderColor: 'color-mix(in srgb, var(--sidebar-text), transparent 85%)' }}>
                 
                 <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover/footer:bg-white/10" style={{ color: 'var(--sidebar-text)' }}>
                     <Settings size={22} className="opacity-70 group-hover/footer:opacity-100 transition-opacity" />
                 </div>
                 
                 <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-[calc(100%+8px)] opacity-0 invisible group-hover/footer:opacity-100 group-hover/footer:visible transition-all duration-300 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 z-50">
                     <div className="flex items-center gap-2">
                         {items.map(item => {
                             const Icon = item.icon;
                             return (
                                 <Link 
                                     key={item.key} 
                                     href={item.href} 
                                     method={item.method as any} 
                                     as={item.as as any} 
                                     className={clsx(
                                         "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all duration-200 min-w-[72px]",
                                         item.color, "hover:scale-105"
                                     )}
                                 >
                                     <Icon size={20} className={item.iconColor} />
                                     <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{item.label}</span>
                                 </Link>
                             );
                         })}
                     </div>
                 </div>
            </div>
        );
    }

    return (
        <div className="shrink-0 border-t px-2 py-2"
             style={{ borderColor: 'color-mix(in srgb, var(--sidebar-text), transparent 85%)' }}>

            <div className="flex items-center justify-between gap-1">

                {items.map((item) => {
                    const Icon = item.icon;
                    const isHovered = hoveredItem === item.key;

                    return (
                        <div key={item.key} className="relative flex-1 flex justify-center">
                            <Link
                                href={item.href}
                                method={item.method as any}
                                as={item.as as any}
                                onMouseEnter={() => setHoveredItem(item.key)}
                                onMouseLeave={() => setHoveredItem(null)}
                                className={clsx(
                                    "relative flex items-center justify-center rounded-xl p-2.5 transition-all duration-200",
                                    item.color.replace('hover:bg-', 'hover:bg-').replace('50', '500/10')
                                )}
                            >
                                <Icon
                                    size={18}
                                    className={clsx(
                                        "transition-all duration-200",
                                        item.iconColor,
                                        "group-hover:scale-110"
                                    )}
                                />

                                {/* Tooltip */}
                                <div
                                    className={clsx(
                                        "absolute bottom-full mb-2 px-2.5 py-1.5 text-xs rounded-lg whitespace-nowrap",
                                        "bg-gray-900 text-white shadow-lg transition-all duration-200 z-50",
                                        isHovered
                                            ? "opacity-100 translate-y-0 visible"
                                            : "opacity-0 translate-y-1 invisible"
                                    )}
                                >
                                    {item.label}
                                    <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                                </div>
                            </Link>
                        </div>
                    );
                })}

            </div>
        </div>
    );
}
