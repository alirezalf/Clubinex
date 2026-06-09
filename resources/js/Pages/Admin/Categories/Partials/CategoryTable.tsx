import React, { useState } from 'react';
import { Edit2, Trash2, ChevronRight, ChevronDown, LayoutGrid, Smartphone, Home, Wrench, Shirt, Monitor, Watch, Headphones, Camera, Gamepad2, Gift, Coffee, Music, Sun, Star, Zap, Car, Bike, Book, PenTool, Folder } from 'lucide-react';
import { Link } from '@inertiajs/react';

const AVAILABLE_ICONS: Record<string, any> = {
    'smartphone': Smartphone, 'home': Home, 'tool': Wrench, 'shirt': Shirt, 'monitor': Monitor,
    'watch': Watch, 'headphones': Headphones, 'camera': Camera, 'gamepad': Gamepad2, 'gift': Gift,
    'coffee': Coffee, 'music': Music, 'sun': Sun, 'star': Star, 'zap': Zap, 'car': Car,
    'bike': Bike, 'book': Book, 'pen-tool': PenTool, 'layout-grid': LayoutGrid, 'folder': Folder
};

export default function CategoryTable({ categories, onEdit, onDelete, pagination }: any) {
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    const toggleExpand = (id: number) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const renderIcon = (iconName: string) => {
        const IconComponent = AVAILABLE_ICONS[iconName] || Folder;
        return <IconComponent size={20} />;
    };

    const renderRow = (cat: any, level = 0) => {
        const hasChildren = cat.children && cat.children.length > 0;
        const isExpanded = expanded[cat.id];

        return (
            <React.Fragment key={cat.id}>
                <tr className={`hover:bg-gray-50 transition border-b border-gray-100 ${level > 0 ? 'bg-gray-50/30' : ''}`}>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2" style={{ paddingRight: `${level * 2}rem` }}>
                            {hasChildren ? (
                                <button onClick={() => toggleExpand(cat.id)} className="text-gray-400 hover:text-gray-700 transition">
                                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} className="rotate-180" />}
                                </button>
                            ) : <span className="w-[18px]"></span>}
                            <span className="font-bold text-gray-800">{cat.title}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                        {cat.icon ? (
                            <div className="text-primary-600 bg-primary-50 p-1.5 rounded-lg w-fit">
                                {renderIcon(cat.icon)}
                            </div>
                        ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs max-w-[200px] truncate" dir="ltr" title={cat.slug}>{cat.slug}</td>
                    <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs">
                            {cat.products_count || 0} محصول
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
                {hasChildren && isExpanded && cat.children.map((child: any) => renderRow(child, level + 1))}
            </React.Fragment>
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right min-w-[800px]">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-6 py-4 font-bold">عنوان دسته‌بندی</th>
                            <th className="px-6 py-4 font-bold">آیکون</th>
                            <th className="px-6 py-4 font-bold">نامک (Slug)</th>
                            <th className="px-6 py-4 font-bold">تعداد محصول</th>
                            <th className="px-6 py-4 font-bold">وضعیت</th>
                            <th className="px-6 py-4 font-bold">عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat: any) => renderRow(cat))}
                    </tbody>
                </table>
            </div>
            {categories.length === 0 && <div className="p-8 text-center text-gray-500">دسته‌بندی وجود ندارد.</div>}

            {pagination && pagination.length > 3 && (
                <div className="flex items-center justify-center p-4 border-t border-gray-100 gap-1 bg-gray-50">
                    {pagination.map((link: any, i: number) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            className={`px-3 py-1 text-sm rounded transition ${link.active ? 'bg-primary-600 text-white font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-200'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
