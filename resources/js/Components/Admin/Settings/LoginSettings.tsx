import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Save, Layout, Type, Palette, Image as ImageIcon, Monitor, Smartphone, RefreshCw, Check } from 'lucide-react';
import FormInput from '@/Components/Form/FormInput';
import FormFile from '@/Components/Form/FormFile';
import clsx from 'clsx';

interface LoginSettingsProps {
    data: any;
    setData: (key: string, value: any) => void;
}

export default function LoginSettings({ data, setData }: LoginSettingsProps) {
    const [activeSection, setActiveSection] = useState<'theme' | 'layout' | 'content' | 'style'>('theme');

    const themes = [
        { id: 'classic', name: 'کلاسیک (پیش‌فرض)', description: 'طراحی ساده و استاندارد با قابلیت شخصی‌سازی بالا', icon: Layout },
        { id: 'modern', name: 'مدرن (انیمیشنی)', description: 'طراحی خلاقانه با انیمیشن‌های جذاب و پویا', icon: Monitor },
        { id: 'minimal', name: 'مینیمال (ساده)', description: 'طراحی بسیار ساده و تمیز با تمرکز بر محتوا', icon: Type },
    ];

    const defaultSettings: any = {
        classic: {
            login_layout_reversed: false,
            login_left_bg_type: 'random',
            login_right_bg_type: 'color',
            login_right_color: '#ffffff',
            login_card_bg: '#ffffff',
            login_btn_bg: '#0284c7',
            login_btn_text: '#ffffff',
            login_title_color: '#111827',
            login_subtitle_color: '#6b7280',
            login_copyright_color: '#9ca3af',
            login_tab_active_bg: '#0284c7',
            login_tab_active_text: '#ffffff',
            login_tab_inactive_text: '#6b7280',
            login_tab_container_bg: '#f9fafb',
            login_card_glass: false,
        },
        modern: {
            login_layout_reversed: false,
            login_left_bg_type: 'slider',
            login_right_bg_type: 'color',
            login_right_color: '#111827',
            login_card_bg: 'rgba(255, 255, 255, 0.05)',
            login_btn_bg: '#0284c7',
            login_btn_text: '#ffffff',
            login_title_color: '#ffffff',
            login_subtitle_color: '#9ca3af',
            login_copyright_color: '#6b7280',
            login_tab_active_bg: '#0284c7',
            login_tab_active_text: '#ffffff',
            login_tab_inactive_text: '#9ca3af',
            login_tab_container_bg: 'rgba(31, 41, 55, 0.5)',
            login_card_glass: true,
        },
        minimal: {
            login_layout_reversed: false,
            login_left_bg_type: 'color',
            login_left_color: '#f8fafc',
            login_right_bg_type: 'color',
            login_right_color: '#ffffff',
            login_card_bg: 'rgba(255, 255, 255, 0.7)',
            login_btn_bg: '#000000',
            login_btn_text: '#ffffff',
            login_title_color: '#111827',
            login_subtitle_color: '#6b7280',
            login_copyright_color: '#9ca3af',
            login_tab_active_bg: '#000000',
            login_tab_active_text: '#ffffff',
            login_tab_inactive_text: '#6b7280',
            login_tab_container_bg: 'transparent',
            login_card_glass: true,
        }
    };

    const handleResetDefaults = (themeId: string) => {
        if (confirm('آیا مطمئن هستید که می‌خواهید تنظیمات این قالب را به حالت پیش‌فرض برگردانید؟')) {
            const defaults = defaultSettings[themeId];
            if (defaults) {
                Object.keys(defaults).forEach(key => {
                    setData(key, defaults[key]);
                });
                // Also set the theme itself
                setData('login_theme', themeId);
            }
        }
    };

    const backgroundTypes = [
        { id: 'random', label: 'تصویر تصادفی' },
        { id: 'slider', label: 'اسلایدر (مدیریت اسلایدر)' },
        { id: 'image', label: 'تصویر ثابت' },
        { id: 'color', label: 'رنگ ثابت' },
        { id: 'gradient', label: 'گرادینت' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-800">تنظیمات صفحه ورود</h3>
                        <button
                            type="button"
                            onClick={() => {
                                if (confirm('آیا مطمئن هستید که می‌خواهید تنظیمات صفحه ورود را به حالت پیش‌فرض برگردانید؟')) {
                                    router.post(route('admin.settings.reset_defaults'), { group: 'login' });
                                }
                            }}
                            className="text-xs text-red-500 hover:text-red-700 underline"
                        >
                            بازنشانی به پیش‌فرض
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">شخصی‌سازی ظاهر و عملکرد صفحه ورود کاربران</p>
                </div>
                <div className="flex gap-2">
                    {['theme', 'layout', 'content', 'style'].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveSection(tab as any)}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                activeSection === tab
                                    ? "bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-200"
                                    : "text-gray-500 hover:bg-gray-50"
                            )}
                        >
                            {tab === 'theme' && 'انتخاب قالب'}
                            {tab === 'layout' && 'چیدمان و پس‌زمینه'}
                            {tab === 'content' && 'محتوا و متن‌ها'}
                            {tab === 'style' && 'رنگ‌بندی'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Theme Selection */}
            {activeSection === 'theme' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {themes.map((theme) => (
                        <div
                            key={theme.id}
                            onClick={() => setData('login_theme', theme.id)}
                            className={clsx(
                                "relative cursor-pointer group rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg",
                                data.login_theme === theme.id
                                    ? "border-primary-500 bg-primary-50/30"
                                    : "border-gray-100 bg-white hover:border-primary-200"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className={clsx(
                                    "p-3 rounded-xl transition-colors",
                                    data.login_theme === theme.id ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-500 group-hover:bg-primary-50 group-hover:text-primary-500"
                                )}>
                                    <theme.icon size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg">{theme.name}</h4>
                                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{theme.description}</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleResetDefaults(theme.id);
                                }}
                                className="absolute top-4 left-12 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 p-1.5 rounded-lg transition z-20"
                                title="بازنشانی تنظیمات پیش‌فرض"
                            >
                                <RefreshCw size={14} />
                            </button>

                            {data.login_theme === theme.id && (
                                <div className="absolute top-4 left-4 bg-primary-500 text-white p-1 rounded-full shadow-md animate-in zoom-in z-10">
                                    <Check size={16} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Layout & Backgrounds */}
            {activeSection === 'layout' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* General Layout */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            <Layout size={18} className="text-primary-500" />
                            چیدمان کلی
                        </h4>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.login_layout_reversed === '1' || data.login_layout_reversed === true}
                                    onChange={(e) => setData('login_layout_reversed', e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium text-gray-700">جابجایی فرم ورود و تصویر (چپ/راست)</span>
                            </label>
                            <p className="text-xs text-gray-500 mt-2 mr-8">
                                در حالت پیش‌فرض فرم سمت راست و تصویر سمت چپ قرار دارد. با فعال کردن این گزینه جای آن‌ها عوض می‌شود.
                            </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <label className="block text-sm font-medium text-gray-700 mb-2">نوع پس‌زمینه سمت چپ (تصویر اصلی)</label>
                            <div className="flex gap-2">
                                {backgroundTypes.map(type => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setData('login_left_bg_type', type.id)}
                                        className={clsx(
                                            "flex-1 py-2 text-xs font-medium rounded-lg border transition-all",
                                            data.login_left_bg_type === type.id
                                                ? "bg-white border-primary-500 text-primary-700 shadow-sm"
                                                : "bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200"
                                        )}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-4 space-y-3">
                                {data.login_left_bg_type === 'image' && (
                                    <FormFile
                                        label="آپلود تصویر ثابت"
                                        onChange={(file) => setData('login_left_image', file)}
                                        accept="image/*"
                                        previewUrl={typeof data.login_left_image === 'string' ? data.login_left_image : undefined}
                                    />
                                )}
                                {data.login_left_bg_type === 'color' && (
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={data.login_left_color || '#ffffff'}
                                            onChange={(e) => setData('login_left_color', e.target.value)}
                                            className="h-10 w-20 rounded cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-600">{data.login_left_color}</span>
                                    </div>
                                )}
                                {data.login_left_bg_type === 'gradient' && (
                                    <FormInput
                                        name="login_left_gradient"
                                        label="کد CSS گرادینت"
                                        value={data.login_left_gradient}
                                        onChange={(e) => setData('login_left_gradient', e.target.value)}
                                        placeholder="linear-gradient(to right, #...)"
                                        dir="ltr"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side Background */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            <Palette size={18} className="text-primary-500" />
                            پس‌زمینه بخش فرم
                        </h4>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <label className="block text-sm font-medium text-gray-700 mb-2">نوع پس‌زمینه</label>
                            <div className="flex gap-2">
                                {backgroundTypes.filter(t => t.id !== 'random').map(type => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setData('login_right_bg_type', type.id)}
                                        className={clsx(
                                            "flex-1 py-2 text-xs font-medium rounded-lg border transition-all",
                                            data.login_right_bg_type === type.id
                                                ? "bg-white border-primary-500 text-primary-700 shadow-sm"
                                                : "bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200"
                                        )}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-4 space-y-3">
                                {data.login_right_bg_type === 'image' && (
                                    <FormFile
                                        label="آپلود تصویر پس‌زمینه فرم"
                                        onChange={(file) => setData('login_right_image', file)}
                                        accept="image/*"
                                        previewUrl={typeof data.login_right_image === 'string' ? data.login_right_image : undefined}
                                    />
                                )}
                                {data.login_right_bg_type === 'color' && (
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={data.login_right_color || '#f9fafb'}
                                            onChange={(e) => setData('login_right_color', e.target.value)}
                                            className="h-10 w-20 rounded cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-600">{data.login_right_color}</span>
                                    </div>
                                )}
                                {data.login_right_bg_type === 'gradient' && (
                                    <FormInput
                                        name="login_right_gradient"
                                        label="کد CSS گرادینت"
                                        value={data.login_right_gradient}
                                        onChange={(e) => setData('login_right_gradient', e.target.value)}
                                        placeholder="linear-gradient(to bottom, #...)"
                                        dir="ltr"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content & Texts */}
            {activeSection === 'content' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-800 border-b pb-2">متن‌های اصلی</h4>
                        <FormInput
                            name="login_title"
                            label="عنوان خوش‌آمدگویی (خط اول)"
                            value={data.login_title}
                            onChange={(e) => setData('login_title', e.target.value)}
                            placeholder="خوش آمدید"
                        />
                        <FormInput
                            name="login_subtitle"
                            label="زیرعنوان (خط دوم)"
                            value={data.login_subtitle}
                            onChange={(e) => setData('login_subtitle', e.target.value)}
                            placeholder="به باشگاه مشتریان وارد شوید"
                        />
                        <FormInput
                            name="login_copyright"
                            label="متن کپی‌رایت"
                            value={data.login_copyright}
                            onChange={(e) => setData('login_copyright', e.target.value)}
                            placeholder="© 2024 تمامی حقوق محفوظ است."
                        />
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-800 border-b pb-2">شعار تبلیغاتی (سمت تصویر)</h4>
                        <FormInput
                            name="login_slogan_title"
                            label="عنوان شعار"
                            value={data.login_slogan_title}
                            onChange={(e) => setData('login_slogan_title', e.target.value)}
                            placeholder="تجربه ای متفاوت از وفاداری"
                        />
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">متن توضیحات شعار</label>
                            <textarea
                                value={data.login_slogan_text}
                                onChange={(e) => setData('login_slogan_text', e.target.value)}
                                className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 min-h-[100px]"
                                placeholder="با پیوستن به باشگاه مشتریان، از تخفیف‌ها و جوایز ویژه بهره‌مند شوید."
                            />
                        </div>
                        <FormFile
                            label="آیکون/لوگو صفحه ورود"
                            onChange={(file) => setData('login_logo', file)}
                            accept="image/*"
                            previewUrl={typeof data.login_logo === 'string' ? data.login_logo : undefined}
                        />
                    </div>
                </div>
            )}

            {/* Colors & Styles */}
            {activeSection === 'style' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-800 text-sm">رنگ‌بندی متون</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">عنوان اصلی</label>
                                <input type="color" value={data.login_title_color || '#111827'} onChange={(e) => setData('login_title_color', e.target.value)} className="w-full h-8 rounded cursor-pointer" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">زیرعنوان</label>
                                <input type="color" value={data.login_subtitle_color || '#6b7280'} onChange={(e) => setData('login_subtitle_color', e.target.value)} className="w-full h-8 rounded cursor-pointer" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">شعار تبلیغاتی</label>
                                <input type="color" value={data.login_slogan_color || '#ffffff'} onChange={(e) => setData('login_slogan_color', e.target.value)} className="w-full h-8 rounded cursor-pointer" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">کپی‌رایت</label>
                                <input type="color" value={data.login_copyright_color || '#9ca3af'} onChange={(e) => setData('login_copyright_color', e.target.value)} className="w-full h-8 rounded cursor-pointer" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-800 text-sm">دکمه‌ها و کارت</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">پس‌زمینه دکمه</label>
                                <input type="color" value={data.login_btn_bg || '#0284c7'} onChange={(e) => setData('login_btn_bg', e.target.value)} className="w-full h-8 rounded cursor-pointer" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">متن دکمه</label>
                                <input type="color" value={data.login_btn_text || '#ffffff'} onChange={(e) => setData('login_btn_text', e.target.value)} className="w-full h-8 rounded cursor-pointer" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">پس‌زمینه کارت فرم</label>
                                <input type="color" value={data.login_card_bg || '#ffffff'} onChange={(e) => setData('login_card_bg', e.target.value)} className="w-full h-8 rounded cursor-pointer" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-800 text-sm">تب‌های انتخاب روش ورود</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">متن تب فعال</label>
                                <input type="color" value={data.login_tab_active_text || '#ffffff'} onChange={(e) => setData('login_tab_active_text', e.target.value)} className="w-full h-8 rounded cursor-pointer" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">پس‌زمینه تب فعال</label>
                                <input type="color" value={data.login_tab_active_bg || '#0284c7'} onChange={(e) => setData('login_tab_active_bg', e.target.value)} className="w-full h-8 rounded cursor-pointer" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">متن تب غیرفعال</label>
                                <input type="color" value={data.login_tab_inactive_text || '#6b7280'} onChange={(e) => setData('login_tab_inactive_text', e.target.value)} className="w-full h-8 rounded cursor-pointer" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">پس‌زمینه کانتینر تب‌ها</label>
                                <input type="color" value={data.login_tab_container_bg || '#1f2937'} onChange={(e) => setData('login_tab_container_bg', e.target.value)} className="w-full h-8 rounded cursor-pointer" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-800 text-sm">افکت‌ها</h4>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.login_card_glass === '1' || data.login_card_glass === true}
                                    onChange={(e) => setData('login_card_glass', e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium text-gray-700">افکت شیشه‌ای (Glassmorphism) برای کارت</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
