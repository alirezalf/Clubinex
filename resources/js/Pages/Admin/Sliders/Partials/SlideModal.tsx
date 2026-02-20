import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { X, Save, Upload, Layout, Type, Zap, Move, Trash2 } from 'lucide-react';
import { ColorPicker } from '@/Components/Admin/Settings/SharedInputs';
import clsx from 'clsx';

interface Props {
    sliderId: number;
    slide?: any;
    onClose: () => void;
}

export default function SlideModal({ sliderId, slide, onClose }: Props) {
    const isEditing = !!slide;
    const [activeTab, setActiveTab] = useState<'content' | 'style' | 'animation'>('content');

    const { data, setData, post, processing, errors } = useForm({
        image: null as File | null,
        title: slide?.title || '',
        bg_text: slide?.bg_text || '',
        bg_color: slide?.bg_color || '',
        description: slide?.description || '',
        button_text: slide?.button_text || '',
        button_link: slide?.button_link || '',
        content_position: slide?.content_position || 'center-center',
        btn_pos_type: slide?.btn_pos_type || 'relative',
        btn_relative_pos: slide?.btn_relative_pos || 'below',
        btn_custom_pos: slide?.btn_custom_pos || 'bottom-10 right-10',
        text_color: slide?.text_color || '#ffffff',
        text_size: slide?.text_size || 'text-4xl',
        desc_color: slide?.desc_color || '', // New
        desc_size: slide?.desc_size || 'text-lg', // New
        gap_y: slide?.gap_y || 15, // New
        button_color: slide?.button_color || '#ffffff',
        button_bg_color: slide?.button_bg_color || '#0284c7',
        button_size: slide?.button_size || 'md',
        anim_speed: slide?.anim_speed || 'normal',
        text_anim_in: slide?.text_anim_in || 'fade-in-up',
        text_anim_out: slide?.text_anim_out || 'fade-out',
        btn_anim_in: slide?.btn_anim_in || 'fade-in-up',
        btn_anim_out: slide?.btn_anim_out || 'fade-out',
        order: slide?.order || 0,
        is_active: slide ? Boolean(slide.is_active) : true,
        remove_image: false, // Flag for removal
        _method: 'POST'
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const routeName = isEditing ? 'admin.sliders.slides.update' : 'admin.sliders.slides.store';
        const routeParams = isEditing ? slide.id : sliderId;

        post(route(routeName, routeParams), {
            onSuccess: () => onClose(),
            preserveScroll: true
        });
    };

    const tabs = [
        { id: 'content', label: 'محتوا', icon: Layout },
        { id: 'style', label: 'ظاهر', icon: Type },
        { id: 'animation', label: 'انیمیشن', icon: Zap },
    ];

    const animationOptions = [
        { value: 'none', label: 'بدون افکت' },
        { value: 'fade-in', label: 'Fade In' },
        { value: 'fade-in-up', label: 'Fade In Up (از پایین)' },
        { value: 'fade-in-down', label: 'Fade In Down (از بالا)' },
        { value: 'slide-in-right', label: 'Slide Right (از راست)' },
        { value: 'slide-in-left', label: 'Slide Left (از چپ)' },
        { value: 'zoom-in', label: 'Zoom In' },
        { value: 'zoom-out', label: 'Zoom Out' },
        { value: 'bounce-in', label: 'Bounce (فنری)' },
        { value: 'flip-x', label: 'Flip X (چرخش افقی)' },
    ];

    // Extended text size options
    const fontSizeOptions = [
        { value: 'text-sm', label: 'خیلی کوچک (SM)' },
        { value: 'text-base', label: 'معمولی (Base)' },
        { value: 'text-lg', label: 'بزرگ (LG)' },
        { value: 'text-xl', label: 'خیلی بزرگ (XL)' },
        { value: 'text-2xl', label: '2XL' },
        { value: 'text-3xl', label: '3XL' },
        { value: 'text-4xl', label: '4XL' },
        { value: 'text-5xl', label: '5XL' },
        { value: 'text-6xl', label: '6XL' },
        { value: 'text-7xl', label: '7XL' },
        { value: 'text-8xl', label: '8XL' },
        { value: 'text-9xl', label: '9XL' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                    <h3 className="font-bold text-base text-gray-800">{isEditing ? 'ویرایش اسلاید' : 'افزودن اسلاید جدید'}</h3>
                    <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-4 bg-white">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors",
                                activeTab === tab.id
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={submit} className="flex-1 overflow-y-auto p-5">

                    {/* --- Content Tab --- */}
                    {activeTab === 'content' && (
                        <div className="space-y-4 animate-in fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-700">تصویر پس‌زمینه</label>

                                    {/* Logic for Image Preview & Removal */}
                                    {!data.image && slide?.image_path && !data.remove_image ? (
                                        <div className="relative rounded-xl border border-gray-200 h-28 group overflow-hidden">
                                            <img src={slide.image_path} alt="Current" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    type="button"
                                                    onClick={() => setData('remove_image', true)}
                                                    className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-red-700"
                                                >
                                                    <Trash2 size={14} /> حذف تصویر
                                                </button>
                                            </div>
                                            <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[9px] px-1.5 rounded">تصویر فعلی</span>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer relative bg-gray-50/50 h-28 flex items-center justify-center">
                                            <input
                                                type="file"
                                                onChange={e => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setData('image', e.target.files[0]);
                                                        setData('remove_image', false);
                                                    }
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                accept="image/*"
                                            />
                                            <div className="flex flex-col items-center">
                                                <Upload size={20} className="text-gray-400 mb-1" />
                                                <span className="text-[10px] text-gray-600 font-medium truncate w-32">
                                                    {data.image ? data.image.name : 'انتخاب تصویر'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {errors.image && <p className="text-red-500 text-xs">{errors.image}</p>}
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">متن پس‌زمینه (Watermark)</label>
                                        <input
                                            type="text"
                                            value={data.bg_text}
                                            onChange={e => setData('bg_text', e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2 text-xs dir-ltr text-left"
                                            placeholder="SALE, NEW, ..."
                                        />
                                    </div>
                                    <div>
                                        <ColorPicker
                                            label="رنگ پس‌زمینه (در صورت نبودن عکس)"
                                            value={data.bg_color}
                                            onChange={(v: string) => setData('bg_color', v)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 border-t pt-3">
                                <div>
                                    <label className="block text-xs font-medium mb-1">عنوان اصلی</label>
                                    <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">توضیحات</label>
                                    <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2}></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium mb-1">متن دکمه</label>
                                        <input type="text" value={data.button_text} onChange={e => setData('button_text', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1">لینک دکمه</label>
                                        <input type="text" value={data.button_link} onChange={e => setData('button_link', e.target.value)} className="w-full border rounded-lg px-3 py-2 dir-ltr text-left text-sm" placeholder="https://" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- Style Tab --- */}
                    {activeTab === 'style' && (
                        <div className="space-y-4 animate-in fade-in">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1">چیدمان محتوا</label>
                                    <select value={data.content_position} onChange={e => setData('content_position', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-xs">
                                        <option value="top-right">بالا راست</option>
                                        <option value="top-center">بالا وسط</option>
                                        <option value="top-left">بالا چپ</option>
                                        <option value="center-right">وسط راست</option>
                                        <option value="center-center">مرکز</option>
                                        <option value="center-left">وسط چپ</option>
                                        <option value="bottom-right">پایین راست</option>
                                        <option value="bottom-center">پایین وسط</option>
                                        <option value="bottom-left">پایین چپ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">فاصله عمودی عنوان و توضیح (px)</label>
                                    <input
                                        type="number"
                                        value={data.gap_y}
                                        onChange={e => setData('gap_y', parseInt(e.target.value) || 0)}
                                        className="w-full border rounded-lg px-3 py-2 text-xs dir-ltr"
                                    />
                                </div>
                            </div>

                            {/* Title Styling */}
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <h4 className="font-bold text-xs text-gray-700 mb-2">استایل عنوان</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <ColorPicker
                                        label="رنگ متن عنوان"
                                        value={data.text_color}
                                        onChange={(v: string) => setData('text_color', v)}
                                    />
                                    <div>
                                        <label className="block text-xs font-medium mb-1">سایز فونت</label>
                                        <select value={data.text_size} onChange={e => setData('text_size', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-xs dir-ltr">
                                            {fontSizeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Description Styling */}
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <h4 className="font-bold text-xs text-gray-700 mb-2">استایل توضیحات</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <ColorPicker
                                        label="رنگ متن توضیحات (اختیاری)"
                                        value={data.desc_color}
                                        onChange={(v: string) => setData('desc_color', v)}
                                    />
                                    <div>
                                        <label className="block text-xs font-medium mb-1">سایز فونت</label>
                                        <select value={data.desc_size} onChange={e => setData('desc_size', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-xs dir-ltr">
                                            <option value="text-xs">خیلی کوچک (XS)</option>
                                            <option value="text-sm">کوچک (SM)</option>
                                            <option value="text-base">معمولی (Base)</option>
                                            <option value="text-lg">بزرگ (LG)</option>
                                            <option value="text-xl">خیلی بزرگ (XL)</option>
                                            <option value="text-2xl">2XL</option>
                                            <option value="text-3xl">3XL</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Button Styling */}
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <h4 className="font-bold text-xs text-gray-700 mb-2 flex items-center gap-2">
                                    <Move size={14} /> دکمه
                                </h4>
                                <div className="flex gap-4 mb-2 text-xs">
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input type="radio" checked={data.btn_pos_type === 'relative'} onChange={() => setData('btn_pos_type', 'relative')} />
                                        شناور (زیر متن)
                                    </label>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input type="radio" checked={data.btn_pos_type === 'absolute'} onChange={() => setData('btn_pos_type', 'absolute')} />
                                        ثابت (گوشه)
                                    </label>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <ColorPicker label="رنگ متن دکمه" value={data.button_color} onChange={(v: string) => setData('button_color', v)} />
                                    <ColorPicker label="رنگ پس‌زمینه دکمه" value={data.button_bg_color} onChange={(v: string) => setData('button_bg_color', v)} />
                                </div>

                                <div className="mt-2">
                                     <label className="block text-xs font-medium mb-1">سایز دکمه</label>
                                    <select value={data.button_size} onChange={e => setData('button_size', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-xs dir-ltr">
                                        <option value="sm">کوچک</option>
                                        <option value="md">متوسط</option>
                                        <option value="lg">بزرگ</option>
                                        <option value="xl">خیلی بزرگ</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- Animation Tab --- */}
                    {activeTab === 'animation' && (
                        <div className="space-y-4 animate-in fade-in">
                            <div>
                                <label className="block text-xs font-medium mb-1">سرعت انیمیشن</label>
                                <select value={data.anim_speed} onChange={e => setData('anim_speed', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-xs dir-ltr">
                                    <option value="slow">آهسته</option>
                                    <option value="normal">معمولی</option>
                                    <option value="fast">سریع</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1">افکت ورود متن</label>
                                    <select value={data.text_anim_in} onChange={e => setData('text_anim_in', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-xs dir-ltr">
                                        {animationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">افکت ورود دکمه</label>
                                    <select value={data.btn_anim_in} onChange={e => setData('btn_anim_in', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-xs dir-ltr">
                                        {animationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Common Fields */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} id="slide_active" className="rounded text-primary-600 w-4 h-4" />
                                <label htmlFor="slide_active" className="text-xs select-none">فعال</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs">ترتیب:</label>
                                <input type="number" value={data.order} onChange={e => setData('order', parseInt(e.target.value))} className="w-14 border rounded px-2 py-1 text-xs" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition text-xs">انصراف</button>
                            <button disabled={processing} className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-md transition text-xs font-bold flex items-center gap-1">
                                <Save size={14} />
                                ذخیره
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
