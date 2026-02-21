import React from 'react';
import { Zap } from 'lucide-react';

// آرایه دقیقاً همان آرایه فایل اصلی است
export const THEME_PRESETS = [
    {
        name: 'پیش‌فرض',
        primary: '#0284c7',
        sidebar: '#ffffff',
        header: 'rgba(255,255,255,0.8)',
        text: '#1f2937',
        texture: 'none',
    },
    {
        name: 'اقیانوسی',
        primary: '#0891b2',
        sidebar: '#f0f9ff',
        header: '#ffffff',
        text: '#164e63',
        texture: 'sea',
    },
    {
        name: 'شبانه',
        primary: '#6366f1',
        sidebar: '#111827',
        header: '#1f2937',
        text: '#f3f4f6',
        texture: 'none',
    },
    {
        name: 'سازمانی',
        primary: '#059669',
        sidebar: '#ffffff',
        header: '#f0fdf4',
        text: '#064e3b',
        texture: 'grid',
    },
    {
        name: 'لوکس',
        primary: '#d97706',
        sidebar: '#1c1917',
        header: '#292524',
        text: '#fef3c7',
        texture: 'hex',
    },
    {
        name: 'آتشین',
        primary: '#e11d48',
        sidebar: '#fff1f2',
        header: '#ffffff',
        text: '#881337',
        texture: 'sunset',
    },
    {
        name: 'رویایی',
        primary: '#8b5cf6',
        sidebar: '#faf5ff',
        header: '#ffffff',
        text: '#581c87',
        texture: 'lines',
    },
    {
        name: 'طبیعت',
        primary: '#15803d',
        sidebar: '#f0fdf4',
        header: '#ffffff',
        text: '#14532d',
        texture: 'forest',
    },
];

interface Props {
    currentPrimary: string;
    currentSidebar: string;
    onSelect: (preset: any) => void;
}

export default function ThemePresets({ currentPrimary, currentSidebar, onSelect }: Props) {
    return (
        <div>
            <label className="mb-3 flex items-center gap-1 text-xs font-bold text-gray-500">
                <Zap size={14} className="text-amber-500" /> تم‌های آماده
            </label>
            <div className="grid grid-cols-4 gap-2">
                {THEME_PRESETS.map((p) => (
                    <button
                        key={p.name}
                        onClick={() => onSelect(p)}
                        className="group relative flex aspect-square flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border transition-all hover:scale-105 hover:shadow-md"
                        style={{ borderColor: 'rgba(0,0,0,0.05)' }}
                        title={p.name}
                        type="button"
                    >
                        <div
                            className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-30"
                            style={{ backgroundColor: p.primary }}
                        ></div>
                        <div
                            className="h-4 w-4 rounded-full shadow-sm"
                            style={{ backgroundColor: p.primary }}
                        ></div>
                        <span className="w-full truncate px-1 text-center text-[9px] font-medium text-gray-600">
                            {p.name}
                        </span>
                        {currentPrimary === p.primary &&
                            currentSidebar === p.sidebar && (
                                <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-green-500"></div>
                            )}
                    </button>
                ))}
            </div>
        </div>
    );
}
