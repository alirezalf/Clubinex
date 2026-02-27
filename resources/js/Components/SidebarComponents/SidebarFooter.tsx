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
            color: 'hover:text-amber-500 hover:bg-amber-500/10',
            iconColor: 'text-amber-500'
        },
        {
            key: 'help',
            icon: HelpCircle,
            label: 'پشتیبانی',
            href: route('tickets.index'),
            color: 'hover:text-blue-500 hover:bg-blue-500/10',
            iconColor: 'text-blue-500'
        },
        {
            key: 'logout',
            icon: LogOut,
            label: 'خروج از حساب',
            href: route('logout'),
            method: 'post',
            as: 'button',
            color: 'hover:text-red-500 hover:bg-red-500/10',
            iconColor: 'text-red-500'
        }
    ];

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
                                    item.color
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
                                        "bg-gray-900 text-white shadow-lg transition-all duration-200",
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
