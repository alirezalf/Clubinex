import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Book, Shield, Settings, Server, Users, Code, Search, ChevronRight, FileText, Lock, Sparkles, Terminal } from 'lucide-react';
import clsx from 'clsx';
import * as LucideIcons from 'lucide-react';

interface Article {
    id: number;
    help_category_id: number;
    title: string;
    slug: string;
    content: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    color: string;
    bg: string;
    articles: Article[];
}

export default function HelpIndex({ isAdmin, categories }: { isAdmin: boolean, categories: Category[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<number | null>(null);

    // Extract all articles flat
    const allArticles = useMemo(() => {
        let list: Article[] = [];
        categories.forEach(cat => {
            if (cat.articles) {
                list = [...list, ...cat.articles];
            }
        });
        return list;
    }, [categories]);

    // فیلتر کردن مقالات
    const filteredArticles = useMemo(() => {
        return allArticles.filter(article => {
            const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 article.content.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory ? article.help_category_id === activeCategory : true;
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, activeCategory, allArticles]);

    const activeArticleObj = allArticles.find(a => a.id === selectedArticle);

    const getIcon = (iconName: string | null) => {
        if (!iconName) return FileText;

        // Convert dash-case to PascalCase
        const pascalName = iconName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
        const IconComponent = (LucideIcons as any)[pascalName];
        return IconComponent || FileText;
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'راهنمای سیستم', url: '#' }]}>
            <Head title="مرکز آموزش و مستندات" />

            <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">

                {/* بخش سایدبار راهنما */}
                <div className="w-full md:w-80 flex flex-col gap-4 bg-white/50 backdrop-blur-md border border-gray-200 rounded-3xl p-5 shadow-sm">
                    {/* جستجو */}
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="جستجو در آموزش‌ها..."
                            className="w-full pl-4 pr-10 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* دسته‌بندی‌ها */}
                    <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                        <button
                            onClick={() => { setActiveCategory(null); setSelectedArticle(null); }}
                            className={clsx(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-right text-sm font-bold",
                                activeCategory === null ? "bg-primary-500 text-white shadow-md shadow-primary-500/20" : "hover:bg-gray-100 text-gray-600"
                            )}
                        >
                            <Book size={18} />
                            همه مقالات
                        </button>

                        {categories.map(category => {
                            const IconCmp = getIcon(category.icon);
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => { setActiveCategory(category.id); setSelectedArticle(null); }}
                                    className={clsx(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-right text-sm font-bold",
                                        activeCategory === category.id
                                            ? `${category.bg} ${category.color} shadow-sm border border-${category.color.split('-')[1]}-200`
                                            : "hover:bg-gray-50 text-gray-600 border border-transparent"
                                    )}
                                >
                                    <IconCmp size={18} className={activeCategory === category.id ? '' : 'opacity-60'} />
                                    {category.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* بخش محتوای اصلی */}
                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    {selectedArticle ? (
                        /* نمایش یک مقاله مشخص */
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <button
                                onClick={() => setSelectedArticle(null)}
                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6 transition"
                            >
                                <ChevronRight size={16} />
                                بازگشت به لیست
                            </button>

                            <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                                {activeArticleObj?.title}
                            </h1>

                            <div className="prose max-w-none prose-primary text-gray-800 leading-8">
                                {/* ما از رندر سفارشی برای متن استفاده کردیم */}
                                {activeArticleObj && contentRenderer(activeArticleObj.content)}
                            </div>
                        </div>
                    ) : (
                        /* نمایش لیست مقالات (گرید) */
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-gray-50/50">
                            <div className="flex items-center gap-3 mb-8">
                                <Sparkles className="text-amber-500" size={24} />
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {activeCategory ? categories.find(c => c.id === activeCategory)?.name : 'تمامی مستندات نرم‌افزار'}
                                </h2>
                            </div>

                            {filteredArticles.length === 0 ? (
                                <div className="text-center py-20">
                                    <Search className="mx-auto text-gray-300 mb-4" size={48} />
                                    <p className="text-gray-500 font-medium">هیچ مقاله‌ای با این کلمات یافت نشد.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredArticles.map(article => {
                                        const cat = categories.find(c => c.id === article.help_category_id);
                                        return (
                                            <div
                                                key={article.id}
                                                onClick={() => setSelectedArticle(article.id)}
                                                className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-primary-200 transition cursor-pointer group flex flex-col h-full"
                                            >
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className={clsx("p-2 rounded-xl shrink-0 text-white shadow-sm", cat?.color.replace('text-', 'bg-') || 'bg-gray-500')}>
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block", cat?.bg, cat?.color)}>
                                                            {cat?.name}
                                                        </span>
                                                        <h3 className="font-bold text-gray-800 group-hover:text-primary-600 transition leading-tight">
                                                            {article.title}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 line-clamp-2 mt-auto pt-2 border-t border-gray-50">
                                                    {article.content.substring(0, 100)}...
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

// کامپوننت کمکی برای رندر کردن کدها و عکس‌ها
const contentRenderer = (content: string) => {
    const parts = content.split('```');
    return parts.map((part, index) => {
        if (index % 2 === 1) {
            // بلوک کد
            const lines = part.trim().split('\n');
            const lang = lines[0];
            const code = lines.slice(1).join('\n');
            return (
                <div key={index} className="my-4 rounded-2xl overflow-hidden bg-[#1e1e1e] border border-gray-700 shadow-xl group" dir="ltr">
                    <div className="bg-[#2d2d2d] px-4 py-2 flex items-center gap-2 border-b border-gray-700">
                        <Terminal size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-400 font-mono uppercase font-bold">{lang}</span>
                    </div>
                    <pre className="p-4 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed">
                        <code>{code}</code>
                    </pre>
                </div>
            );
        } else {
            // متن عادی
            return (
                <div key={index} className="space-y-4 text-[15px]">
                    {part.split('\n').map((line, i) => {
                        let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        formattedLine = formattedLine.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded-md text-red-500 font-mono text-sm border border-gray-200 select-all">$1</code>');

                        // Handle Markdown Image: ![Alt text](/path/to/img.jpg)
                        const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
                        if (imgMatch) {
                           const [, alt, src] = imgMatch;
                           return <div key={i} className="my-4"><img src={src} alt={alt} className="w-full max-w-2xl mx-auto rounded-xl shadow-lg border border-gray-200" /></div>;
                        }

                        if (line.startsWith('- ')) {
                            return <li key={i} className="mr-4 text-gray-700 list-disc marker:text-primary-500" dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }} />;
                        }

                        if (line.startsWith('### ')) {
                            return <h3 key={i} className="text-lg font-bold text-gray-800 mt-6 mb-2 border-b border-gray-100 pb-2 flex items-center gap-2" dangerouslySetInnerHTML={{ __html: formattedLine.substring(4) }} />;
                        }

                        if (line.trim() === '') return null;
                        return <p key={i} className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
                    }).filter(Boolean)}
                </div>
            );
        }
    });
};
