import React, { useEffect, useState, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { Save, ChevronDown, Check } from 'lucide-react';
import { ColorPicker } from '@/Components/Admin/Settings/SharedInputs';

interface Props {
    slider?: any;
    availablePages: { system: string[], pages: string[] };
    isEditing: boolean;
    onSettingsChange?: (newSettings: any) => void;
}

export default function SliderSettingsForm({ slider, availablePages, isEditing, onSettingsChange }: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        title: slider?.title || '',
        location_key: slider?.location_key || '',
        height_class: slider?.height_class || 'h-64',
        border_radius: slider?.border_radius || 'rounded-2xl',
        interval: slider?.interval || 5000,
        effect: slider?.effect || 'fade',
        slides_per_view: slider?.slides_per_view || 1,
        
        // New Settings
        loop: slider?.loop !== undefined ? Boolean(slider.loop) : true,
        direction: slider?.direction || 'ltr',
        border_width: slider?.border_width || '0',
        border_color: slider?.border_color || '#000000',
        gap: slider?.gap || 0,
        gap_color: slider?.gap_color || '',

        is_active: slider ? Boolean(slider.is_active) : true,
    });

    // Dropdown State
    const [showLocationMenu, setShowLocationMenu] = useState(false);
    const locationMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (onSettingsChange) {
            onSettingsChange(data);
        }
    }, [data]);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: any) {
            if (locationMenuRef.current && !locationMenuRef.current.contains(event.target)) {
                setShowLocationMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(route('admin.sliders.update', slider.id));
        } else {
            post(route('admin.sliders.store'));
        }
    };

    const handleLocationSelect = (key: string) => {
        setData('location_key', key);
        setShowLocationMenu(false);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h2 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">تنظیمات اصلی</h2>
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">عنوان (نمایشی)</label>
                    <input 
                        type="text" 
                        value={data.title} 
                        onChange={e => setData('title', e.target.value)} 
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-primary-500"
                        placeholder="مثلا: اسلایدر صفحه اصلی"
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>
                
                <div className="relative" ref={locationMenuRef}>
                    <label className="block text-sm font-medium mb-1">مکان نمایش (Key)</label>
                    <div className="relative flex items-center">
                        <input 
                            type="text" 
                            value={data.location_key} 
                            onChange={e => setData('location_key', e.target.value)} 
                            className="w-full border rounded-lg px-3 py-2 text-sm dir-ltr text-left focus:ring-primary-500 pl-10"
                            placeholder="کلید یکتا را وارد یا انتخاب کنید..."
                            onFocus={() => setShowLocationMenu(true)}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowLocationMenu(!showLocationMenu)}
                            className="absolute left-1 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                            tabIndex={-1}
                        >
                            <ChevronDown size={16} className={`transition-transform duration-200 ${showLocationMenu ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                    
                    {/* Custom Dropdown Menu */}
                    {showLocationMenu && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto scrollbar-thin">
                            <div className="p-2">
                                <div className="text-xs font-bold text-gray-400 px-2 py-1">جایگاه‌های سیستمی</div>
                                {availablePages.system.map(key => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => handleLocationSelect(key)}
                                        className="w-full text-left flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition group"
                                    >
                                        <span className="font-mono">{key}</span>
                                        {data.location_key === key && <Check size={14} className="text-primary-600" />}
                                    </button>
                                ))}
                                
                                <div className="border-t my-1"></div>
                                <div className="text-xs font-bold text-gray-400 px-2 py-1">صفحات داخلی</div>
                                {availablePages.pages.map(page => (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => handleLocationSelect(page)}
                                        className="w-full text-left flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition group"
                                    >
                                        <span className="font-mono">{page}</span>
                                        {data.location_key === page && <Check size={14} className="text-blue-600" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {errors.location_key && <p className="text-red-500 text-xs mt-1">{errors.location_key}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">ارتفاع</label>
                        <select 
                            value={data.height_class} 
                            onChange={e => setData('height_class', e.target.value)} 
                            className="w-full border rounded-lg px-3 py-2 text-sm dir-ltr"
                        >
                            <option value="h-32">کوچک (128px)</option>
                            <option value="h-48">متوسط (192px)</option>
                            <option value="h-64">استاندارد (256px)</option>
                            <option value="h-80">بزرگ (320px)</option>
                            <option value="h-96">خیلی بزرگ (384px)</option>
                            <option value="h-[500px]">بنر مرتفع (500px)</option>
                            <option value="h-[600px]">بنر خیلی مرتفع (600px)</option>
                            <option value="h-[80vh]">تمام صفحه (80% ویوپورت)</option>
                            <option value="aspect-video h-auto">نسبت 16:9</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">تعداد نمایش</label>
                        <select 
                            value={data.slides_per_view} 
                            onChange={e => setData('slides_per_view', parseInt(e.target.value))} 
                            className="w-full border rounded-lg px-3 py-2 text-sm dir-ltr"
                        >
                            <option value={1}>1 اسلاید</option>
                            <option value={2}>2 اسلاید</option>
                            <option value={3}>3 اسلاید</option>
                            <option value={4}>4 اسلاید</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">نوع افکت</label>
                        <select 
                            value={data.effect} 
                            onChange={e => setData('effect', e.target.value)} 
                            className="w-full border rounded-lg px-3 py-2 text-sm dir-ltr"
                        >
                            <option value="fade">Fade (محو شدن)</option>
                            <option value="slide">Slide (کشویی ساده)</option>
                            <option value="cube">Cube (مکعب سه بعدی)</option>
                            <option value="coverflow">Coverflow (جریان)</option>
                            <option value="zoom">Zoom (زوم کن برنز)</option>
                            <option value="cards">Cards (کارت‌های پشته‌ای)</option>
                            <option value="rotate">Rotate (چرخشی)</option>
                            <option value="parallax">Parallax (پارالاکس)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">زمان توقف (ms)</label>
                        <input 
                            type="number" 
                            value={data.interval} 
                            onChange={e => setData('interval', parseInt(e.target.value))} 
                            className="w-full border rounded-lg px-3 py-2 text-sm dir-ltr"
                            placeholder="5000"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">جهت حرکت</label>
                        <select 
                            value={data.direction} 
                            onChange={e => setData('direction', e.target.value)} 
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="ltr">چپ به راست (استاندارد)</option>
                            <option value="rtl">راست به چپ (فارسی)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">فاصله (px)</label>
                        <input 
                            type="number" 
                            value={data.gap} 
                            onChange={e => setData('gap', parseInt(e.target.value))} 
                            className="w-full border rounded-lg px-3 py-2 text-sm dir-ltr"
                            placeholder="0"
                        />
                    </div>
                </div>
                
                {data.gap > 0 && (
                    <div>
                        <ColorPicker label="رنگ پس‌زمینه فاصله (Gap)" value={data.gap_color} onChange={(v: string) => setData('gap_color', v)} />
                        <p className="text-[10px] text-gray-400 mt-1">از فرمت rgba برای شفافیت استفاده کنید (مثلا: rgba(0,0,0,0.5))</p>
                    </div>
                )}

                <div className="border-t pt-4 mt-4">
                    <h3 className="font-bold text-sm text-gray-700 mb-3">تنظیمات ظاهری و بوردر</h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">گوشه‌ها</label>
                            <select 
                                value={data.border_radius} 
                                onChange={e => setData('border_radius', e.target.value)} 
                                className="w-full border rounded-lg px-2 py-1.5 text-sm dir-ltr"
                            >
                                <option value="rounded-none">صاف (0px)</option>
                                <option value="rounded-lg">کمی گرد (8px)</option>
                                <option value="rounded-xl">گرد (12px)</option>
                                <option value="rounded-2xl">کاملاً گرد (16px)</option>
                                <option value="rounded-3xl">خیلی گرد (24px)</option>
                                <option value="rounded-full">کپسولی</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">ضخامت بوردر</label>
                            <select 
                                value={data.border_width} 
                                onChange={e => setData('border_width', e.target.value)} 
                                className="w-full border rounded-lg px-2 py-1.5 text-sm dir-ltr"
                            >
                                <option value="0">بدون بوردر</option>
                                <option value="1px">1 پیکسل</option>
                                <option value="2px">2 پیکسل</option>
                                <option value="4px">4 پیکسل</option>
                                <option value="8px">8 پیکسل</option>
                            </select>
                        </div>
                    </div>
                    {data.border_width !== '0' && (
                        <div>
                            <ColorPicker label="رنگ بوردر" value={data.border_color} onChange={(v: string) => setData('border_color', v)} />
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2 pt-2 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            checked={data.loop} 
                            onChange={e => setData('loop', e.target.checked)} 
                            className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                            id="loop_check"
                        />
                        <label htmlFor="loop_check" className="text-sm font-medium cursor-pointer select-none">چرخش بی‌نهایت (Loop)</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            checked={data.is_active} 
                            onChange={e => setData('is_active', e.target.checked)} 
                            className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                            id="active_check"
                        />
                        <label htmlFor="active_check" className="text-sm font-medium cursor-pointer select-none">اسلایدر فعال باشد</label>
                    </div>
                </div>

                <button disabled={processing} className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-bold hover:bg-primary-700 transition flex justify-center items-center gap-2 mt-2 shadow-lg shadow-primary-500/20">
                    <Save size={18} />
                    {isEditing ? 'بروزرسانی تنظیمات' : 'ایجاد و ادامه'}
                </button>
            </form>
        </div>
    );
}