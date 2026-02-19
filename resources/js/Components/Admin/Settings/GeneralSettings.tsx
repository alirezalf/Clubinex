import React, { useRef } from 'react';
import { Globe, Image as ImageIcon, Upload } from 'lucide-react';
import { InputGroup } from './SharedInputs';

export default function GeneralSettings({ data, setData }: { data: any, setData: (key: string, value: any) => void }) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('og_image', e.target.files[0]);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                <Globe size={20} className="text-primary-600" />
                تنظیمات پایه و سئو
            </h3>
            
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-4">
                <p className="text-xs text-blue-800 leading-relaxed">
                    <b>نکته سئو:</b> عنوان و توضیحات سایت در نتایج گوگل نمایش داده می‌شوند. کلمات کلیدی برای موتورهای جستجوی قدیمی‌تر مفید هستند.
                    تصویر اشتراک‌گذاری زمانی استفاده می‌شود که لینک سایت شما در شبکه‌های اجتماعی (تلگرام، توییتر و...) ارسال شود.
                </p>
            </div>

            <InputGroup 
                label="عنوان سایت (Page Title)" 
                name="site_title" 
                value={data.site_title} 
                onChange={setData} 
                placeholder="مثلا: باشگاه مشتریان وب‌کرفتر" 
            />
            
            <InputGroup 
                label="توضیحات متا (Meta Description)" 
                name="site_description" 
                value={data.site_description} 
                onChange={setData} 
                type="textarea" 
                placeholder="توضیحاتی کوتاه (۱۵۰-۱۶۰ کاراکتر) درباره کسب‌وکار شما که در گوگل نمایش داده می‌شود..." 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup 
                    label="کلمات کلیدی (Meta Keywords)" 
                    name="meta_keywords" 
                    value={data.meta_keywords} 
                    onChange={setData} 
                    placeholder="کلمات کلیدی را با کاما جدا کنید..." 
                />
                
                <InputGroup 
                    label="متن فوتر" 
                    name="footer_text" 
                    value={data.footer_text} 
                    onChange={setData} 
                    placeholder="مثلا: تمامی حقوق محفوظ است © 1403" 
                />
            </div>

            {/* OG Image Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تصویر اشتراک‌گذاری (Open Graph Image)</label>
                <div 
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-white hover:border-primary-400 transition cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        className="hidden" 
                        accept="image/*" 
                    />
                    
                    {data.og_image ? (
                        <div className="relative w-full max-w-sm h-40 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                            <img 
                                src={typeof data.og_image === 'string' ? data.og_image : URL.createObjectURL(data.og_image)} 
                                alt="OG Preview" 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                <span className="text-white text-xs font-bold flex items-center gap-1">
                                    <Upload size={14} /> تغییر تصویر
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-gray-400 group-hover:text-primary-600 transition">
                            <ImageIcon size={32} className="mb-2" />
                            <span className="text-sm font-medium">برای آپلود تصویر کلیک کنید</span>
                            <span className="text-[10px] mt-1 opacity-70">سایز پیشنهادی: 1200x630 پیکسل</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}