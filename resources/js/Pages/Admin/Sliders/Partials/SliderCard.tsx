import React from 'react';
import { Link } from '@inertiajs/react';
import { Edit2, Trash2, Layers, Eye } from 'lucide-react';

interface Props {
    slider: {
        id: number;
        title: string;
        location_key: string;
        height_class: string;
        slides_count: number;
        is_active: boolean;
    };
    onDelete: (id: number) => void;
}

export default function SliderCard({ slider, onDelete }: Props) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg text-gray-800 group-hover:text-primary-600 transition-colors">
                        {slider.title}
                    </h3>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 mt-1 block w-fit border border-gray-200">
                        {slider.location_key}
                    </code>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${slider.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {slider.is_active ? 'فعال' : 'غیرفعال'}
                </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-xl">
                <span className="flex items-center gap-1.5">
                    <Layers size={16} className="text-primary-500" />
                    {slider.slides_count} اسلاید
                </span>
                <div className="w-px h-4 bg-gray-300"></div>
                <span className="flex items-center gap-1.5">
                    <Eye size={16} className="text-blue-500" />
                    {slider.height_class}
                </span>
            </div>

            <div className="flex gap-2">
                <Link 
                    href={route('admin.sliders.edit', slider.id)}
                    className="flex-1 bg-white border border-blue-200 text-blue-600 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition shadow-sm"
                >
                    <Edit2 size={16} />
                    مدیریت
                </Link>
                <button 
                    onClick={() => onDelete(slider.id)}
                    className="bg-red-50 text-red-600 p-2.5 rounded-xl hover:bg-red-100 transition border border-red-100"
                    title="حذف"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}