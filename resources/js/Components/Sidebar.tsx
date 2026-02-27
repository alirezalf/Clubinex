import { usePage } from '@inertiajs/react';
import clsx from 'clsx';
import { Search, X, Sparkles } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import type { PageProps } from '@/types';

// Sub-components & Config
import SidebarHeader from './SidebarComponents/SidebarHeader';
import SidebarProfile from './SidebarComponents/SidebarProfile';
import SidebarMenu from './SidebarComponents/SidebarMenu';
import SidebarFooter from './SidebarComponents/SidebarFooter';
import SidebarStyles from './SidebarComponents/SidebarStyles';
import { getMenuItems, getAdminItems, getMenuGroups } from './SidebarComponents/SidebarConfig';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

export default function Sidebar({ isOpen, setIsOpen, isCollapsed, toggleCollapse }: SidebarProps) {
    // @ts-ignore
    const { auth, site, badges, unreadNotificationsCount } = usePage<PageProps & { site: any, badges: { user: number, admin: number, rewards: number }, unreadNotificationsCount: number }>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const isAdmin = auth.user.roles.includes('super-admin') || auth.user.roles.includes('admin');

    // پاک کردن جستجو هنگام بسته شدن سایدبار
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
        }
    }, [isOpen]);

    const allMenuItems = getMenuItems(badges?.user || 0, unreadNotificationsCount || 0);
    const allAdminItems = getAdminItems(badges?.admin || 0, badges?.rewards || 0);
    const menuGroups = getMenuGroups(allMenuItems);

    return (
        <>
            {/* Mobile Overlay - با انیمیشن بهتر */}
            <div
                className={clsx(
                    "fixed inset-0 bg-black/60 z-[99] lg:hidden backdrop-blur-sm transition-all duration-300",
                    isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                )}
                onClick={() => setIsOpen(false)}
            />

            <aside
                className={clsx(
                    "fixed inset-y-0 right-0 z-[100] shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col h-screen border-l",
                    isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
                    isCollapsed ? "lg:w-[72px]" : "lg:w-[280px]",
                    "w-[280px]"
                )}
                style={{
                    backgroundColor: 'var(--sidebar-bg)',
                    color: 'var(--sidebar-text)',
                    borderColor: 'color-mix(in srgb, var(--sidebar-text), transparent 85%)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                {/* Texture Overlay با افکت بهتر */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 sidebar-texture" />

                {/* گرادینت حاشیه */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

                <div className="relative z-10 flex flex-col h-full">
                    <SidebarHeader
                        isCollapsed={isCollapsed}
                        toggleCollapse={toggleCollapse}
                        siteName={site?.name}
                        siteLogo={site?.logo}
                    />

                    <SidebarProfile
                        isCollapsed={isCollapsed}
                        user={auth.user}
                    />

                    {/* Search Box با طراحی جدید */}
                    {!isCollapsed && (
                        <div className="px-4 mb-3">
                            <div className={clsx(
                                "relative group transition-all duration-200",
                                isFocused && "scale-[1.02]"
                            )}>
                                {/* افکت گلو */}
                                <div className={clsx(
                                    "absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl blur opacity-0 transition-all duration-300",
                                    isFocused && "opacity-30"
                                )} />

                                <div className={clsx(
                                    "relative flex items-center w-full border rounded-xl overflow-hidden transition-all",
                                    isFocused
                                        ? "border-amber-500 shadow-lg shadow-amber-500/20"
                                        : "border-transparent hover:border-amber-500/30"
                                )}
                                style={{
                                    backgroundColor: 'color-mix(in srgb, var(--sidebar-text), transparent 92%)'
                                }}>
                                    <input
                                        type="text"
                                        placeholder="جستجو در منو..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        className="w-full py-2.5 pr-9 pl-8 text-xs bg-transparent outline-none placeholder:opacity-50"
                                        style={{ color: 'var(--sidebar-text)' }}
                                    />

                                    {/* آیکون جستجو */}
                                    <Search
                                        size={14}
                                        className={clsx(
                                            "absolute right-3 transition-all",
                                            isFocused ? "text-amber-500" : "opacity-50"
                                        )}
                                        style={{ color: isFocused ? undefined : 'var(--sidebar-text)' }}
                                    />

                                    {/* دکمه پاک کردن */}
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute left-2 p-1 rounded-full hover:bg-black/10 transition-colors"
                                        >
                                            <X size={12} className="opacity-50 hover:opacity-100" />
                                        </button>
                                    )}

                                    {/* نشان جستجوی سریع */}
                                    {!searchTerm && !isFocused && (
                                        <div className="absolute left-2 opacity-30 text-[8px] flex items-center gap-1">
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* نشان تعداد نتایج جستجو */}
                    {!isCollapsed && searchTerm && (
                        <div className="px-4 mb-2">
                            <div className="flex items-center gap-1 text-[10px] opacity-50">
                                <Sparkles size={10} className="text-amber-500" />
                                <span>
                                    {[...menuGroups.flatMap(g => g.items), ...allAdminItems].filter(item =>
                                        item.name.includes(searchTerm) || item.description?.includes(searchTerm)
                                    ).length} مورد یافت شد
                                </span>
                            </div>
                        </div>
                    )}

                    <SidebarMenu
                        isCollapsed={isCollapsed}
                        setIsOpen={setIsOpen}
                        menuGroups={menuGroups}
                        adminItems={allAdminItems}
                        isAdmin={isAdmin}
                        searchTerm={searchTerm}
                    />

                    <SidebarFooter
                        isCollapsed={isCollapsed}
                        isAdmin={isAdmin}
                    />
                </div>
            </aside>

            {/* Injected Styles */}
            <SidebarStyles />
        </>
    );
}
