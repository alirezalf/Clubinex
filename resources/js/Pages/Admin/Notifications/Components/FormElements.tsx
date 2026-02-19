import React from 'react';
import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';

interface TargetTypeBtnProps {
    active: boolean;
    onClick: () => void;
    icon: LucideIcon;
    label: string;
}

export const TargetTypeBtn = ({ active, onClick, icon: Icon, label }: TargetTypeBtnProps) => (
    <button
        type="button"
        onClick={onClick}
        className={clsx(
            "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
            active 
                ? "bg-primary-50 border-primary-500 text-primary-700 shadow-sm ring-2 ring-primary-500/10" 
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
        )}
    >
        <Icon size={24} />
        <span className="text-xs font-bold">{label}</span>
    </button>
);

interface ChannelCheckboxProps {
    label: string;
    icon: LucideIcon;
    checked: boolean;
    onChange: () => void;
    color: 'blue' | 'green' | 'purple';
}

export const ChannelCheckbox = ({ label, icon: Icon, checked, onChange, color }: ChannelCheckboxProps) => {
    const colors = {
        blue: "text-blue-500 bg-blue-50",
        green: "text-green-500 bg-green-50",
        purple: "text-purple-500 bg-purple-50"
    };
    return (
        <label className={clsx(
            "flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition min-w-[140px] select-none",
            checked ? "border-primary-500 bg-primary-50/30" : "border-gray-200"
        )}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="rounded text-primary-600 focus:ring-primary-500 w-5 h-5 border-gray-300"
            />
            <div className="flex items-center gap-2">
                <div className={clsx("p-1.5 rounded-lg", colors[color])}>
                    <Icon size={16} />
                </div>
                <span className="text-xs font-bold text-gray-700">{label}</span>
            </div>
        </label>
    );
};