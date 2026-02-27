import { Hexagon, PanelLeftClose, PanelLeftOpen, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import React from 'react';

interface Props {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    siteName?: string;
    siteLogo?: string | null;
}

export default function SidebarHeader({ isCollapsed, toggleCollapse, siteName = 'Clubinex', siteLogo }: Props) {
    return (
        <div
            className={clsx(
                "h-16 flex items-center shrink-0 transition-all duration-300 relative border-b",
                isCollapsed ? "justify-center" : "justify-between px-4"
            )}
            style={{ borderColor: 'color-mix(in srgb, var(--sidebar-text), transparent 85%)' }}
        >
            {/* Logo Area */}
            <div className={clsx(
                "flex items-center gap-2.5 overflow-hidden transition-all duration-300 group",
                isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            )}>
                <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30 shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                        {siteLogo ? (
                            <img src={siteLogo} alt="Logo" className="w-full h-full object-contain p-1.5" />
                        ) : (
                            <Hexagon size={22} fill="currentColor" />
                        )}
                    </div>
                    {/* نشان ویژه */}
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center animate-pulse">
                        <Sparkles size={8} className="text-white" />
                    </div>
                </div>

                <div className="flex flex-col whitespace-nowrap">
                    <span className="font-extrabold text-[16px] tracking-tight" style={{ color: 'var(--sidebar-text)' }}>
                        {siteName}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                        <span
                            className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                        >
                            PRO
                        </span>
                        <span className="text-[8px] opacity-40" style={{ color: 'var(--sidebar-text)' }}>v2.0</span>
                    </div>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleCollapse}
                className={clsx(
                    "hidden lg:flex items-center justify-center rounded-xl transition-all duration-200 relative group",
                    isCollapsed
                        ? "w-10 h-10 hover:bg-amber-500/10"
                        : "w-8 h-8 opacity-60 hover:opacity-100 hover:bg-amber-500/10"
                )}
                style={{ color: 'var(--sidebar-text)' }}
                title={isCollapsed ? "باز کردن منو" : "بستن منو"}
            >
                {/* افکت گلو در هاور */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative">
                    {isCollapsed ? (
                        <PanelLeftOpen size={20} className="group-hover:scale-110 transition-transform" />
                    ) : (
                        <PanelLeftClose size={18} className="group-hover:scale-110 transition-transform" />
                    )}
                </div>
            </button>
        </div>
    );
}
