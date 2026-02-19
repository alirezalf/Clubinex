import React from 'react';
import { Package, Barcode, FileText, Loader2 } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import { router } from '@inertiajs/react';

interface Product {
    id: number;
    title: string;
    model_name: string;
    image_url: string;
    points_value: number;
    category: {
        title: string;
    };
}

interface Props {
    products: { data: Product[], links: any[], total: number, from: number, to: number };
    isLoading: boolean;
}

export default function ProductGrid({ products, isLoading }: Props) {
    
    // Handle card click: Go to Advanced Registration (Invoice)
    const handleCardClick = (productId: number) => {
        router.get(route('products.create'), {
            mode: 'advanced',
            product_id: productId
        });
    };

    // Handle Quick Button click: Go to Simple Registration (Serial)
    const handleQuickRegister = (e: React.MouseEvent, productId: number) => {
        e.stopPropagation(); // Prevent card click
        router.get(route('products.create'), {
            mode: 'simple',
            // We can also assume simple form doesn't need ID, but if it does:
            // product_id: productId 
        });
    };

    return (
        <div className="space-y-6 relative min-h-[400px]">
            
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-start justify-center pt-32 rounded-3xl">
                    <div className="bg-white p-4 rounded-2xl shadow-lg flex items-center gap-3">
                        <Loader2 className="animate-spin text-primary-600" size={24} />
                        <span className="text-sm font-medium text-gray-700">در حال بارگذاری...</span>
                    </div>
                </div>
            )}

            {products.data.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400 flex flex-col items-center">
                    <Package size={48} className="mb-4 opacity-20" />
                    <p className="font-medium">محصولی یافت نشد.</p>
                    <p className="text-xs mt-1">لطفاً جستجو یا دسته‌بندی را تغییر دهید.</p>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center px-1">
                        <span className="text-xs text-gray-500">
                            نمایش {products.from} تا {products.to} از {products.total} محصول
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.data.map(product => (
                            <div 
                                key={product.id} 
                                onClick={() => handleCardClick(product.id)}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg hover:border-primary-100 transition-all duration-300 cursor-pointer flex flex-col h-full relative"
                            >
                                {/* Hover Indicator */}
                                <div className="absolute inset-0 border-2 border-primary-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"></div>

                                {/* Image Container */}
                                <div className="h-48 bg-gray-50 relative flex items-center justify-center p-6 overflow-hidden">
                                    {product.image_url ? (
                                        <img 
                                            src={product.image_url} 
                                            alt={product.title} 
                                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-300">
                                            <Package size={48} />
                                        </div>
                                    )}
                                    
                                    {/* Points Badge */}
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-primary-700 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm border border-primary-100 z-10">
                                        {product.points_value.toLocaleString()} امتیاز
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-1">
                                        {product.category?.title || 'بدون دسته'}
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-sm mb-2 leading-snug line-clamp-2 min-h-[40px]" title={product.title}>
                                        {product.title}
                                    </h3>
                                    
                                    <div className="mt-auto pt-3 flex items-center justify-between gap-2 border-t border-gray-50">
                                        <span className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-0.5 rounded truncate max-w-[50%]">
                                            {product.model_name || '-'}
                                        </span>
                                        
                                        {/* Quick Register Button */}
                                        <button 
                                            onClick={(e) => handleQuickRegister(e, product.id)}
                                            className="text-xs bg-gray-100 text-gray-600 hover:bg-primary-600 hover:text-white px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1 z-20 relative"
                                            title="ثبت سریال سریع"
                                        >
                                            <Barcode size={14} />
                                            <span>ثبت سریال</span>
                                        </button>
                                    </div>
                                    
                                    {/* Implicit Action Hint */}
                                    <div className="mt-2 text-center text-[10px] text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                        <FileText size={12} />
                                        کلیک برای ثبت فاکتور
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center pb-8">
                        <Pagination links={products.links} />
                    </div>
                </>
            )}
        </div>
    );
}