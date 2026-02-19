import React from 'react';
import { Palette, Save, Laptop } from 'lucide-react';
import ThemePreview from './ThemePreview';
import ThemePresets from '@/Components/Theme/ThemePresets';
import ThemeControls from '@/Components/Theme/ThemeControls';

export default function ThemeCustomizer({ data, setData, submit, handleFileChange }: any) {
    
    const handlePresetSelect = (preset: any) => {
        setData(prev => ({
            ...prev,
            primary_color: preset.primary,
            sidebar_bg: preset.sidebar,
            sidebar_text: preset.text,
            header_bg: preset.header,
            sidebar_texture: preset.texture
        }));
    };

    const handleControlChange = (key: string, value: any) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    return (
        <form onSubmit={submit} className="space-y-8 animate-in fade-in" encType="multipart/form-data">
            <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Palette size={24} className="text-primary-600" />
                    تنظیمات ظاهری سیستم (سراسری)
                </h3>
                <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700 shadow-md flex items-center gap-2 font-bold text-sm">
                    <Save size={16} />
                    ذخیره و اعمال سراسری
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Left Column: Controls */}
                <div className="space-y-8">
                    
                    {/* Presets */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                        <ThemePresets 
                            currentPrimary={data.primary_color}
                            currentSidebar={data.sidebar_bg}
                            onSelect={handlePresetSelect} 
                        />
                    </div>

                    <ThemeControls 
                        data={data}
                        setData={handleControlChange}
                        isAdminContext={true}
                    />

                    <hr className="border-gray-100" />

                    {/* Logo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">لوگو و فاوآیکون</label>
                        <div className="flex gap-4">
                            <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-white hover:border-primary-300 transition cursor-pointer relative group">
                                <input type="file" onChange={e => handleFileChange('logo_url', e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                                {data.logo_url ? (
                                    <img src={typeof data.logo_url === 'string' ? data.logo_url : URL.createObjectURL(data.logo_url)} alt="Logo" className="h-10 object-contain mb-2" />
                                ) : (
                                    <div className="w-10 h-10 bg-gray-200 rounded-lg mb-2"></div>
                                )}
                                <span className="text-xs text-gray-500 font-medium group-hover:text-primary-600">تغییر لوگو</span>
                            </div>
                            
                            <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-white hover:border-primary-300 transition cursor-pointer relative group">
                                <input type="file" onChange={e => handleFileChange('favicon_url', e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                                {data.favicon_url ? (
                                    <img src={typeof data.favicon_url === 'string' ? data.favicon_url : URL.createObjectURL(data.favicon_url)} alt="Favicon" className="h-8 w-8 object-contain mb-2" />
                                ) : (
                                    <div className="w-8 h-8 bg-gray-200 rounded-full mb-2"></div>
                                )}
                                <span className="text-xs text-gray-500 font-medium group-hover:text-primary-600">تغییر فاوآیکون</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Live Preview */}
                <div className="xl:sticky xl:top-24 h-fit">
                    <div className="bg-gray-800 p-2 rounded-[20px] shadow-2xl border border-gray-700">
                        <div className="flex justify-center mb-2">
                            <div className="w-16 h-1 bg-gray-700 rounded-full"></div>
                        </div>
                        
                        {/* Screen Content */}
                        <div className="bg-gray-50 rounded-xl overflow-hidden relative" style={{ height: '500px' }}>
                            <ThemePreview settings={data} />
                        </div>
                    </div>
                    
                    <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                        <Laptop size={14} /> پیش‌نمایش زنده ظاهر سیستم
                    </p>
                </div>
            </div>
        </form>
    );
}