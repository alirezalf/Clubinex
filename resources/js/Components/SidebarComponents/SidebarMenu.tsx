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
    subItems?: MenuItem[];
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
    const { url } = usePage<any>();
    const { modules } = usePage<any>().props;
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
        try {
            const saved = localStorage.getItem('sidebar_expanded_groups');
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(() => {
        try {
            const saved = localStorage.getItem('sidebar_expanded_items');
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });

    useEffect(() => {
        localStorage.setItem('sidebar_expanded_groups', JSON.stringify(expandedGroups));
    }, [expandedGroups]);

    useEffect(() => {
        localStorage.setItem('sidebar_expanded_items', JSON.stringify(expandedItems));
    }, [expandedItems]);

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

    const isActive = (href?: string) => {
        if (!href || href === '#') return false;
        try {
            const linkUrl = new URL(href, window.location.origin);
            const currentUrl = new URL(url, window.location.origin);

            // Special handling for admin settings tabs
            if (linkUrl.pathname.includes('/admin/settings') && currentUrl.pathname.includes('/admin/settings')) {
                const getTab = (u: URL) => {
                    if (u.pathname !== '/admin/settings' && u.pathname.length > 15) {
                        return u.pathname.replace('/admin/settings/', '');
                    }
                    return u.searchParams.get('tab') || 'general';
                };
                return getTab(linkUrl) === getTab(currentUrl);
            }

            // Allow exact query param matching if present, specifically for settings tab
            if (href.includes('?')) {
                return currentUrl.pathname + currentUrl.search === linkUrl.pathname + linkUrl.search;
            }
            return currentUrl.pathname.startsWith(linkUrl.pathname);
        } catch {
            return false;
        }
    };

    useEffect(() => {
        // Expand active groups initially
        const newExpanded: Record<string, boolean> = {};
        const newExpandedItems: Record<string, boolean> = {};

        const checkItem = (item: MenuItem) => {
            if (item.subItems) {
                const isChildActive = item.subItems.some(sub => isActive(sub.href));
                if (isChildActive) {
                    newExpandedItems[item.name] = true;
                    return true;
                }
            } else {
                return isActive(item.href);
            }
            return false;
        };

        menuGroups.forEach(group => {
            const hasActive = group.items.some(item => checkItem(item));
            if (hasActive) {
                newExpanded[group.id] = true;
            }
        });

        // Admin active check
        const hasAdminActive = adminItems.some(i => checkItem(i));
        if (hasAdminActive) {
            newExpanded['admin'] = true;
        }

        setExpandedGroups(prev => ({ ...prev, ...newExpanded }));
        setExpandedItems(prev => ({ ...prev, ...newExpandedItems }));
    }, [url]);

    const toggleGroup = (groupId: string) => {
        if (isCollapsed) return; // Prevent toggle when collapsed
        setExpandedGroups(prev => {
            const isCurrentlyExpanded = prev[groupId] === true; // Default closed
            return {
                ...prev,
                [groupId]: !isCurrentlyExpanded
            };
        });
    };

    const toggleItem = (itemName: string) => {
        if (isCollapsed) return;
        setExpandedItems(prev => ({
            ...prev,
            [itemName]: !prev[itemName]
        }));
    };

    const filterItems = (items: MenuItem[]) => {
        return items.filter(item => {
            // Check module license
            if ((item as any).module && modules && (modules[(item as any).module] === '0' || modules[(item as any).module] === false)) {
                return false;
            }
            if (!searchTerm) return true;

            const matchName = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchDesc = item.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchSubItems = item.subItems?.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

            return matchName || matchDesc || matchSubItems;
        });
    };

    const renderItem = (item: MenuItem, isAdminItem: boolean = false, isSubItem: boolean = false) => {
        const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
        const active = hasSubItems ? item.subItems!.some(s => isActive(s.href)) : isActive(item.href);
        const isExpanded = expandedItems[item.name] === true;
        const isHovered = hoveredItem === item.name;

        const content = (
            <>
                {/* نشانگر آیتم فعال */}
                {active && !isCollapsed && !isSubItem && !hasSubItems && (
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
                            size={isCollapsed && !isSubItem ? 20 : (isSubItem ? 14 : 18)}
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
                        {isCollapsed && !isSubItem && typeof item.badge === "number" && (
                            <span className="absolute -top-1 -left-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                            </span>
                        )}
                    </div>

                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className={clsx("font-medium", isSubItem ? "text-[12px]" : "text-[13px]")}>{item.name}</span>
                            {item.description && !isSubItem && (
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
                        {!hasSubItems ? (
                            <ChevronLeft
                                size={isSubItem ? 12 : 14}
                                className={clsx(
                                    "opacity-0 -translate-x-2 transition-all",
                                    "group-hover:opacity-100 group-hover:translate-x-0",
                                    active ? "opacity-100" : ""
                                )}
                                style={{ color: isAdminItem ? '#dc2626' : '#f59e0b' }}
                            />
                        ) : (
                            <ChevronDown
                                size={14}
                                className={clsx(
                                    "transition-transform duration-300 opacity-50",
                                    !isExpanded && "rotate-90"
                                )}
                            />
                        )}
                    </div>
                )}
            </>
        );

        return (
            <div key={item.name} className="flex flex-col">
                {hasSubItems ? (
                    <button
                        onClick={() => toggleItem(item.name)}
                        onMouseEnter={() => setHoveredItem(item.name)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={clsx(
                            "relative flex items-center rounded-xl transition-all duration-200 group cursor-pointer w-full text-right",
                            isCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2.5",
                            active
                                ? (isAdminItem ? "bg-red-50/50 font-bold shadow-sm border border-red-100" : "bg-amber-50/50 font-bold shadow-sm border border-amber-100")
                                : "font-semibold border border-transparent shadow-sm bg-gray-50/60"
                        )}
                        style={{
                            backgroundColor: active
                                ? (isAdminItem ? 'color-mix(in srgb, #fef2f2, transparent 50%)' : 'color-mix(in srgb, #fffbeb, transparent 50%)')
                                : (isHovered ? 'var(--sidebar-hover-bg)' : undefined),
                            color: active
                                ? (isAdminItem ? '#dc2626' : '#b45309')
                                : (isHovered ? 'var(--sidebar-hover-text)' : undefined)
                        }}
                    >
                        {content}
                    </button>
                ) : (
                    <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        onMouseEnter={() => setHoveredItem(item.name)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={clsx(
                            "relative flex items-center rounded-xl transition-all duration-200 group cursor-pointer",
                            isCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2.5",
                            active
                                ? (isAdminItem ? "bg-red-50 font-bold shadow-sm" : "bg-amber-50 font-bold shadow-sm")
                                : "opacity-80"
                        )}
                        style={{
                            backgroundColor: active
                                ? (isAdminItem ? 'color-mix(in srgb, #fef2f2, transparent 0%)' : 'color-mix(in srgb, #fffbeb, transparent 0%)')
                                : (isHovered ? 'var(--sidebar-hover-bg)' : 'transparent'),
                            color: active
                                ? (isAdminItem ? '#dc2626' : '#b45309')
                                : (isHovered ? 'var(--sidebar-hover-text)' : undefined)
                        }}
                        title={isCollapsed ? item.name : ''}
                    >
                        {content}
                    </Link>
                )}

                {hasSubItems && !isCollapsed && (
                    <div className={clsx(
                        "grid transition-all duration-300 ease-in-out",
                        isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                    )}>
                        <div className="overflow-hidden">
                            <div className="pl-2 pr-4 space-y-1 mt-1 border-r-2 border-red-100 pb-1">
                                {item.subItems!.filter(si => {
                                    if (!searchTerm) return true;
                                    const parentMatches = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
                                    if (parentMatches) return true;
                                    return si.name.toLowerCase().includes(searchTerm.toLowerCase());
                                }).map((sub) => renderItem(sub, isAdminItem, true))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
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
                const isExpanded = isCollapsed ? true : expandedGroups[group.id] === true; // Default closed
                const groupHasActive = items.some(i => isActive(i.href));

                const getGroupStyles = (id: string) => {
                    switch(id) {
                        case 'general':
                            return {
                                gradientConfig: "from-blue-500/20 to-indigo-500/20",
                                bgConfig: "from-blue-50 to-indigo-50",
                                borderConfig: "border-blue-100",
                                iconBgConfig: "from-blue-500 to-indigo-500",
                                textColor: "text-blue-600",
                                chevronColor: "text-blue-500",
                            };
                        case 'club':
                            return {
                                gradientConfig: "from-emerald-500/20 to-teal-500/20",
                                bgConfig: "from-emerald-50 to-teal-50",
                                borderConfig: "border-emerald-100",
                                iconBgConfig: "from-emerald-500 to-teal-500",
                                textColor: "text-emerald-600",
                                chevronColor: "text-emerald-500",
                            };
                        case 'support':
                            return {
                                gradientConfig: "from-violet-500/20 to-purple-500/20",
                                bgConfig: "from-violet-50 to-purple-50",
                                borderConfig: "border-violet-100",
                                iconBgConfig: "from-violet-500 to-purple-500",
                                textColor: "text-violet-600",
                                chevronColor: "text-violet-500",
                            };
                        default:
                            return null;
                    }
                };

                const groupStyle = getGroupStyles(group.id);

                return (
                    <div key={group.id} className={clsx("mb-3", index > 0 && "mt-4")}>
                        {!isCollapsed && !searchTerm && (
                            <button
                                onClick={() => toggleGroup(group.id)}
                                onMouseEnter={() => setHoveredItem('group_' + group.id)}
                                onMouseLeave={() => setHoveredItem(null)}
                                className={clsx("w-full relative mb-2 cursor-pointer", groupStyle ? "group/grp" : "flex items-center justify-between px-3 py-2 rounded-xl transition-all")}
                                style={!groupStyle ? {
                                    backgroundColor: groupHasActive ? 'var(--sidebar-hover-bg)' : (hoveredItem === 'group_' + group.id ? 'var(--sidebar-hover-bg)' : 'transparent'),
                                } : {}}
                            >
                                {groupStyle ? (
                                    <>
                                        <div className={clsx("absolute -inset-1 bg-gradient-to-r rounded-lg blur-sm group-hover/grp:opacity-100 opacity-60 transition-opacity", groupStyle.gradientConfig)} />
                                        <div className={clsx("relative bg-gradient-to-r rounded-lg p-2 border flex items-center gap-2 justify-between", groupStyle.bgConfig, groupStyle.borderConfig)}>
                                            <div className="flex items-center gap-2">
                                                <div className={clsx("p-1 bg-gradient-to-r rounded-md shadow-lg", groupStyle.iconBgConfig)}>
                                                    {group.icon && <group.icon size={12} className="text-white" />}
                                                </div>
                                                <span className={clsx("text-[11px] font-bold", groupStyle.textColor)}>{group.title}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <ChevronDown
                                                    size={14}
                                                    className={clsx("transition-transform duration-300", groupStyle.chevronColor, !isExpanded && "rotate-90")}
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2">
                                            {group.icon && (
                                                <group.icon size={14} style={{ color: 'var(--sidebar-text)', opacity: 0.7 }} />
                                            )}
                                            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--sidebar-text)', opacity: 0.7 }}>
                                                {group.title}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            size={14}
                                            className={clsx("transition-transform duration-300", !isExpanded && "rotate-90")}
                                            style={{ color: 'var(--sidebar-text)', opacity: 0.5 }}
                                        />
                                    </>
                                )}
                            </button>
                        )}

                        {isCollapsed && !groupStyle && index > 0 && (
                            <div className="border-t border-dashed mx-auto my-2 w-8" style={{ borderColor: 'color-mix(in srgb, var(--sidebar-text), transparent 70%)' }} />
                        )}

                        {isCollapsed && groupStyle && (
                            <div className="relative flex justify-center my-2 mb-3">
                                <div className={clsx("w-8 h-8 bg-gradient-to-r rounded-xl flex items-center justify-center shadow-lg", groupStyle.iconBgConfig)}>
                                    {group.icon && <group.icon size={14} className="text-white" />}
                                </div>
                            </div>
                        )}

                        <div className={clsx(
                            "grid transition-all duration-300 ease-in-out",
                            (!isExpanded && !isCollapsed && !searchTerm) ? "grid-rows-[0fr] opacity-0 pointer-events-none" : "grid-rows-[1fr] opacity-100"
                        )}>
                            <div className="overflow-hidden">
                                <div className="space-y-0.5">
                                    {items.map(item => renderItem(item))}
                                </div>
                            </div>
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
                            onMouseEnter={() => setHoveredItem('admin_group')}
                            onMouseLeave={() => setHoveredItem(null)}
                            className="w-full relative mb-3 group/admin cursor-pointer"
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
                                        className={clsx("text-red-500 transition-transform duration-300", expandedGroups['admin'] !== true && "rotate-90")}
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
                        "grid transition-all duration-300 ease-in-out",
                        (expandedGroups['admin'] !== true && !isCollapsed && !searchTerm) ? "grid-rows-[0fr] opacity-0 pointer-events-none" : "grid-rows-[1fr] opacity-100"
                    )}>
                        <div className="overflow-hidden">
                            <div className="space-y-0.5">
                                {filterItems(adminItems).map(item => renderItem(item, true))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
