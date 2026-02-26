import React, { useRef, useState, useEffect } from 'react';
import { Upload, FileText, X, Image as ImageIcon } from 'lucide-react';
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
    const [localPreview, setLocalPreview] = useState<string | null>(null);
    const [imageError, setImageError] = useState<boolean>(false);

    // تابع برای پاکسازی نام فایل (حذف فاصله و کاراکترهای خاص)
    const sanitizeFileName = (fileName: string): string => {
        return fileName
            .replace(/\s+/g, '_') // جایگزینی فاصله با _
            .replace(/[(){}[\]\\\/:*?"<>|]/g, '_') // جایگزینی کاراکترهای غیرمجاز
            .replace(/_+/g, '_'); // جایگزینی چند _ پشت سر هم با یک _
    };

    // تابع برای ایجاد URL امن
    const getSafePreviewUrl = (url: string | undefined): string | undefined => {
        if (!url) return undefined;

        // اگر URL شامل فاصله است، آن را انکد کنید
        if (url.includes(' ')) {
            return url.split('/').map(part =>
                part.includes(' ') ? encodeURIComponent(part) : part
            ).join('/');
        }
        return url;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const originalFile = e.target.files[0];

            // بررسی حجم فایل
            if (originalFile.size > 5 * 1024 * 1024) { // 5MB
                alert('حجم فایل نباید بیشتر از ۵ مگابایت باشد.');
                if (inputRef.current) inputRef.current.value = '';
                return;
            }

            // بررسی نام فایل و هشدار اگر فاصله دارد
            if (originalFile.name.includes(' ')) {
                console.warn('نام فایل شامل فاصله است. پیشنهاد می‌شود فاصله‌ها را با "_" جایگزین کنید.');

                // ایجاد یک فایل جدید با نام پاکسازی شده
                const sanitizedName = sanitizeFileName(originalFile.name);
                const cleanFile = new File([originalFile], sanitizedName, {
                    type: originalFile.type,
                    lastModified: originalFile.lastModified,
                });

                // ادامه با فایل پاکسازی شده
                processFile(cleanFile);
            } else {
                processFile(originalFile);
            }
        }
    };

    const processFile = (file: File) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalPreview(reader.result as string);
                setImageError(false);
            };
            reader.onerror = () => {
                setImageError(true);
            };
            reader.readAsDataURL(file);
        } else {
            setLocalPreview(null);
        }

        onChange(file);
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onChange(null);
        setLocalPreview(null);
        setImageError(false);
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleImageError = () => {
        setImageError(true);
        console.error('خطا در لود تصویر - احتمالاً نام فایل مشکل دارد');
    };

    const displayPreview = localPreview || getSafePreviewUrl(previewUrl);
    const isImage = accept.includes('image') && displayPreview && !imageError;

    return (
        <div>
            {label && <label className="block text-sm font-bold text-gray-800 mb-2">{label}</label>}

            <div className={clsx(
                "group relative flex h-48 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed bg-gray-50 p-6 text-center transition hover:bg-white overflow-hidden",
                error ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-primary-400"
            )}>
                <input
                    ref={inputRef}
                    type="file"
                    onChange={handleChange}
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                    accept={accept}
                />

                {isImage ? (
                    <div className="absolute inset-0 w-full h-full">
                        <img
                            src={displayPreview}
                            alt="Preview"
                            className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity"
                            onError={handleImageError}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                            <ImageIcon size={32} className="text-gray-800 mb-2 drop-shadow-md" />
                            <span className="text-sm font-bold text-gray-900 bg-white/70 px-3 py-1 rounded-lg backdrop-blur-sm">
                                {localPreview ? 'تصویر جدید انتخاب شد' : 'تصویر فعلی (برای تغییر کلیک کنید)'}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="pointer-events-none flex flex-col items-center z-0">
                        <Upload
                            size={32}
                            className={clsx("mb-3 transition", error ? "text-red-400" : "text-gray-400 group-hover:text-primary-500")}
                        />
                        <span className={clsx("text-sm font-medium", error ? "text-red-600" : "text-gray-500 group-hover:text-primary-600")}>
                            {currentFileName || localPreview ? (
                                <span className="text-green-600 dir-ltr font-bold flex items-center gap-1 flex-wrap justify-center">
                                    {currentFileName?.includes(' ') ? (
                                        <>
                                            <span className="text-yellow-600">⚠️</span>
                                            {currentFileName}
                                            <span className="text-[10px] text-yellow-600 block w-full">
                                                (نام فایل شامل فاصله است)
                                            </span>
                                        </>
                                    ) : (
                                        currentFileName || 'فایل انتخاب شد'
                                    )}
                                </span>
                            ) : (
                                'برای آپلود کلیک کنید یا فایل را اینجا رها کنید'
                            )}
                        </span>
                        <span className="mt-2 text-[10px] text-gray-400 bg-white/50 px-2 py-1 rounded">
                            حداکثر حجم: ۵ مگابایت | فرمت‌های مجاز: {accept.replace('image/', '').toUpperCase()}
                        </span>
                    </div>
                )}

                {/* دکمه حذف فایل انتخاب شده */}
                {(currentFileName || localPreview) && (
                    <button
                        onClick={handleRemove}
                        className="absolute top-2 right-2 z-20 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
                        title="حذف فایل"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* هشدار برای نام فایل‌های با فاصله */}
            {currentFileName?.includes(' ') && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-700 flex items-center gap-1">
                        <span className="text-yellow-600">⚠️</span>
                        نام فایل شامل فاصله است. این ممکن است باعث خطای 403 در نمایش تصویر شود.
                        <button
                            onClick={() => {
                                const newName = currentFileName.replace(/\s+/g, '_');
                                alert(`پیشنهاد: "${newName}"\nلطفاً فایل را با این نام دوباره آپلود کنید.`);
                            }}
                            className="text-blue-600 hover:underline mr-1"
                        >
                            پیشنهاد نام جدید
                        </button>
                    </p>
                </div>
            )}

            {/* نمایش خطای تصویر */}
            {imageError && previewUrl && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-600 flex items-center gap-1">
                        <X size={12} />
                        خطا در نمایش تصویر. احتمالاً نام فایل مشکل دارد.
                    </p>
                </div>
            )}

            {/* نمایش لینک فایل فعلی (اگر تصویر نباشد) */}
            {previewUrl && !localPreview && !currentFileName && !accept.includes('image') && (
                <div className="mt-2 flex items-center gap-2 bg-white border border-gray-200 p-2 rounded-lg w-fit shadow-sm">
                    <span className="text-xs text-gray-500">فایل فعلی:</span>
                    <a
                        href={getSafePreviewUrl(previewUrl)}
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
