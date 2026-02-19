import { usePage } from '@inertiajs/react';
import clsx from 'clsx';
import { Search } from 'lucide-react';
import React, { useState } from 'react';
import type { PageProps } from '@/types';

// Sub-components & Config
import SidebarHeader from './SidebarComponents/SidebarHeader';
import SidebarProfile from './SidebarComponents/SidebarProfile';
import SidebarMenu from './SidebarComponents/SidebarMenu';
import SidebarFooter from './SidebarComponents/SidebarFooter';
import SidebarStyles from './SidebarComponents/SidebarStyles'; // Import the styles component
import { getMenuItems, getAdminItems, getMenuGroups } from './SidebarComponents/SidebarConfig';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

export default function Sidebar({ isOpen, setIsOpen, isCollapsed, toggleCollapse }: SidebarProps) {
    // @ts-ignore
    const { auth, site, badges } = usePage<PageProps & { site: any, badges: { user: number, admin: number } }>().props;
    const [searchTerm, setSearchTerm] = useState('');

    const isAdmin = auth.user.roles.includes('super-admin') || auth.user.roles.includes('admin');

    // Pass badges to menu config
    const allMenuItems = getMenuItems(badges?.user || 0);
    const allAdminItems = getAdminItems(badges?.admin || 0);
    const menuGroups = getMenuGroups(allMenuItems);

    return (
        <>
            {/* Mobile Overlay - High Z-Index ensuring click capture */}
            <div 
                className={clsx(
                    "fixed inset-0 bg-black/60 z-[99] lg:hidden backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                )}
                onClick={() => setIsOpen(false)}
            />

            <aside 
                className={clsx(
                    "fixed inset-y-0 right-0 z-[100] shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] flex flex-col h-screen border-l",
                    isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
                    isCollapsed ? "lg:w-[72px]" : "lg:w-[260px]",
                    "w-[260px]" // Mobile width
                )}
                style={{
                    backgroundColor: 'var(--sidebar-bg)',
                    color: 'var(--sidebar-text)',
                    borderColor: 'rgba(0,0,0,0.05)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                {/* Texture Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.07] z-0 sidebar-texture"></div>

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

                    {/* Search Box */}
                    {!isCollapsed && (
                        <div className="px-4 mb-2">
                            <div className="relative group">
                                <input 
                                    type="text" 
                                    placeholder="جستجو..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full border rounded-xl py-2 pr-9 pl-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all placeholder:opacity-50 shadow-sm"
                                    style={{ 
                                        backgroundColor: 'color-mix(in srgb, var(--sidebar-text), transparent 92%)', 
                                        color: 'var(--sidebar-text)',
                                        borderColor: 'color-mix(in srgb, var(--sidebar-text), transparent 85%)'
                                    }}
                                />
                                <Search size={14} className="absolute right-3 top-2.5 opacity-60 group-focus-within:text-primary-500 transition-colors" />
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