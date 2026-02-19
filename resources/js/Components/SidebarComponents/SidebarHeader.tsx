import { Hexagon, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
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
        <div className={clsx(
            "h-16 flex items-center shrink-0 transition-all duration-300 relative border-b border-black/5",
            isCollapsed ? "justify-center" : "justify-between px-4"
        )}>
            {/* Logo Area */}
            <div className={clsx("flex items-center gap-2.5 overflow-hidden transition-all duration-300", 
                isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            )}>
                <div className="w-8 h-8 bg-gradient-to-tr from-primary-600 to-primary-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary-500/30 shrink-0">
                    {siteLogo ? (
                        <img src={siteLogo} alt="Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                        <Hexagon size={18} fill="currentColor" />
                    )}
                </div>
                <div className="flex flex-col whitespace-nowrap">
                    <span className="font-extrabold text-[15px] tracking-tight text-inherit">{siteName}</span>
                    <span className="text-[9px] font-bold opacity-60 bg-current px-1.5 py-px rounded w-fit text-white" style={{backgroundColor: 'rgba(0,0,0,0.2)'}}>PRO</span>
                </div>
            </div>

            {/* Toggle Button */}
            <button 
                onClick={toggleCollapse} 
                className={clsx(
                    "hidden lg:flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-black/5 text-inherit",
                    isCollapsed ? "w-10 h-10" : "w-8 h-8 opacity-60 hover:opacity-100"
                )}
                title={isCollapsed ? "باز کردن منو" : "بستن منو"}
            >
                {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={18} />}
            </button>
        </div>
    );
}