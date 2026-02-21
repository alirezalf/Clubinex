import { useForm, router } from '@inertiajs/react';
import clsx from 'clsx';
import { X, Save, RotateCcw, Palette } from 'lucide-react';
import React, { useEffect } from 'react';
import { generateColorShades, getContrastColor } from '@/Utils/ThemeUtils';
import ThemePresets from './Theme/ThemePresets';
import ThemeControls from './Theme/ThemeControls';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentSettings: any;
}

export default function ThemeSettingsPanel({
    isOpen,
    onClose,
    currentSettings,
}: Props) {

    // اصلاح کلیدی: این پنل همیشه به روت تنظیمات "کاربر" درخواست می‌فرستد.
    // ادمین اگر بخواهد تنظیمات کل سیستم را عوض کند باید به "تنظیمات سیستم" برود.
    // این کار جلوی تداخل تم ادمین و تم سراسری را می‌گیرد.
    const saveRoute = 'user.theme.update';

    const { data, setData, post, processing, reset } = useForm({
        primary_color: currentSettings?.primary_color || '#0284c7',
        header_bg: currentSettings?.header_bg || 'rgba(255,255,255,0.8)',
        sidebar_bg: currentSettings?.sidebar_bg || '#ffffff',
        sidebar_text: currentSettings?.sidebar_text || '#1f2937',
        sidebar_texture: currentSettings?.sidebar_texture || 'none',
        radius_size: currentSettings?.radius_size || '0.75rem',
        card_style: currentSettings?.card_style || 'default',
        card_shadow: currentSettings?.card_shadow || 'sm',
        card_opacity: currentSettings?.card_opacity || '1',
        sidebar_collapsed:
            currentSettings?.sidebar_collapsed === '1' ||
            currentSettings?.sidebar_collapsed === true ||
            currentSettings?.sidebar_collapsed === 1,
    });

    // Update form when props change (e.g., coming from server)
    useEffect(() => {
        if (currentSettings) {
            setData((prev) => ({
                ...prev,
                primary_color: currentSettings.primary_color || prev.primary_color,
                header_bg: currentSettings.header_bg || prev.header_bg,
                sidebar_bg: currentSettings.sidebar_bg || prev.sidebar_bg,
                sidebar_text: currentSettings.sidebar_text || prev.sidebar_text,
                sidebar_texture: currentSettings.sidebar_texture || prev.sidebar_texture,
                radius_size: currentSettings.radius_size || prev.radius_size,
                card_style: currentSettings.card_style || prev.card_style,
                card_shadow: currentSettings.card_shadow || prev.card_shadow,
                card_opacity: currentSettings.card_opacity || prev.card_opacity,
                sidebar_collapsed:
                    currentSettings.sidebar_collapsed === '1' ||
                    currentSettings.sidebar_collapsed === true ||
                    currentSettings.sidebar_collapsed === 1
            }));
        }
    }, [currentSettings, isOpen]);

    // Apply styles in real-time (Optimistic UI)
    useEffect(() => {
        const root = document.documentElement;

        // Colors
        const hex = data.primary_color as string;
        const shades = generateColorShades(hex);
        Object.entries(shades).forEach(([key, value]) => {
            root.style.setProperty(key, value as string);
        });

        // Contrast calculation
        const headerText = getContrastColor(
            data.header_bg as string,
            '#ffffff',
            '#1f2937',
        );
        const headerTextMuted = getContrastColor(
            data.header_bg as string,
            'rgba(255,255,255,0.7)',
            '#6b7280',
        );
        const headerHover = getContrastColor(
            data.header_bg as string,
            'rgba(255,255,255,0.1)',
            'rgba(0,0,0,0.05)',
        );

        // Vars
        root.style.setProperty('--sidebar-bg', data.sidebar_bg as string);
        root.style.setProperty('--sidebar-text', data.sidebar_text as string);
        root.style.setProperty(
            '--sidebar-texture',
            data.sidebar_texture as string,
        );

        root.style.setProperty('--header-bg', data.header_bg as string);
        root.style.setProperty('--header-text', headerText);
        root.style.setProperty('--header-text-muted', headerTextMuted);
        root.style.setProperty('--header-hover', headerHover);

        root.style.setProperty('--radius-xl', data.radius_size as string);
        root.style.setProperty('--radius-2xl', `calc(${data.radius_size} + 0.25rem)`);

        // Apply Card Style
        document.body.setAttribute('data-card-style', data.card_style as string);
        document.body.setAttribute('data-card-shadow', data.card_shadow as string);
        root.style.setProperty('--card-opacity', data.card_opacity as string);

    }, [data]);

    const saveSettings = () => {
        post(route(saveRoute), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                // Optional: Close on save
                // onClose();
            },
        });
    };

    const resetToDefault = () => {
        const defaults = {
            primary_color: '#0284c7',
            header_bg: 'rgba(255,255,255,0.8)',
            sidebar_bg: '#ffffff',
            sidebar_text: '#1f2937',
            sidebar_texture: 'none',
            radius_size: '0.75rem',
            card_style: 'default',
            card_shadow: 'sm',
            card_opacity: '1',
            sidebar_collapsed: false,
        };
        setData(defaults);

        // درخواست مستقیم برای ریست کردن تنظیمات در دیتابیس
        router.post(route(saveRoute), defaults, {
            preserveScroll: true,
            preserveState: true
        });
    };

    // هندلر برای انتخاب پریست
    const handlePresetSelect = (preset: any) => {
        setData((prev) => ({
            ...prev,
            primary_color: preset.primary,
            sidebar_bg: preset.sidebar,
            sidebar_text: preset.text,
            header_bg: preset.header,
            sidebar_texture: preset.texture,
        }));
    };

    // Wrapper for setData to pass to child component
    const handleControlChange = (key: string, value: any) => {
        setData(key as any, value);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={clsx(
                    'fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm transition-opacity duration-300',
                    isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
                onClick={onClose}
            />

            {/* Side Panel (Left Side) */}
            <div
                className={clsx(
                    'fixed top-0 bottom-0 left-0 z-[70] flex w-[320px] flex-col border-r border-gray-100 bg-white shadow-2xl transition-transform duration-300 ease-out',
                    isOpen ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 p-5 backdrop-blur-sm">
                    <h3 className="flex items-center gap-2 font-bold text-gray-800">
                        <Palette size={20} className="text-primary-600" />
                        شخصی‌سازی ظاهر
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-transparent p-1.5 text-gray-400 shadow-sm transition hover:border-gray-100 hover:bg-white hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="scrollbar-thin flex-1 space-y-7 overflow-y-auto p-5">

                    <ThemePresets
                        currentPrimary={data.primary_color as string}
                        currentSidebar={data.sidebar_bg as string}
                        onSelect={handlePresetSelect}
                    />

                    <hr className="border-gray-100" />

                    <ThemeControls
                        data={data}
                        setData={handleControlChange}
                    />

                </div>

                {/* Footer */}
                <div className="space-y-3 border-t border-gray-100 bg-gray-50 p-5">
                    <button
                        onClick={saveSettings}
                        disabled={processing}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition hover:bg-primary-700"
                    >
                        {processing ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        ) : (
                            <Save size={16} />
                        )}
                        ذخیره تم شخصی
                    </button>

                    <button
                        onClick={resetToDefault}
                        className="flex w-full items-center justify-center gap-1 rounded-xl py-2 text-xs text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                    >
                        <RotateCcw size={12} />
                        بازنشانی به پیش‌فرض
                    </button>
                </div>
            </div>
        </>
    );
}
