import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: (value: string) => void;
    placeholder?: string;
    className?: string;
    loading?: boolean;
    delay?: number;
}

export default function SearchInput({ 
    value, 
    onChange, 
    onSearch, 
    placeholder = 'جستجو...', 
    className, 
    loading = false,
    delay = 800 
}: SearchInputProps) {
    const [localValue, setLocalValue] = useState(value || '');
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // همگام‌سازی با تغییرات خارجی (مثلاً وقتی فیلترها از بیرون پاک می‌شوند)
    useEffect(() => {
        if (value !== localValue) {
            setLocalValue(value || '');
        }
        // نکته مهم: خط clearTimeout که اینجا بود حذف شد.
        // وجود آن باعث می‌شد وقتی کاربر تایپ می‌کند و Parent State آپدیت می‌شود،
        // تایمر جستجو کنسل شود و جستجو انجام نشود.
    }, [value]);

    const handleClear = () => {
        setLocalValue('');
        onChange(''); 
        onSearch(''); 
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setLocalValue(newVal);
        onChange(newVal); // آپدیت وضعیت والد برای نگهداری مقدار

        // پاک کردن تایمر قبلی
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // تنظیم تایمر جدید برای جستجو
        timeoutRef.current = setTimeout(() => {
            onSearch(newVal);
        }, delay);
    };

    return (
        <div className={clsx("relative w-full", className)}>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                {loading ? <Loader2 size={18} className="animate-spin text-primary-500" /> : <Search size={18} />}
            </div>
            <input
                type="text"
                value={localValue}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm bg-white/80 backdrop-blur-sm"
            />
            {localValue && (
                <button
                    onClick={handleClear}
                    className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 hover:text-red-500 transition-colors"
                    type="button"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
}