import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Layers, Plus, RefreshCw } from 'lucide-react';
import CategoryTable from './Partials/CategoryTable';
import CategoryModal from './Partials/CategoryModal';
import WpCategorySyncModal from './Partials/WpCategorySyncModal';

export default function AdminCategories({ categories, parents, flash }: any) {
    const [editingCat, setEditingCat] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [showWpModal, setShowWpModal] = useState(false);

    const openCreateModal = () => {
        setEditingCat(null);
        setShowModal(true);
    };

    const openEditModal = (cat: any) => {
        setEditingCat(cat);
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) {
            router.delete(route('admin.categories.destroy', id));
        }
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'مدیریت دسته‌بندی‌ها' }]}>
            <Head title="مدیریت دسته‌بندی‌ها" />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Layers className="text-primary-600" />
                    دسته‌بندی محصولات
                </h1>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowWpModal(true)}
                        className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition shadow-sm"
                    >
                        <RefreshCw size={18} />
                        بارگذاری از وردپرس
                    </button>
                    <button 
                        onClick={openCreateModal}
                        className="bg-primary-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary-700 shadow-lg transition"
                    >
                        <Plus size={20} />
                        دسته‌بندی جدید
                    </button>
                </div>
            </div>

            <CategoryTable 
                categories={categories} 
                onEdit={openEditModal} 
                onDelete={handleDelete} 
            />

            <CategoryModal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)} 
                category={editingCat} 
                categories={categories} // or parents if hierarchical needed for selection
            />

            <WpCategorySyncModal 
                isOpen={showWpModal} 
                onClose={() => setShowWpModal(false)} 
            />
        </DashboardLayout>
    );
}