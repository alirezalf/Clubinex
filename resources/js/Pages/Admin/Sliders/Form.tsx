import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps } from '@/types';
import SliderSettingsForm from './Partials/SliderSettingsForm';
import SlideManager from './Partials/SlideManager';
import SliderPreview from './Partials/SliderPreview'; 

type Props = PageProps<{
    slider?: any;
    availablePages: { system: string[], pages: string[] };
}>;

export default function SliderForm({ slider, availablePages }: Props) {
    const isEditing = !!slider;

    // State to hold current settings (either from DB or from the form input) for live preview
    const [liveSettings, setLiveSettings] = useState(slider || {
        title: '',
        height_class: 'h-64',
        border_radius: 'rounded-2xl',
        interval: 5000,
        effect: 'fade',
        slides_per_view: 1,
        is_active: true
    });

    // Update live settings when prop changes (e.g. after save)
    useEffect(() => {
        if (slider) {
            setLiveSettings(prev => ({ ...prev, ...slider }));
        }
    }, [slider]);

    return (
        <DashboardLayout breadcrumbs={[
            { label: 'مدیریت اسلایدرها', href: route('admin.sliders.index') },
            { label: isEditing ? `ویرایش: ${slider.title}` : 'اسلایدر جدید' }
        ]}>
            <Head title={isEditing ? 'ویرایش اسلایدر' : 'اسلایدر جدید'} />

            {/* Top Section: Full Width Live Preview */}
            <div className="mb-8">
                {isEditing ? (
                    <SliderPreview 
                        sliderSettings={liveSettings} 
                        slides={slider.slides || []} 
                    />
                ) : (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center text-blue-800">
                        <p className="font-bold text-lg mb-2">خوش آمدید!</p>
                        <p className="text-sm opacity-90">
                            ابتدا تنظیمات اولیه را در فرم زیر ذخیره کنید تا بخش مدیریت اسلایدها و پیش‌نمایش فعال شود.
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Slider Config */}
                <div className="lg:col-span-1">
                    <SliderSettingsForm 
                        slider={slider} 
                        availablePages={availablePages} 
                        isEditing={isEditing} 
                        onSettingsChange={(newSettings) => setLiveSettings(prev => ({ ...prev, ...newSettings }))}
                    />
                </div>

                {/* Right Column: Slides Management */}
                <div className="lg:col-span-2">
                    {isEditing ? (
                        <SlideManager slider={slider} />
                    ) : (
                        <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl p-10 text-center text-gray-400 flex flex-col items-center justify-center h-full min-h-[300px]">
                            <h3 className="font-bold text-lg mb-2">مدیریت اسلایدها</h3>
                            <p className="text-sm opacity-80 max-w-xs">
                                پس از ایجاد اسلایدر فعال می‌شود.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}