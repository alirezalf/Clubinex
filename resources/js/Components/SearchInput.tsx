import clsx from 'clsx';
import { Search, X, Loader2 } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

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
    const isFirstRender = useRef(true);

    // فقط در رندر اول و وقتی مقدار از بیرون تغییر میکنه و کاربر در حال تایپ نیست
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // اگه مقدار خارجی با مقدار محلی فرق داشت و timeout فعال نبود، مقدار محلی رو آپدیت کن
        if (value !== localValue && !timeoutRef.current) {
            setLocalValue(value || '');
        }
    }, [value]);

    const handleClear = () => {
        setLocalValue('');
        onChange('');
        onSearch('');
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setLocalValue(newVal);
        onChange(newVal);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            onSearch(newVal);
            timeoutRef.current = null;
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
