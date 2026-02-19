import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Layers, ChevronRight, Circle, ChevronDown, X, FolderOpen } from 'lucide-react';
import clsx from 'clsx';

interface Category {
    id: number;
    title: string;
    slug: string;
    children?: Category[];
}

interface Props {
    categories: Category[];
    activeCategory?: number;
    isOpenMobile: boolean;
    onCloseMobile: () => void;
}

export default function CategorySidebar({ categories, activeCategory, isOpenMobile, onCloseMobile }: Props) {
    // Determine initially open categories based on active selection
    const getInitialOpenState = () => {
        if (!activeCategory) return [];
        // Find parent of active category to open it
        const parent = categories.find(c => c.children?.some(child => child.id == activeCategory));
        return parent ? [parent.id] : [];
    };

    const [openCategories, setOpenCategories] = useState<number[]>(getInitialOpenState());

    const toggleCategory = (id: number) => {
        setOpenCategories(prev => 
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const isActive = (id: number) => activeCategory == id;

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                    <Layers size={18} className="text-primary-600" />
                    دسته‌بندی محصولات
                </h3>
                {/* Mobile Close Button */}
                <button onClick={onCloseMobile} className="lg:hidden text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>
            </div>
            
            <div className="p-2 flex-1 overflow-y-auto scrollbar-thin">
                <Link
                    href={route('products.index')}
                    className={clsx(
                        "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors",
                        !activeCategory ? "bg-primary-50 text-primary-700 font-bold" : "text-gray-600 hover:bg-gray-50"
                    )}
                >
                    <div className={clsx("w-2 h-2 rounded-full", !activeCategory ? "bg-primary-500" : "bg-gray-300")}></div>
                    همه محصولات
                </Link>

                <div className="space-y-1">
                    {categories.map(cat => {
                        const hasChildren = cat.children && cat.children.length > 0;
                        const isOpen = openCategories.includes(cat.id);
                        const isCatActive = isActive(cat.id);

                        return (
                            <div key={cat.id} className="space-y-1">
                                <div className="flex items-center justify-between w-full rounded-lg hover:bg-gray-50 transition-colors pr-1">
                                    <Link
                                        href={route('products.index', { category_id: cat.id })}
                                        className={clsx(
                                            "flex-1 py-2 px-2 text-sm font-medium flex items-center gap-2",
                                            isCatActive ? "text-primary-700 font-bold" : "text-gray-700"
                                        )}
                                    >
                                        <FolderOpen size={16} className={clsx(isCatActive ? "text-primary-500" : "text-gray-400")} />
                                        {cat.title}
                                    </Link>
                                    
                                    {hasChildren && (
                                        <button 
                                            onClick={(e) => { e.preventDefault(); toggleCategory(cat.id); }}
                                            className="p-2 text-gray-400 hover:text-primary-600"
                                        >
                                            <ChevronDown size={14} className={clsx("transition-transform duration-200", isOpen ? "rotate-180" : "")} />
                                        </button>
                                    )}
                                </div>
                                
                                {/* Children (Collapsible) */}
                                {hasChildren && (
                                    <div className={clsx(
                                        "overflow-hidden transition-all duration-300 ease-in-out",
                                        isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                                    )}>
                                        <div className="pr-4 border-r border-gray-100 mr-3 space-y-1 py-1">
                                            {cat.children!.map(child => (
                                                <Link
                                                    key={child.id}
                                                    href={route('products.index', { category_id: child.id })}
                                                    className={clsx(
                                                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors",
                                                        isActive(child.id) ? "text-primary-600 font-bold bg-primary-50/50" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                                                    )}
                                                >
                                                    <Circle size={6} className={clsx(isActive(child.id) ? "fill-primary-600 text-primary-600" : "text-gray-300")} />
                                                    {child.title}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24 h-[calc(100vh-120px)]">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar (Drawer) */}
            {isOpenMobile && (
                <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onCloseMobile}></div>
                    
                    {/* Drawer Content */}
                    <div className="relative w-72 bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300">
                        <SidebarContent />
                    </div>
                </div>
            )}
        </>
    );
}