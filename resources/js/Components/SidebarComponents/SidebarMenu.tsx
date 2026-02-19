import { Link, usePage } from '@inertiajs/react';
import clsx from 'clsx';
import { Zap } from 'lucide-react';
import React, { useRef, useLayoutEffect } from 'react';

interface MenuItem {
    name: string;
    icon: any;
    href: string;
    group: string;
    badge?: number; 
}

interface Props {
    isCollapsed: boolean;
    setIsOpen: (open: boolean) => void;
    menuGroups: { id: string, title: string, items: MenuItem[] }[];
    adminItems: MenuItem[];
    isAdmin: boolean;
    searchTerm: string;
}

export default function SidebarMenu({ isCollapsed, setIsOpen, menuGroups, adminItems, isAdmin, searchTerm }: Props) {
    const { url } = usePage();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // تابع تبدیل اعداد به فارسی
    const toPersianDigits = (num: number) => {
        return num.toString().replace(/\d/g, (d) => "۰１２３４５６７８９"[d]);
    };

    useLayoutEffect(() => {
        const key = 'sidebar_scroll_pos';
        const container = scrollContainerRef.current;
        
        if (container) {
            const savedPos = sessionStorage.getItem(key);
            if (savedPos) {
                container.scrollTop = parseInt(savedPos, 10);
            }

            const handleScroll = () => {
                sessionStorage.setItem(key, container.scrollTop.toString());
            };
            
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const isActive = (href: string) => {
        if (!href || href === '#') return false;
        try {
            const linkUrl = new URL(href, window.location.origin);
            return url.startsWith(linkUrl.pathname);
        } catch {
            return false;
        }
    };

    const filterItems = (items: MenuItem[]) => {
        if (!searchTerm) return items;
        return items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    };

    const renderItem = (item: MenuItem) => {
        const active = isActive(item.href);
        return (
            <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                    "flex items-center rounded-xl transition-all duration-200 group relative",
                    isCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2",
                    active 
                        ? "bg-primary-50 text-primary-700 font-bold shadow-sm" 
                        : "opacity-80 hover:opacity-100 hover:bg-black/5"
                )}
                title={isCollapsed ? item.name : ''}
            >
                {active && !isCollapsed && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-primary-600 rounded-l-full"></div>
                )}

                <div className="flex items-center gap-3 z-10">
                    <div className="relative">
                        <item.icon 
                            size={isCollapsed ? 20 : 18} 
                            className={clsx(
                                "transition-colors duration-200", 
                                active ? "text-primary-600" : "opacity-60 group-hover:opacity-100 group-hover:text-primary-500"
                            )} 
                            strokeWidth={active ? 2.5 : 2}
                        />
                        {/* Collapsed Badge (Dot) */}
                        {isCollapsed && item.badge && item.badge > 0 && (
                            <span className="absolute -top-1 -left-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        )}
                    </div>
                    {!isCollapsed && <span className="text-[13px]">{item.name}</span>}
                </div>

                {/* Expanded Badge (Number) */}
                {!isCollapsed && item.badge && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center font-bold font-mono">
                        {toPersianDigits(item.badge)}
                    </span>
                )}
            </Link>
        );
    };

    return (
        <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-300/50 hover:scrollbar-thumb-gray-400 py-2"
        >
            
            {menuGroups.map((group, index) => {
                const items = filterItems(group.items);
                if (items.length === 0) return null;

                return (
                    <div key={group.id} className="mb-2">
                        {!isCollapsed && !searchTerm && (
                            <div className="flex items-center gap-2 px-2 mt-3 mb-1.5 opacity-60">
                                <span className="text-[9px] font-bold uppercase tracking-wider">{group.title}</span>
                                <div className="h-px bg-current flex-1 opacity-20 border-t border-dashed"></div>
                            </div>
                        )}
                        {isCollapsed && index > 0 && <div className="border-t border-dashed border-current opacity-20 w-8 mx-auto my-2"></div>}

                        <div className="space-y-0.5">
                            {items.map(item => renderItem(item))}
                        </div>
                    </div>
                );
            })}

            {isAdmin && (
                <div className="mt-4">
                    {!isCollapsed && !searchTerm && (
                        <div className="bg-red-50/50 rounded-lg p-2 mb-2 border border-red-100 mx-1 backdrop-blur-sm">
                            <div className="flex items-center gap-2 text-red-600">
                                <Zap size={14} fill="currentColor" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">پنل مدیریت</span>
                            </div>
                        </div>
                    )}
                    {isCollapsed && <div className="border-t border-red-100 w-8 mx-auto my-2"></div>}
                    
                    <div className="space-y-0.5">
                        {filterItems(adminItems).map(item => {
                             const active = isActive(item.href);
                             return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={clsx(
                                        "flex items-center rounded-xl transition-all duration-200 group relative",
                                        isCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2",
                                        active
                                            ? "bg-red-50 text-red-700 font-bold"
                                            : "opacity-80 hover:opacity-100 hover:bg-red-50/30 hover:text-red-700"
                                    )}
                                    title={isCollapsed ? item.name : ''}
                                >
                                    <div className="flex items-center gap-3 z-10">
                                        <div className="relative">
                                            <item.icon 
                                                size={isCollapsed ? 20 : 18} 
                                                className={clsx(
                                                    "transition-colors", 
                                                    active ? "text-red-600" : "opacity-60 group-hover:opacity-100 group-hover:text-red-500"
                                                )} 
                                            />
                                            {isCollapsed && item.badge && item.badge > 0 && (
                                                <span className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-red-600 border border-white"></span>
                                            )}
                                        </div>
                                        {!isCollapsed && <span className="text-[13px]">{item.name}</span>}
                                    </div>
                                    {!isCollapsed && item.badge && item.badge > 0 && (
                                        <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center font-bold shadow-sm font-mono">
                                            {toPersianDigits(item.badge)}
                                        </span>
                                    )}
                                </Link>
                             );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}