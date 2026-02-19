import React from 'react';
import { Layout, Sun, Moon, Palette, Monitor, MenuSquare, X } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    data: any;
    setData: (key: string, value: any) => void;
}

export default function ThemeControls({ data, setData }: Props) {
    
    // منطق تغییر حالت سایدبار (روشن/تیره/رنگی/شیشه‌ای)
    const applySidebarMode = (mode: 'light' | 'dark' | 'brand' | 'glass') => {
        let bg = '#ffffff';
        let text = '#1f2937';

        switch (mode) {
            case 'light':
                bg = '#ffffff';
                text = '#1f2937';
                break;
            case 'dark':
                bg = '#111827';
                text = '#f9fafb';
                break;
            case 'brand':
                bg = data.primary_color as string;
                text = '#ffffff';
                break;
            case 'glass':
                bg = 'rgba(255, 255, 255, 0.6)';
                text = '#1f2937';
                break;
        }
        setData('sidebar_bg', bg);
        setData('sidebar_text', text);
    };

    return (
        <div className="space-y-7">
            {/* استایل‌های مربوط به تکسچرها که در فایل اصلی بود */}
            <style>{`
                .sidebar-texture-dots { background-image: radial-gradient(currentColor 1px, transparent 1px); background-size: 8px 8px; }
                .sidebar-texture-lines { background-image: repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%); background-size: 6px 6px; }
                .sidebar-texture-grid { background-image: linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px); background-size: 10px 10px; }
                .sidebar-texture-hex { background-image: url("data:image/svg+xml,%3Csvg width='12' height='20' viewBox='0 0 24 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40c5.523 0 10-4.477 10-10V10c0-5.523-4.477-10-10-10s-10 4.477-10 10v20c0 5.523 4.477 10 10 10z' fill='currentColor' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E"); background-size: 12px 20px; }
                .sidebar-texture-waves { background: radial-gradient(circle at 100% 50%, transparent 20%, currentColor 21%, currentColor 34%, transparent 35%, transparent), radial-gradient(circle at 0% 50%, transparent 20%, currentColor 21%, currentColor 34%, transparent 35%, transparent) 0 -50px; background-size: 15px 50px; }
                .sidebar-texture-sea { background-image: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80'); background-size: cover; opacity: 0.5; }
                .sidebar-texture-sunset { background-image: url('https://images.unsplash.com/photo-1472120435266-53107fd0c44a?auto=format&fit=crop&w=300&q=80'); background-size: cover; opacity: 0.5; }
                .sidebar-texture-space { background-image: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80'); background-size: cover; opacity: 0.5; }
                .sidebar-texture-forest { background-image: url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=300&q=80'); background-size: cover; opacity: 0.8; }
            `}</style>

            {/* Primary Color & Radius */}
            <div className="space-y-4">
                <div>
                    <label className="mb-2 block text-xs font-bold text-gray-500">
                        رنگ اصلی
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={data.primary_color as string}
                            onChange={(e) => setData('primary_color', e.target.value)}
                            className="h-10 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0 shadow-sm"
                        />
                        <input
                            type="text"
                            value={data.primary_color as string}
                            onChange={(e) => setData('primary_color', e.target.value)}
                            className="flex-1 rounded-lg border-gray-200 font-mono text-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-500">
                            گردی گوشه‌ها
                        </label>
                        <span className="font-mono text-[10px] text-gray-400">
                            {data.radius_size}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="24"
                        step="4"
                        value={parseFloat(data.radius_size as string) * 16 || 12}
                        onChange={(e) => setData('radius_size', `${parseInt(e.target.value) / 16}rem`)}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary-600"
                    />
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Sidebar Settings */}
            <div>
                <label className="mb-3 block flex items-center gap-1 text-xs font-bold text-gray-500">
                    <Layout size={14} /> تنظیمات منو (Sidebar)
                </label>

                <div className="mb-4 grid grid-cols-4 gap-2">
                    {[
                        { id: 'light', icon: Sun, label: 'روشن' },
                        { id: 'dark', icon: Moon, label: 'تیره' },
                        { id: 'brand', icon: Palette, label: 'رنگی' },
                        { id: 'glass', icon: Monitor, label: 'شیشه‌ای' },
                    ].map((m) => (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => applySidebarMode(m.id as any)}
                            className={clsx(
                                'flex flex-col items-center justify-center gap-1 rounded-lg border py-2 text-[10px] font-medium transition',
                                'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white',
                            )}
                        >
                            <m.icon size={14} />
                            {m.label}
                        </button>
                    ))}
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1 block text-[10px] text-gray-400">
                            رنگ پس‌زمینه
                        </label>
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-1">
                            <input
                                type="color"
                                value={data.sidebar_bg as string}
                                onChange={(e) => setData('sidebar_bg', e.target.value)}
                                className="h-6 w-6 cursor-pointer rounded border-none p-0"
                            />
                            <span className="truncate font-mono text-[10px] text-gray-500">
                                {data.sidebar_bg}
                            </span>
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-[10px] text-gray-400">
                            رنگ متن
                        </label>
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-1">
                            <input
                                type="color"
                                value={data.sidebar_text as string}
                                onChange={(e) => setData('sidebar_text', e.target.value)}
                                className="h-6 w-6 cursor-pointer rounded border-none p-0"
                            />
                            <span className="truncate font-mono text-[10px] text-gray-500">
                                {data.sidebar_text}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mb-4 flex items-center justify-between rounded-xl border border-gray-200 p-3">
                    <div className="flex items-center gap-2">
                        <MenuSquare size={16} className="text-gray-400" />
                        <span className="text-xs font-medium text-gray-700">
                            منو پیش‌فرض بسته باشد
                        </span>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                        <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={data.sidebar_collapsed as boolean}
                            onChange={(e) => setData('sidebar_collapsed', e.target.checked)}
                        />
                        <div className="peer h-5 w-9 rounded-full bg-gray-200 peer-checked:bg-primary-600 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </label>
                </div>

                <label className="mb-2 block text-[10px] font-bold text-gray-400">
                    بافت پس‌زمینه
                </label>
                <div className="grid grid-cols-5 gap-2">
                    {[
                        'none', 'dots', 'lines', 'grid', 'hex', 
                        'waves', 'sea', 'sunset', 'space', 'forest',
                    ].map((tex) => (
                        <button
                            key={tex}
                            type="button"
                            onClick={() => setData('sidebar_texture', tex)}
                            className={clsx(
                                'relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border transition-all',
                                data.sidebar_texture === tex
                                    ? 'border-primary-500 ring-1 ring-primary-500'
                                    : 'border-gray-200 hover:border-gray-300',
                            )}
                            title={tex}
                            style={{
                                backgroundColor: data.sidebar_bg as string,
                                color: data.sidebar_text as string,
                            }}
                        >
                            <div className={`h-full w-full sidebar-texture-${tex} opacity-50`}></div>
                            {tex === 'none' && (
                                <X size={12} className="absolute opacity-30 text-gray-500" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Header Settings */}
            <div>
                <label className="mb-2 block flex items-center gap-1 text-xs font-bold text-gray-500">
                    <Layout size={14} className="rotate-180" /> رنگ هدر (Header)
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 p-2">
                    <input
                        type="color"
                        value={
                            data.header_bg && (data.header_bg as string).startsWith('#')
                                ? (data.header_bg as string)
                                : '#ffffff'
                        }
                        onChange={(e) => setData('header_bg', e.target.value)}
                        className="h-8 w-8 cursor-pointer rounded-lg border-none p-0"
                    />
                    <input
                        type="text"
                        value={data.header_bg as string}
                        onChange={(e) => setData('header_bg', e.target.value)}
                        className="flex-1 border-none bg-transparent font-mono text-xs text-gray-600 focus:ring-0"
                        placeholder="#HEX or rgba(...)"
                    />
                </div>
                <p className="mt-1.5 text-[9px] leading-relaxed text-gray-400">
                    نکته: برای هدر شیشه‌ای از فرمت{' '}
                    <code>rgba(255,255,255,0.8)</code> استفاده کنید.
                </p>
            </div>
        </div>
    );
}