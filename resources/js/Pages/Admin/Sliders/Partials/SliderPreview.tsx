import React from 'react';
import DynamicSlider from '@/Components/DynamicSlider';
import { Eye } from 'lucide-react';

interface Props {
    sliderSettings: any;
    slides: any[];
}

export default function SliderPreview({ sliderSettings, slides }: Props) {
    // شبیه‌سازی ساختار داده‌ای که کامپوننت DynamicSlider انتظار دارد
    const previewSliderData = {
        ...sliderSettings,
        id: -1, // Dummy ID
        active_slides: slides.map(s => ({
            ...s,
            // اطمینان از اینکه اگر تصویر فایل جدید است (در حالت آپلود)، نمایش داده شود
            image_path: s.image instanceof File ? URL.createObjectURL(s.image) : s.image_path
        }))
    };

    if (!slides || slides.length === 0) {
        return (
            <div className="w-full bg-gray-50 rounded-2xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200" style={{ height: '300px' }}>
                <Eye size={48} className="mb-3 opacity-30" />
                <p className="font-medium">پیش‌نمایش اسلایدر</p>
                <span className="text-xs mt-1">هنوز اسلایدی اضافه نشده است. پس از افزودن اسلاید، پیش‌نمایش در اینجا ظاهر می‌شود.</span>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end px-1">
                <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                    <Eye size={18} className="text-primary-600" />
                    پیش‌نمایش زنده
                </h3>
                <span className="text-[10px] text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                    نمایش فعلی کاربر
                </span>
            </div>
            
            <div className="border-4 border-gray-800 rounded-2xl overflow-hidden shadow-2xl bg-gray-900 relative">
                {/* Browser Header Simulation */}
                <div className="bg-gray-800 h-6 flex items-center px-3 gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                </div>
                
                {/* The Slider */}
                <div className="bg-white">
                    {/* Key is crucial to force re-render when structural props change */}
                    <DynamicSlider 
                        key={`${sliderSettings.slides_per_view}-${sliderSettings.effect}-${slides.length}`} 
                        slider={previewSliderData} 
                    />
                </div>
            </div>
            
            <p className="text-[11px] text-gray-400 text-center">
                * توجه: ارتفاع و افکت‌ها بلافاصله پس از تغییر در تنظیمات اعمال می‌شوند.
            </p>
        </div>
    );
}