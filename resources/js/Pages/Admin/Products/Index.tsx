import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Pagination from '@/Components/Pagination';
import { Plus, RefreshCw, Box, FileText } from 'lucide-react';
import SearchInput from '@/Components/SearchInput';
import { PageProps, PaginatedData, Product, ProductRegistration } from '@/types';

import ProductTable from './Partials/ProductTable';
import RegistrationTable from './Partials/RegistrationTable';
import CreateProductModal from './Partials/CreateProductModal';
import ImportSerialsModal from './Partials/ImportSerialsModal';
import WpProductSyncModal from './Partials/WpProductSyncModal';
import ManageSerialsModal from './Partials/ManageSerialsModal';
import RegistrationReviewModal from './Partials/RegistrationReviewModal';

interface Category {
    id: number;
    title: string;
}

interface FilterParams {
    search?: string;
}

interface Props extends PageProps {
    products: PaginatedData<Product>;
    registrations: PaginatedData<ProductRegistration>;
    categories: Category[];
    filters: FilterParams;
}

export default function AdminProductsIndex({ products, registrations, categories, filters }: Props) {
    const params = new URLSearchParams(window.location.search);
    const initialTab = (params.get('tab') as 'inventory' | 'registrations') || 'inventory';
    
    const [activeTab, setActiveTab] = useState<'inventory' | 'registrations'>(initialTab);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [isLoading, setIsLoading] = useState(false);
    
    // Modals State
    const [showProductModal, setShowProductModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showWpModal, setShowWpModal] = useState(false);
    const [showSerialModal, setShowSerialModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedRegistration, setSelectedRegistration] = useState<ProductRegistration | null>(null);

    // همگام‌سازی استیت جستجو با فیلترهای دریافتی از سرور (برای دکمه‌های بازگشت مرورگر)
    useEffect(() => {
        setSearchQuery(filters?.search || '');
    }, [filters?.search]);

    // همگام‌سازی تب با URL
    useEffect(() => {
        const currentTab = params.get('tab');
        if (currentTab && (currentTab === 'inventory' || currentTab === 'registrations')) {
            setActiveTab(currentTab);
        }
    }, []);

    const performSearch = (query: string) => {
        setIsLoading(true);
        // هنگام جستجو، صفحه را به 1 برمی‌گردانیم (رفتار طبیعی جستجو)
        router.get(route('admin.products.index'), 
            { tab: activeTab, search: query },
            { 
                preserveState: true, 
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
                replace: true 
            }
        );
    };

    const switchTab = (tab: 'inventory' | 'registrations') => {
        setActiveTab(tab);
        // هنگام تغییر تب، جستجو حفظ می‌شود اما صفحه ریست می‌شود
        router.get(route('admin.products.index'), 
            { tab: tab, search: searchQuery },
            { preserveState: true, preserveScroll: true }
        );
    };

    // --- Actions ---

    const openCreateModal = () => {
        setSelectedProduct(null);
        setShowProductModal(true);
    };

    const openEditModal = (product: Product) => {
        setSelectedProduct(product);
        setShowProductModal(true);
    };

    const openImportModal = (product: Product) => {
        setSelectedProduct(product);
        setShowImportModal(true);
    };

    const openSerialModal = (product: Product) => {
        setSelectedProduct(product);
        setShowSerialModal(true);
    };

    const openReviewModal = (reg: ProductRegistration) => {
        setSelectedRegistration(reg);
        setShowReviewModal(true);
    }

    const handleDelete = (id: number) => {
        if(confirm('آیا از حذف این محصول اطمینان دارید؟ توجه: اگر محصول سریال استفاده شده داشته باشد حذف نمی‌شود.')) {
            router.delete(route('admin.products.destroy', id), {
                preserveScroll: true
            });
        }
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'مدیریت محصولات' }]}>
            <Head title="مدیریت محصولات" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-black text-gray-800 tracking-tight">مدیریت محصولات و درخواست‌ها</h1>
                
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowWpModal(true)}
                        className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition shadow-sm text-sm font-medium"
                    >
                        <RefreshCw size={18} />
                        وردپرس
                    </button>
                    <button 
                        onClick={openCreateModal}
                        className="bg-primary-600 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition text-sm font-bold"
                    >
                        <Plus size={20} />
                        افزودن
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 md:flex-row items-end md:items-center shadow-sm mb-6">
                <div className="relative flex-1 w-full">
                    <SearchInput 
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onSearch={performSearch}
                        placeholder="جستجو در نام، مدل یا سریال..."
                        loading={isLoading}
                    />
                </div>
                
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button 
                        onClick={() => switchTab('inventory')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'inventory' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Box size={16} />
                        موجودی
                    </button>
                    <button 
                        onClick={() => switchTab('registrations')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'registrations' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <FileText size={16} />
                        درخواست‌ها
                        {registrations.data.filter((r) => r.status === 'pending').length > 0 && (
                            <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[9px] animate-pulse">
                                {registrations.data.filter((r) => r.status === 'pending').length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Content Based on Tab */}
            {activeTab === 'inventory' && (
                <>
                    <ProductTable 
                        products={products}
                        onImportSerial={openImportModal}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                        onManageSerials={openSerialModal}
                    />
                    <Pagination links={products.links} />
                </>
            )}

            {activeTab === 'registrations' && (
                <>
                    <RegistrationTable 
                        registrations={registrations}
                        onReview={openReviewModal}
                    />
                    <Pagination links={registrations.links} />
                </>
            )}

            {/* Modals */}
            <CreateProductModal 
                isOpen={showProductModal} 
                onClose={() => setShowProductModal(false)}
                categories={categories}
                product={selectedProduct}
            />

            <ImportSerialsModal 
                isOpen={showImportModal} 
                onClose={() => setShowImportModal(false)}
                selectedProduct={selectedProduct}
            />

            <ManageSerialsModal 
                isOpen={showSerialModal}
                onClose={() => setShowSerialModal(false)}
                productId={selectedProduct?.id}
                productTitle={selectedProduct?.title}
            />

            <WpProductSyncModal 
                isOpen={showWpModal} 
                onClose={() => setShowWpModal(false)} 
            />

            <RegistrationReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                registration={selectedRegistration}
            />

        </DashboardLayout>
    );
}