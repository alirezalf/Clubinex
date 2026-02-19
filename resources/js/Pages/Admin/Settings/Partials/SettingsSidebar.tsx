import React from 'react';
import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';

interface Tab {
    id: string;
    label: string;
    icon: LucideIcon;
}

interface Props {
    tabs: Tab[];
    activeTab: string;
    onChange: (id: string) => void;
}

export default function SettingsSidebar({ tabs, activeTab, onChange }: Props) {
    return (
        <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={clsx(
                            "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200",
                            activeTab === tab.id 
                            ? "bg-primary-50 text-primary-600 border-r-4 border-primary-600" 
                            : "text-gray-600 hover:bg-gray-50 border-r-4 border-transparent"
                        )}
                    >
                        <tab.icon size={18} className={activeTab === tab.id ? "text-primary-600" : "text-gray-400"} />
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}