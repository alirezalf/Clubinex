import React from 'react';
import { Edit2, Trash2, ChevronRight, LayoutGrid, Smartphone, Home, Wrench, Shirt, Monitor, Watch, Headphones, Camera, Gamepad2, Gift, Coffee, Music, Sun, Star, Zap, Car, Bike, Book, PenTool } from 'lucide-react';

const AVAILABLE_ICONS: Record<string, any> = {
    'smartphone': Smartphone, 'home': Home, 'tool': Wrench, 'shirt': Shirt, 'monitor': Monitor, 
    'watch': Watch, 'headphones': Headphones, 'camera': Camera, 'gamepad': Gamepad2, 'gift': Gift, 
    'coffee': Coffee, 'music': Music, 'sun': Sun, 'star': Star, 'zap': Zap, 'car': Car, 
    'bike': Bike, 'book': Book, 'pen-tool': PenTool, 'layout-grid': LayoutGrid
};

export default function CategoryTable({ categories, onEdit, onDelete }: any) {
    const renderIcon = (iconName: string) => {
        const IconComponent = AVAILABLE_ICONS[iconName] || LayoutGrid;
        return <IconComponent size={20} />;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 text-gray-500">
                    <tr>
                        <th className="px-6 py-4">عنوان</th>
                        <th className="px-6 py-4">آیکون</th>
                        <th className="px-6 py-4">والد</th>
                        <th className="px-6 py-4">نامک (Slug)</th>
                        <th className="px-6 py-4">تعداد محصول</th>
                        <th className="px-6 py-4">وضعیت</th>
                        <th className="px-6 py-4">عملیات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {categories.map((cat: any) => (
                        <tr key={cat.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 font-bold text-gray-800">{cat.title}</td>
                            <td className="px-6 py-4 text-gray-500">
                                {cat.icon ? (
                                    <div className="text-primary-600 bg-primary-50 p-1.5 rounded-lg w-fit">
                                        {renderIcon(cat.icon)}
                                    </div>
                                ) : '-'}
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-xs">
                                {cat.parent ? <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded w-fit">{cat.parent.title} <ChevronRight size={12}/></span> : '-'}
                            </td>
                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">{cat.slug}</td>
                            <td className="px-6 py-4">
                                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs">
                                    {cat.products_count} محصول
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {cat.is_active ? 'فعال' : 'غیرفعال'}
                                </span>
                            </td>
                            <td className="px-6 py-4 flex gap-2">
                                <button onClick={() => onEdit(cat)} className="text-primary-600 hover:bg-primary-50 p-1 rounded transition">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => onDelete(cat.id)} className="text-red-600 hover:bg-red-50 p-1 rounded transition">
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {categories.length === 0 && <div className="p-8 text-center text-gray-500">دسته‌بندی وجود ندارد.</div>}
        </div>
    );
}