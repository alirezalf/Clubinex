import { Head, router } from '@inertiajs/react';
import { Shield, Plus } from 'lucide-react';
import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import type { PageProps } from '@/types';
import RoleCard from './Partials/RoleCard';
import RoleModal from './Partials/RoleModal';
import ConfirmModal from '@/Components/ConfirmModal';

interface Role {
    id: number;
    name: string;
    permissions: { id: number, name: string }[];
}

interface Permission {
    id: number;
    name: string;
}

type Props = PageProps<{
    roles: Role[];
    permissions: Permission[];
}>;

export default function RolesIndex({ roles, permissions }: Props) {
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        id: 0
    });

    const openCreateModal = () => {
        setEditingRole(null);
        setShowModal(true);
    };

    const openEditModal = (role: Role) => {
        setEditingRole(role);
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        setConfirmModal({ isOpen: true, id });
    };

    const confirmDelete = () => {
        router.delete(route('admin.roles.destroy', confirmModal.id), {
            onFinish: () => setConfirmModal({ isOpen: false, id: 0 })
        });
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'مدیریت دسترسی‌ها' }]}>
            <Head title="مدیریت دسترسی‌ها" />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">نقش‌ها و سطوح دسترسی</h1>
                <button 
                    onClick={openCreateModal}
                    className="bg-primary-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition font-bold text-sm"
                >
                    <Plus size={20} />
                    نقش جدید
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map(role => (
                    <RoleCard 
                        key={role.id} 
                        role={role} 
                        onEdit={openEditModal} 
                        onDelete={handleDelete} 
                    />
                ))}
            </div>

            <RoleModal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)} 
                role={editingRole} 
                allPermissions={permissions} 
            />

            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: 0 })}
                onConfirm={confirmDelete}
                title="حذف نقش"
                message="آیا از حذف این نقش کاربری اطمینان دارید؟ این عملیات غیرقابل بازگشت است و ممکن است دسترسی کاربران دارای این نقش را مختل کند."
            />
        </DashboardLayout>
    );
}