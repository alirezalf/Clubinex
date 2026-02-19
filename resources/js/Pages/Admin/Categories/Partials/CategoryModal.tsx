import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { X, ChevronRight, LayoutGrid, Smartphone, Home, Wrench, Shirt, Monitor, Watch, Headphones, Camera, Gamepad2, Gift, Coffee, Music, Sun, Star, Zap, Car, Bike, Book, PenTool } from 'lucide-react';

// لیست آیکون‌ها در اینجا هم نیاز است یا می‌توان در فایل جداگانه تعریف کرد
const AVAILABLE_ICONS: Record<string, any> = {
    'smartphone': Smartphone, 'home': Home, 'tool': Wrench, 'shirt': Shirt, 'monitor': Monitor,
    'watch': Watch, 'headphones': Headphones, 'camera': Camera, 'gamepad': Gamepad2, 'gift': Gift,
    'coffee': Coffee, 'music': Music, 'sun': Sun, 'star': Star, 'zap': Zap, 'car': Car,
    'bike': Bike, 'book': Book, 'pen-tool': PenTool, 'layout-grid': LayoutGrid
};

export default function CategoryModal({ isOpen, onClose, category, categories }: any) {
    if (!isOpen) return null;

    const isEditing = !!category;
    const [showIconPicker, setShowIconPicker] = useState(false);

    const { data, setData, post, put, processing } = useForm({
        title: category?.title || '',
        slug: category?.slug || '',
        parent_id: category?.parent_id || '',
        icon: category?.icon || '',
        is_active: category ? Boolean(category.is_active) : true
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(route('admin.categories.update', category.id), {
                onSuccess: () => onClose()
            });
        } else {
            post(route('admin.categories.store'), {
                onSuccess: () => onClose()
            });
        }
    };

    const renderIcon = (iconName: string) => {
        const IconComponent = AVAILABLE_ICONS[iconName] || LayoutGrid;
        return <IconComponent size={20} />;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-visible">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg">{isEditing ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}</h3>
                    <button onClick={onClose}><X className="text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">عنوان</label>
                            <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">دسته والد</label>
                            <select 
                                value={data.parent_id} 
                                onChange={e => setData('parent_id', e.target.value)} 
                                className="w-full border rounded-lg px-3 py-2"
                            >
                                <option value="">بدون والد (ریشه)</option>
                                {categories.filter((c: any) => c.id !== category?.id).map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">نامک (Slug)</label>
                            <input type="text" value={data.slug} onChange={e => setData('slug', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-left dir-ltr" required />
                        </div>
                    </div>

                    {/* Icon Selection */}
                    <div className="relative">
                        <label className="block text-sm font-medium mb-1">آیکون</label>
                        <button 
                            type="button" 
                            onClick={() => setShowIconPicker(!showIconPicker)}
                            className="w-full border rounded-lg px-3 py-2 flex items-center justify-between text-gray-700 bg-white hover:bg-gray-50 transition"
                        >
                            <div className="flex items-center gap-2">
                                {data.icon && AVAILABLE_ICONS[data.icon] ? (
                                    <div className="text-primary-600 bg-primary-50 p-1 rounded">{renderIcon(data.icon)}</div>
                                ) : (
                                    <span className="text-gray-400">انتخاب آیکون...</span>
                                )}
                                {data.icon && <span className="text-sm font-mono">{data.icon}</span>}
                            </div>
                            <ChevronRight size={16} className={`transition-transform ${showIconPicker ? 'rotate-90' : ''}`} />
                        </button>

                        {showIconPicker && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-3 grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                                <button 
                                    type="button"
                                    onClick={() => { setData('icon', ''); setShowIconPicker(false); }}
                                    className="col-span-6 text-xs text-red-500 hover:bg-red-50 p-1.5 rounded mb-1 text-center"
                                >
                                    حذف آیکون
                                </button>
                                {Object.keys(AVAILABLE_ICONS).map((iconName) => {
                                    const Icon = AVAILABLE_ICONS[iconName];
                                    return (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => { setData('icon', iconName); setShowIconPicker(false); }}
                                            className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-primary-50 transition ${data.icon === iconName ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-500' : 'text-gray-600'}`}
                                            title={iconName}
                                        >
                                            <Icon size={20} />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="rounded text-primary-600" />
                            <span className="text-sm">فعال</span>
                        </label>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">انصراف</button>
                        <button disabled={processing} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">ذخیره</button>
                    </div>
                </form>
            </div>
        </div>
    );
}