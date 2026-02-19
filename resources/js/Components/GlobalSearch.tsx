import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Package, User, ChevronRight } from 'lucide-react';
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
    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // بستن دراپ‌داون با کلیک بیرون
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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
    };

    const handleResultClick = (url: string) => {
        setShowDropdown(false);
        setQuery(''); // پاک کردن جستجو بعد از انتخاب
        router.visit(url);
    };

    return (
        <div ref={containerRef} className={clsx("relative w-full z-50", className)}>
            <div className="flex gap-2">
                {/* انتخابگر نوع جستجو (فقط برای ادمین) */}
                {isAdmin && (
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value as any)}
                        className="bg-white/50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 focus:ring-2 focus:ring-primary-500/20 cursor-pointer px-3 py-2.5 outline-none h-[42px] shrink-0"
                    >
                        <option value="product">محصول</option>
                        <option value="user">کاربر</option>
                    </select>
                )}

                {/* فیلد ورودی */}
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                        {isLoading ? <Loader2 size={18} className="animate-spin text-primary-500" /> : <Search size={18} />}
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => {
                            if(query.length >= 2) setShowDropdown(true);
                        }}
                        placeholder={searchType === 'user' ? "جستجوی نام یا موبایل..." : "جستجوی محصول..."}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm bg-white/80 backdrop-blur-sm"
                    />
                    {query && (
                        <button
                            onClick={handleClear}
                            className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* دراپ‌داون نتایج */}
            {showDropdown && query.length >= 2 && (
                <div className="absolute top-full right-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-400 text-xs">در حال جستجو...</div>
                    ) : results.length > 0 ? (
                        <div className="py-2">
                            <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1">
                                نتایج یافت شده ({results.length})
                            </div>
                            {results.map((result) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleResultClick(result.url)}
                                    className="w-full text-right px-3 py-2 hover:bg-gray-50 flex items-center gap-3 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                        {result.image ? (
                                            <img src={result.image} alt={result.title} className="w-full h-full object-cover" />
                                        ) : (
                                            result.type === 'user' ? <User size={20} className="text-gray-400" /> : <Package size={20} className="text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-gray-800 text-sm truncate group-hover:text-primary-600 transition-colors">
                                            {result.title}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {result.subtitle}
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-400">
                            <Search size={32} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm">نتیجه‌ای یافت نشد.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}