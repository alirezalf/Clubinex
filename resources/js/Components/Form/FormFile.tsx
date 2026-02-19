import React, { useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    label?: string;
    error?: string;
    onChange: (file: File | null) => void;
    accept?: string;
    previewUrl?: string;
    currentFileName?: string;
}

export default function FormFile({ label, error, onChange, accept = "image/*", previewUrl, currentFileName }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Client-side Validation (Real-world enhancement)
            if (file.size > 5 * 1024 * 1024) { // 5MB
                alert('حجم فایل نباید بیشتر از ۵ مگابایت باشد.');
                if (inputRef.current) inputRef.current.value = '';
                return;
            }
            
            onChange(file);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onChange(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div>
            {label && <label className="block text-sm font-bold text-gray-800 mb-2">{label}</label>}
            
            <div className={clsx(
                "group relative flex h-48 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed bg-gray-50 p-6 text-center transition hover:bg-white",
                error ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-primary-400"
            )}>
                <input
                    ref={inputRef}
                    type="file"
                    onChange={handleChange}
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                    accept={accept}
                />
                
                <div className="pointer-events-none flex flex-col items-center z-0">
                    <Upload
                        size={32}
                        className={clsx("mb-3 transition", error ? "text-red-400" : "text-gray-400 group-hover:text-primary-500")}
                    />
                    <span className={clsx("text-sm font-medium", error ? "text-red-600" : "text-gray-500 group-hover:text-primary-600")}>
                        {currentFileName ? (
                            <span className="text-green-600 dir-ltr font-bold flex items-center gap-1">
                                {currentFileName}
                            </span>
                        ) : (
                            'برای آپلود کلیک کنید یا فایل را اینجا رها کنید'
                        )}
                    </span>
                    <span className="mt-2 text-[10px] text-gray-400 bg-white/50 px-2 py-1 rounded">
                        حداکثر حجم: ۵ مگابایت | فرمت‌های مجاز: {accept.replace('image/', '').toUpperCase()}
                    </span>
                </div>

                {/* دکمه حذف فایل انتخاب شده */}
                {currentFileName && (
                    <button 
                        onClick={handleRemove}
                        className="absolute top-2 right-2 z-20 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                        title="حذف فایل"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* نمایش تصویر فعلی (اگر فایل جدیدی انتخاب نشده باشد) */}
            {previewUrl && !currentFileName && (
                <div className="mt-2 flex items-center gap-2 bg-white border border-gray-200 p-2 rounded-lg w-fit shadow-sm">
                    <span className="text-xs text-gray-500">فایل فعلی:</span>
                    <a 
                        href={previewUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-bold"
                    >
                        <FileText size={14} /> مشاهده
                    </a>
                </div>
            )}

            {error && <p className="mt-1 text-xs text-red-500 font-bold flex items-center gap-1"><X size={12}/> {error}</p>}
        </div>
    );
}