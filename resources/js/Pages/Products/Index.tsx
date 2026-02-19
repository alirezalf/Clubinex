import { Head, Link, router } from '@inertiajs/react';
import { Box, CheckCircle, Barcode, Package, Filter, Trash2, Edit } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import type { PageProps } from '@/types';
import CategorySidebar from './Partials/CategorySidebar';
import ProductGrid from './Partials/ProductGrid';
import SearchInput from '@/Components/SearchInput';

interface Product {
    id: number;
    title: string;
    model_name: string;
    description: string;
    image_url: string;
    points_value: number;
    category: {
        title: string;
    };
}

interface Category {
    id: number;
    title: string;
    slug: string;
    children?: Category[];
}

interface RegisteredProduct {
    id: number;
    type: 'serial' | 'registration';
    serial_code: string;
    product_title: string;
    product_model: string;
    product_image: string;
    points_earned: number;
    registered_at: string;
    status: string;
    status_farsi: string;
    admin_note?: string;
    can_delete: boolean;
    can_edit: boolean;
}

interface Props extends PageProps {
    products: {
        data: Product[];
        links: any[];
        total: number;
        from: number;
        to: number;
    };
    categories: Category[];
    filters: any;
    myProducts: RegisteredProduct[];
}

export default function ProductsIndex({
    products,
    categories,
    filters,
    myProducts,
}: Props) {
    const [activeTab, setActiveTab] = useState<'catalog' | 'my_products'>(
        'catalog',
    );
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setSearchQuery(filters.search || '');
    }, [filters.search]);

    const handleSearch = (query: string) => {
        setIsLoading(true);
        router.get(
            route('products.index'),
            { ...filters, search: query },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
                replace: true,
            },
        );
    };

    useEffect(() => {
        setShowMobileSidebar(false);
    }, [filters]);
    
    const handleDeleteRegistration = (id: number) => {
        if(confirm('آیا از حذف این درخواست اطمینان دارید؟')) {
             router.delete(route('products.registrations.destroy', id), {
                 preserveScroll: true
             });
        }
    };
    
    const handleEditRegistration = (id: number) => {
        router.get(route('products.registrations.edit', id));
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'محصولات و امتیازات' }]}>
            <Head title="محصولات و ثبت امتیاز" />

            <div className="flex flex-col gap-4 mb-6">
                
                <div className="flex rounded-xl border border-gray-100 bg-white p-1 shadow-sm md:w-fit self-start">
                    <button
                        onClick={() => setActiveTab('catalog')}
                        className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition ${activeTab === 'catalog' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Box size={18} />
                        کاتالوگ محصولات
                    </button>
                    <button
                        onClick={() => setActiveTab('my_products')}
                        className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition ${activeTab === 'my_products' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <CheckCircle size={18} />
                        محصولات من{' '}
                        <span className="rounded-md bg-white/20 px-1.5 text-xs font-bold">
                            {myProducts.length}
                        </span>
                    </button>
                </div>

                {activeTab === 'catalog' && (
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1 bg-white rounded-2xl border border-gray-100 p-2 shadow-sm">
                            <SearchInput
                                value={searchQuery}
                                onChange={setSearchQuery}
                                onSearch={handleSearch}
                                placeholder="جستجو در محصولات (نام، مدل، برند)..."
                                loading={isLoading}
                                className="w-full"
                            />
                        </div>
                        
                        <button
                            onClick={() => setShowMobileSidebar(true)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:w-auto lg:hidden"
                        >
                            <Filter size={18} />
                            دسته‌بندی‌ها
                        </button>
                    </div>
                )}
            </div>

            {activeTab === 'catalog' && (
                <div className="relative flex flex-col items-start gap-6 lg:flex-row">
                    <CategorySidebar
                        categories={categories}
                        activeCategory={filters.category_id}
                        isOpenMobile={showMobileSidebar}
                        onCloseMobile={() => setShowMobileSidebar(false)}
                    />

                    <div className="w-full min-w-0 flex-1">
                        <ProductGrid
                            products={products}
                            isLoading={isLoading} 
                        />
                    </div>
                </div>
            )}

            {activeTab === 'my_products' && (
                <div className="animate-in fade-in overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    {myProducts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">محصول</th>
                                        <th className="px-6 py-4">کد سریال</th>
                                        <th className="px-6 py-4">نوع ثبت</th>
                                        <th className="px-6 py-4">امتیاز</th>
                                        <th className="px-6 py-4">وضعیت</th>
                                        <th className="px-6 py-4">تاریخ</th>
                                        <th className="px-6 py-4">عملیات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {myProducts.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="transition hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-gray-50">
                                                        {item.product_image ? (
                                                            <img
                                                                src={
                                                                    item.product_image
                                                                }
                                                                alt={
                                                                    item.product_title
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <Package
                                                                size={20}
                                                                className="text-gray-400"
                                                            />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-800">
                                                            {item.product_title}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {item.product_model}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-gray-600">
                                                <span className="rounded border border-gray-200 bg-gray-50 px-2 py-1">
                                                    {item.serial_code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500">
                                                {item.type === 'serial'
                                                    ? 'سیستمی (آنی)'
                                                    : 'درخواست دستی'}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-green-600">
                                                {item.points_earned > 0
                                                    ? `+${item.points_earned}`
                                                    : '---'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-block min-w-[80px] rounded px-2 py-1 text-center text-xs ${
                                                        item.status ===
                                                        'approved'
                                                            ? 'bg-green-100 text-green-700'
                                                            : item.status ===
                                                                'rejected'
                                                              ? 'bg-red-100 text-red-700'
                                                              : 'bg-yellow-100 text-yellow-700'
                                                    }`}
                                                >
                                                    {item.status_farsi}
                                                </span>
                                                {item.status === 'rejected' &&
                                                    item.admin_note && (
                                                        <div
                                                            className="mt-1 max-w-[150px] truncate text-[10px] text-red-500"
                                                            title={
                                                                item.admin_note
                                                            }
                                                        >
                                                            {item.admin_note}
                                                        </div>
                                                    )}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500">
                                                {item.registered_at}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {item.can_edit && (
                                                        <button 
                                                            onClick={() => handleEditRegistration(item.id)}
                                                            className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition"
                                                            title="ویرایش درخواست"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                    )}
                                                    {item.can_delete && (
                                                        <button 
                                                            onClick={() => handleDeleteRegistration(item.id)}
                                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                                                            title="حذف درخواست"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-16 text-center text-gray-500">
                            <Box
                                size={48}
                                className="mx-auto mb-4 text-gray-300"
                            />
                            <p>شما هنوز هیچ محصولی ثبت نکرده‌اید.</p>
                            <Link
                                href={route('products.create')}
                                className="mt-2 inline-block font-bold text-primary-600 hover:underline"
                            >
                                ثبت اولین محصول
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
}