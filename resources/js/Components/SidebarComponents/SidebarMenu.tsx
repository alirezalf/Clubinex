import { Link, usePage } from '@inertiajs/react';
import clsx from 'clsx';
import { Zap, ChevronLeft, ChevronDown, Search, Sparkles } from 'lucide-react';
import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';

interface MenuItem {
    name: string;
    icon: any;
    href: string;
    group: string;
    badge?: number;
    description?: string;
}

interface Props {
    isCollapsed: boolean;
    setIsOpen: (open: boolean) => void;
    menuGroups: { id: string, title: string, icon?: any, items: MenuItem[] }[];
    adminItems: MenuItem[];
    isAdmin: boolean;
    searchTerm: string;
}

export default function SidebarMenu({ isCollapsed, setIsOpen, menuGroups, adminItems, isAdmin, searchTerm }: Props) {
    const { url, modules } = usePage<any>().props;
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    // تابع تبدیل اعداد به فارسی
    const toPersianDigits = (num: number) => {
        return num.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]);
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

    useEffect(() => {
        // Expand active groups initially
        const newExpanded: Record<string, boolean> = {};
        menuGroups.forEach(group => {
            const hasActive = group.items.some(item => isActive(item.href));
            if (hasActive) {
                newExpanded[group.id] = true;
            }
        });

        // Admin active check
        const hasAdminActive = adminItems.some(i => isActive(i.href));
        if (hasAdminActive) {
            newExpanded['admin'] = true;
        }

        setExpandedGroups(prev => ({ ...prev, ...newExpanded }));
    }, [url]);

    const toggleGroup = (groupId: string) => {
        if (isCollapsed) return; // Prevent toggle when collapsed
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    const filterItems = (items: MenuItem[]) => {
        return items.filter(item => {
            // Check module license
            if ((item as any).module && modules && (modules[(item as any).module] === '0' || modules[(item as any).module] === false)) {
                return false;
            }
            if (!searchTerm) return true;
            return item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        });
    };

    const renderItem = (item: MenuItem, isAdminItem: boolean = false) => {
        const active = isActive(item.href);
        const isHovered = hoveredItem === item.name;

        return (
            <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                className={clsx(
                    "relative flex items-center rounded-xl transition-all duration-200 group",
                    isCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2.5",
                    active
                        ? isAdminItem
                            ? "bg-red-50 text-red-700 font-bold shadow-sm"
                            : "bg-amber-50 text-amber-700 font-bold shadow-sm"
                        : "opacity-80 hover:opacity-100 hover:bg-black/5"
                )}
                style={{
                    backgroundColor: active
                        ? isAdminItem
                            ? 'color-mix(in srgb, #fef2f2, transparent 0%)'
                            : 'color-mix(in srgb, #fffbeb, transparent 0%)'
                        : 'transparent'
                }}
                title={isCollapsed ? item.name : ''}
            >
                {/* نشانگر آیتم فعال */}
                {active && !isCollapsed && (
                    <div className={clsx(
                        "absolute right-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-l-full",
                        isAdminItem ? "bg-red-600" : "bg-amber-600"
                    )}>
                        <div className={clsx(
                            "absolute inset-0 animate-pulse",
                            isAdminItem ? "bg-red-400" : "bg-amber-400"
                        )} />
                    </div>
                )}

                {/* بخش آیکون و عنوان */}
                <div className="flex items-center gap-3 z-10">
                    <div className="relative">
                        <item.icon
                            size={isCollapsed ? 20 : 18}
                            className={clsx(
                                "transition-all duration-200",
                                active
                                    ? isAdminItem ? "text-red-600" : "text-amber-600"
                                    : "opacity-60 group-hover:opacity-100 group-hover:scale-110",
                                isHovered && !active && (isAdminItem ? "text-red-500" : "text-amber-500")
                            )}
                            strokeWidth={active ? 2.5 : 2}
                        />

                        {/* نشان badge در حالت collapsed */}
                        {isCollapsed && typeof item.badge === "number" && (
                            <span className="absolute -top-1 -left-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                            </span>
                        )}
                    </div>

                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className="text-[13px] font-medium">{item.name}</span>
                            {item.description && (
                                <span className="text-[9px] opacity-50 mt-0.5">{item.description}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* بخش badge و آیکون فلش */}
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                       {typeof item.badge === "number" && (
                            <span className={clsx(
                                "text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center font-bold font-mono shadow-sm",
                                isAdminItem
                                    ? "bg-red-600 text-white"
                                    : "bg-amber-600 text-white"
                            )}>
                                {toPersianDigits(item.badge)}
                            </span>
                        )}
                        <ChevronLeft
                            size={14}
                            className={clsx(
                                "opacity-0 -translate-x-2 transition-all",
                                "group-hover:opacity-100 group-hover:translate-x-0",
                                active ? "opacity-100" : ""
                            )}
                            style={{ color: isAdminItem ? '#dc2626' : '#f59e0b' }}
                        />
                    </div>
                )}
            </Link>
        );
    };

    return (
        <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-300/50 hover:scrollbar-thumb-gray-400 py-3 relative"
            style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'color-mix(in srgb, var(--sidebar-text), transparent 70%) transparent'
            }}
        >
            {/* جستجو وقتی نتیجه‌ای نداره */}
            {searchTerm && filterItems([...menuGroups.flatMap(g => g.items), ...adminItems]).length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Search size={20} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-1">نتیجه‌ای یافت نشد</p>
                    <p className="text-xs text-gray-400">عبارت دیگری را جستجو کنید</p>
                </div>
            )}

            {/* گروه‌های منو */}
            {menuGroups.map((group, index) => {
                const items = filterItems(group.items);
                if (items.length === 0) return null;
                const isExpanded = isCollapsed ? true : expandedGroups[group.id] !== false; // Default expanded if not set
                const groupHasActive = items.some(i => isActive(i.href));

                return (
                    <div key={group.id} className="mb-3">
                        {!isCollapsed && !searchTerm && (
                            <button
                                onClick={() => toggleGroup(group.id)}
                                className={clsx(
                                    "w-full flex items-center justify-between px-3 py-2 mt-2 mb-1 rounded-xl transition-all",
                                    groupHasActive ? "bg-black/5" : "hover:bg-black/5"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {group.icon && (
                                        <group.icon size={14} style={{ color: ['general', 'club', 'support'].includes(group.id) ? '#3b82f6' : 'var(--sidebar-text)', opacity: ['general', 'club', 'support'].includes(group.id) ? 1 : 0.7 }} />
                                    )}
                                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: ['general', 'club', 'support'].includes(group.id) ? '#3b82f6' : 'var(--sidebar-text)', opacity: ['general', 'club', 'support'].includes(group.id) ? 1 : 0.7 }}>
                                        {group.title}
                                    </span>
                                </div>
                                <ChevronDown
                                    size={14}
                                    className={clsx("transition-transform duration-300", !isExpanded && "rotate-90")}
                                    style={{ color: 'var(--sidebar-text)', opacity: 0.5 }}
                                />
                            </button>
                        )}

                        {isCollapsed && index > 0 && (
                            <div className="border-t border-dashed mx-auto my-2 w-8" style={{ borderColor: 'color-mix(in srgb, var(--sidebar-text), transparent 70%)' }} />
                        )}

                        <div className={clsx(
                            "space-y-0.5 overflow-hidden transition-all duration-300 ease-in-out",
                            (!isExpanded && !isCollapsed && !searchTerm) ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100"
                        )}>
                            {items.map(item => renderItem(item))}
                        </div>
                    </div>
                );
            })}

            {/* بخش ادمین */}
            {isAdmin && (
                <div className="mt-4 border-t border-dashed pt-4" style={{ borderColor: 'color-mix(in srgb, var(--sidebar-text), transparent 80%)' }}>
                    {!isCollapsed && !searchTerm && (
                        <button
                            onClick={() => toggleGroup('admin')}
                            className="w-full relative mb-3 group/admin"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-amber-500/20 rounded-lg blur-sm group-hover/admin:opacity-100 opacity-60 transition-opacity" />
                            <div className="relative bg-gradient-to-r from-red-50 to-amber-50 rounded-lg p-2 border border-red-100 flex items-center gap-2 justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 bg-gradient-to-r from-red-500 to-amber-500 rounded-md shadow-lg">
                                        <Zap size={12} className="text-white" />
                                    </div>
                                    <span className="text-[11px] font-bold text-red-600">پنل مدیریت</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Sparkles size={10} className="text-amber-500" />
                                    <ChevronDown
                                        size={14}
                                        className={clsx("text-red-500 transition-transform duration-300", expandedGroups['admin'] === false && "rotate-90")}
                                    />
                                </div>
                            </div>
                        </button>
                    )}

                    {isCollapsed && (
                        <div className="relative flex justify-center my-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                                <Zap size={14} className="text-white" />
                            </div>
                        </div>
                    )}

                    <div className={clsx(
                        "space-y-0.5 overflow-hidden transition-all duration-300 ease-in-out",
                        (expandedGroups['admin'] === false && !isCollapsed && !searchTerm) ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100"
                    )}>
                        {filterItems(adminItems).map(item => renderItem(item, true))}
                    </div>
                </div>
            )}
        </div>
    );
}
