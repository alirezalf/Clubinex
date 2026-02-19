import React from 'react';
import { Edit2, Trash2, Copy, Eye, EyeOff } from 'lucide-react';

interface Slide {
    id: number;
    title: string | null;
    description: string | null;
    image_path: string | null;
    bg_color: string | null;
    bg_text: string | null;
    text_color: string | null;
    content_position: string;
    button_text: string | null;
    is_active: boolean;
    order: number;
}

interface Props {
    slide: Slide;
    onEdit: (slide: Slide) => void;
    onDelete: (id: number) => void;
    onDuplicate: (id: number) => void;
}

export default function SlideListItem({ slide, onEdit, onDelete, onDuplicate }: Props) {
    // Logic to determine text color for thumbnail preview
    const isHexColor = slide.text_color && (slide.text_color.startsWith('#') || slide.text_color.startsWith('rgb'));
    const textColorStyle = isHexColor ? { color: slide.text_color! } : {};
    const textColorClass = !isHexColor ? slide.text_color : '';

    return (
        <div className="border border-gray-200 rounded-xl p-3 flex gap-4 items-center hover:bg-gray-50 transition group bg-white shadow-sm hover:shadow-md relative">
            {/* Thumbnail */}
            <div className="w-32 h-20 rounded-lg overflow-hidden shrink-0 relative border flex items-center justify-center text-center bg-gray-100">
                {slide.image_path ? (
                    <>
                        <img src={slide.image_path} alt="" className="w-full h-full object-cover absolute inset-0 z-0" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 p-1">
                            <span 
                                className={`text-[9px] font-bold line-clamp-2 ${textColorClass}`} 
                                style={{ ...textColorStyle, textShadow: '0 1px 2px rgba(0,0,0,0.8)', color: isHexColor ? slide.text_color! : 'white' }}
                            >
                                {slide.title || 'تصویر'}
                            </span>
                        </div>
                    </>
                ) : (
                    <div 
                        className={`w-full h-full flex flex-col items-center justify-center font-bold text-[10px] p-1 relative overflow-hidden ${textColorClass}`} 
                        style={{ 
                            backgroundColor: slide.bg_color || '#f3f4f6', 
                            ...textColorStyle 
                        }}
                    >
                        {slide.bg_text && (
                            <span className="absolute inset-0 flex items-center justify-center text-[20px] opacity-10 rotate-[-10deg] whitespace-nowrap">
                                {slide.bg_text}
                            </span>
                        )}
                        <span className="relative z-10 line-clamp-2">{slide.title || (slide.bg_color ? 'رنگ پس‌زمینه' : 'خالی')}</span>
                    </div>
                )}
                <div className="absolute top-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono z-20 shadow-sm">
                    #{slide.order}
                </div>
            </div>

            {/* Content Info */}
            <div className="flex-1 min-w-0 py-1">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-sm truncate text-gray-800">{slide.title || '(بدون عنوان)'}</h4>
                    {!slide.is_active && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <EyeOff size={10} /> غیرفعال
                        </span>
                    )}
                </div>
                
                <p className="text-xs text-gray-500 truncate">{slide.description || 'بدون توضیحات'}</p>
                
                <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                        {slide.content_position}
                    </span>
                    {slide.button_text && (
                        <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100">
                            دکمه: {slide.button_text}
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1">
                <button 
                    onClick={() => onDuplicate(slide.id)} 
                    className="p-2 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition border border-transparent hover:border-purple-200" 
                    title="کپی کردن"
                >
                    <Copy size={16} />
                </button>
                <button 
                    onClick={() => onEdit(slide)} 
                    className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition border border-transparent hover:border-blue-200" 
                    title="ویرایش"
                >
                    <Edit2 size={16} />
                </button>
                <button 
                    onClick={() => onDelete(slide.id)} 
                    className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition border border-transparent hover:border-red-200" 
                    title="حذف"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}