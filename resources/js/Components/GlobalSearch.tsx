import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Package, User, ChevronRight, Sparkles, Command, Users, ShoppingBag } from 'lucide-react';
import clsx from 'clsx';
import axios from 'axios';
import { router } from '@inertiajs/react';

interface SearchResult {
    id: number;
    title: string;
    subtitle: string;
    image: string | null;
    type: 'user' | 'product';
    url: string;
}

interface Props {
    isAdmin: boolean;
    className?: string;
}

export default function GlobalSearch({ isAdmin, className }: Props) {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState<'product' | 'user'>('product');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // شورتکات Ctrl+K برای فوکوس روی جستجو
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // بستن دراپ‌داون با کلیک بیرون و Esc
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
                setIsFocused(false);
            }
        };

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowDropdown(false);
                setIsFocused(false);
                inputRef.current?.blur();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, []);

    // اجرای جستجو با Debounce
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setIsLoading(true);
        setShowDropdown(true);

        timeoutRef.current = setTimeout(() => {
            axios.get(route('api.global.search'), {
                params: { q: query, type: searchType }
            })
            .then(res => {
                setResults(res.data);
                setIsLoading(false);
            })
            .catch(() => {
                setResults([]);
                setIsLoading(false);
            });
        }, 500);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [query, searchType]);

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setShowDropdown(false);
        inputRef.current?.focus();
    };

    const handleResultClick = (url: string) => {
        setShowDropdown(false);
        setQuery('');
        router.visit(url);
    };

    return (
        <div
            ref={containerRef}
            className={clsx("relative w-full z-50", className)}
        >
            <div className="flex gap-2">
                {/* انتخابگر نوع جستجو (فقط برای ادمین) */}
                {isAdmin && (
                    <div className="relative group">
                        <div className={clsx(
                            "absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300",
                            isFocused && "opacity-30"
                        )} />
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value as any)}
                            className="relative bg-[var(--header-bg)] border border-[var(--header-border)] rounded-xl text-xs font-bold text-[var(--header-text)] focus:ring-2 focus:ring-amber-500/20 cursor-pointer px-3 py-2.5 outline-none h-[42px] shrink-0 appearance-none pl-8 transition-all hover:border-amber-500"
                            style={{
                                backgroundColor: 'var(--header-bg)',
                                color: 'var(--header-text)',
                                borderColor: 'var(--header-border)'
                            }}
                        >
                            <option value="product" className="bg-white text-gray-800">محصول</option>
                            <option value="user" className="bg-white text-gray-800">کاربر</option>
                        </select>
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                            {searchType === 'product' ? (
                                <ShoppingBag size={14} className="text-amber-500" />
                            ) : (
                                <Users size={14} className="text-amber-500" />
                            )}
                        </div>
                    </div>
                )}

                {/* فیلد ورودی */}
                <div className="relative flex-1 group">
                    {/* افکت گلو */}
                    <div className={clsx(
                        "absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl blur opacity-0 transition-all duration-500",
                        (isFocused || query) && "opacity-20",
                        isFocused && "opacity-30 animate-pulse"
                    )} />

                    {/* کانتینر اصلی اینپوت */}
                    <div className={clsx(
                        "relative flex items-center w-full bg-[var(--header-bg)] backdrop-blur-xl rounded-xl border transition-all duration-300",
                        isFocused
                            ? "border-amber-500 shadow-lg shadow-amber-500/20 scale-[1.02]"
                            : "border-[var(--header-border)] hover:border-amber-500/50 hover:shadow-md"
                    )}>
                        {/* آیکون سمت راست */}
                        <div className={clsx(
                            "absolute right-3 flex items-center justify-center transition-all duration-300",
                            isFocused ? "text-amber-500" : "text-[var(--header-text-muted)]",
                            isLoading && "animate-pulse"
                        )}>
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin text-amber-500" />
                            ) : (
                                <Search
                                    size={18}
                                    className={clsx(
                                        "transition-transform duration-300",
                                        isFocused && "scale-110",
                                        query && "text-amber-500"
                                    )}
                                />
                            )}
                        </div>

                        {/* اینپوت اصلی */}
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => {
                                setIsFocused(true);
                                if(query.length >= 2) setShowDropdown(true);
                            }}
                            onBlur={() => setIsFocused(false)}
                            placeholder={searchType === 'user' ? "جستجوی نام یا موبایل..." : "جستجوی محصول..."}
                            className="w-full pl-20 pr-10 py-3 bg-transparent outline-none text-sm transition-all"
                            style={{ color: 'var(--header-text)' }}
                        />

                        {/* دکمه پاک کردن */}
                        {query && (
                            <button
                                onClick={handleClear}
                                className="absolute left-3 flex items-center justify-center w-6 h-6 rounded-full bg-[var(--header-hover)] hover:bg-red-100 text-[var(--header-text-muted)] hover:text-red-500 transition-all duration-300 hover:scale-110 active:scale-90 group/clear"
                                type="button"
                                title="پاک کردن"
                            >
                                <X size={14} className="transition-transform group-hover/clear:rotate-90" />
                            </button>
                        )}

                        {/* شورتکات صفحه کلید */}
                        {!query && !isFocused && (
                            <div className="absolute left-3 flex items-center gap-1 text-xs">
                                <kbd className="px-1.5 py-0.5 bg-[var(--header-hover)] rounded text-[10px] font-mono border border-[var(--header-border)] shadow-sm"
                                    style={{ color: 'var(--header-text-muted)' }}
                                >
                                    {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
                                </kbd>
                                <kbd className="px-1.5 py-0.5 bg-[var(--header-hover)] rounded text-[10px] font-mono border border-[var(--header-border)] shadow-sm"
                                    style={{ color: 'var(--header-text-muted)' }}
                                >
                                    K
                                </kbd>
                            </div>
                        )}
                    </div>

                    {/* تگ "جستجوی سریع" در هاور */}
                    {!query && !isFocused && (
                        <div className="mt-20 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <Sparkles size={12} className="inline ml-1 text-amber-400" />
                            جستجوی سریع با Ctrl+K
                            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-800 rotate-45" />
                        </div>
                    )}
                </div>
            </div>

            {/* دراپ‌داون نتایج */}
            {showDropdown && query.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    {/* هدر نتایج */}
                    <div className="px-4 py-3 bg-gradient-to-l from-amber-50 to-transparent border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {searchType === 'product' ? (
                                <Package size={16} className="text-amber-500" />
                            ) : (
                                <User size={16} className="text-amber-500" />
                            )}
                            <span className="text-xs font-bold text-gray-600">
                                نتایج جستجو برای "{query}"
                            </span>
                        </div>
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                            {results.length} مورد
                        </span>
                    </div>

                    {/* لیست نتایج */}
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <Loader2 size={32} className="mx-auto mb-2 animate-spin text-amber-500" />
                            <p className="text-xs text-gray-400">در حال جستجو...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="max-h-96 overflow-y-auto py-2">
                            {results.map((result, index) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleResultClick(result.url)}
                                    className="w-full text-right px-3 py-2 hover:bg-gray-50 flex items-center gap-3 transition-all group relative"
                                >
                                    {/* خط جداکننده (بجز آخرین مورد) */}
                                    {index < results.length - 1 && (
                                        <div className="absolute bottom-0 right-12 left-3 h-px bg-gray-100" />
                                    )}

                                    {/* آیکون */}
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                                        {result.image ? (
                                            <img src={result.image} alt={result.title} className="w-full h-full object-cover" />
                                        ) : (
                                            result.type === 'user' ?
                                                <User size={20} className="text-gray-400" /> :
                                                <Package size={20} className="text-gray-400" />
                                        )}
                                    </div>

                                    {/* متن */}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-gray-800 text-sm truncate group-hover:text-amber-600 transition-colors">
                                            {result.title}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                                            {result.subtitle}
                                        </div>
                                    </div>

                                    {/* نوع نتیجه */}
                                    <div className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-500 group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
                                        {result.type === 'user' ? 'کاربر' : 'محصول'}
                                    </div>

                                    <ChevronRight size={16} className="text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                                <Search size={24} className="text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-600 mb-1">نتیجه‌ای یافت نشد</p>
                            <p className="text-xs text-gray-400">عبارت دیگری را جستجو کنید</p>
                        </div>
                    )}

                    {/* فوتر */}
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 flex items-center justify-between">
                        <span>برای انتخاب از کلیدهای ↑ ↓ استفاده کنید</span>
                        <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 text-gray-500">ESC</kbd>
                    </div>
                </div>
            )}
        </div>
    );
}
