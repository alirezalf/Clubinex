import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Eye, Edit, CheckCircle, ShieldBan, User, Trash2 } from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import type { PageProps, PaginatedData } from '@/types';
import DataTable, { Column } from '@/Components/Table/DataTable';
import Pagination from '@/Components/Pagination';

// Import Partials
import CreateUserModal from './Partials/CreateUserModal';
import EditUserModal from './Partials/EditUserModal';
import BulkActionModal from './Partials/BulkActionModal';
import UserFilters from './Partials/UserFilters';
import UserBulkFloatingBar from './Partials/UserBulkFloatingBar';
import ConfirmModal from '@/Components/ConfirmModal';

interface AdminUser {
    id: number;
    first_name: string;
    last_name: string;
    mobile: string;
    email: string | null;
    avatar: string | null;
    club: { id: number; name: string; color: string } | null;
    current_points: number;
    status_id: number;
    status: { name: string; color: string; slug: string } | null;
    last_login_at: string | null;
    last_login_at_jalali: string;
    roles: { name: string }[];
    direct_permissions?: string[];
}

interface FilterParams {
    search?: string;
    role?: string;
    club?: string;
    sort_by?: string;
    sort_dir?: string;
}

interface Props extends PageProps {
    users: PaginatedData<AdminUser>;
    clubs: { id: number; name: string }[];
    roles: { id: number; name: string }[];
    statuses: { id: number; name: string }[];
    allPermissions: Record<string, any[]>; // Grouped permissions
    filters: FilterParams;
}

export default function AdminUsers({ users, clubs, roles, statuses, allPermissions, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [clubFilter, setClubFilter] = useState(filters.club || 'all');

    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Bulk Action States
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkActionType, setBulkActionType] = useState<'change_status' | 'change_club' | 'send_message' | null>(null);

    // Confirm Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'danger' as 'danger' | 'warning',
        action: () => {}
    });

    // همگام‌سازی استیت با فیلترهای سرور
    useEffect(() => {
        setSearch(filters.search || '');
        setRoleFilter(filters.role || 'all');
        setClubFilter(filters.club || 'all');
    }, [filters]);

    const performSearch = (val: string) => {
        router.get(
            route('admin.users'),
            {
                search: val,
                role: roleFilter !== 'all' ? roleFilter : null,
                club: clubFilter !== 'all' ? clubFilter : null,
                sort_by: filters.sort_by,
                sort_dir: filters.sort_dir,
            },
            { preserveState: true, replace: true }
        );
    };

    const applyFilters = () => {
        router.get(
            route('admin.users'),
            {
                search,
                role: roleFilter !== 'all' ? roleFilter : null,
                club: clubFilter !== 'all' ? clubFilter : null,
                sort_by: filters.sort_by,
                sort_dir: filters.sort_dir,
            },
            { preserveState: true }
        );
    };

    const handleSort = (field: string) => {
        const newDir = filters.sort_by === field && filters.sort_dir === 'desc' ? 'asc' : 'desc';
        router.get(
            route('admin.users'),
            {
                ...filters,
                search,
                role: roleFilter !== 'all' ? roleFilter : null,
                club: clubFilter !== 'all' ? clubFilter : null,
                sort_by: field,
                sort_dir: newDir,
            },
            { preserveState: true }
        );
    };

    const handleStatusToggle = (user: AdminUser) => {
        const isBanned = user.status?.slug === 'banned';
        
        setConfirmModal({
            isOpen: true,
            title: isBanned ? 'فعال‌سازی کاربر' : 'مسدودسازی کاربر',
            message: isBanned 
                ? 'آیا از رفع مسدودی این کاربر اطمینان دارید؟' 
                : 'آیا از مسدود کردن این کاربر اطمینان دارید؟ دسترسی او به سیستم قطع خواهد شد.',
            type: isBanned ? 'warning' : 'danger',
            action: () => router.post(
                route('admin.users.toggle-status', user.id),
                {},
                { 
                    preserveScroll: true,
                    onFinish: () => setConfirmModal(prev => ({...prev, isOpen: false}))
                }
            )
        });
    };

    // --- Bulk Action Handlers ---
    const handleSelect = (id: number | string) => {
        const numericId = Number(id);
        setSelectedIds(prev => 
            prev.includes(numericId) 
                ? prev.filter(item => item !== numericId) 
                : [...prev, numericId]
        );
    };

    const handleToggleAll = (selectAll: boolean) => {
        if (selectAll) {
            const currentIds = users.data.map(user => user.id);
            const newSelection = [...new Set([...selectedIds, ...currentIds])];
            setSelectedIds(newSelection);
        } else {
            const currentIds = users.data.map(user => user.id);
            setSelectedIds(prev => prev.filter(id => !currentIds.includes(id)));
        }
    };

    // --- Column Definitions ---
    const columns: Column<AdminUser>[] = [
        {
            key: 'user',
            label: 'کاربر',
            sortable: true,
            render: (user) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 text-xs font-bold overflow-hidden shrink-0 border border-primary-100">
                        {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User size={16} />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-sm">{user.first_name} {user.last_name}</span>
                        <span className="text-[11px] text-gray-400">{user.email || '---'}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'mobile',
            label: 'موبایل',
            sortable: true,
            className: 'text-left font-mono text-gray-600',
            render: (user) => <span dir="ltr">{user.mobile}</span>
        },
        {
            key: 'club',
            label: 'باشگاه',
            render: (user) => user.club ? (
                <span
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: user.club.color || '#9ca3af' }}
                >
                    {user.club.name}
                </span>
            ) : <span className="text-gray-400 text-xs">بدون عضویت</span>
        },
        {
            key: 'current_points',
            label: 'امتیاز',
            sortable: true,
            render: (user) => <span className="font-black text-gray-700 font-mono">{(user.current_points || 0).toLocaleString()}</span>
        },
        {
            key: 'last_login_at',
            label: 'آخرین ورود',
            sortable: true,
            className: 'text-center',
            render: (user) => <span className="text-gray-500 text-xs dir-ltr font-mono">{user.last_login_at_jalali}</span>
        },
        {
            key: 'status',
            label: 'وضعیت',
            className: 'text-center',
            render: (user) => {
                const isBanned = user.status?.slug === 'banned';
                const isActive = user.status?.slug === 'active';
                return (
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${isActive ? 'bg-green-50 text-green-700 border border-green-100' : (isBanned ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-gray-100 text-gray-600')}`}>
                        {user.status?.name || 'نامشخص'}
                    </span>
                )
            }
        },
        {
            key: 'actions',
            label: 'عملیات',
            className: 'text-center',
            render: (user) => (
                <div className="flex items-center justify-center gap-2">
                    <Link
                        href={route('admin.rewards.user_history', { id: user.id, from: 'users' })}
                        className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition border border-transparent hover:border-purple-100"
                        title="سوابق جامع"
                    >
                        <Eye size={16} />
                    </Link>
                    <button
                        onClick={() => setEditingUser(user)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition border border-transparent hover:border-blue-100"
                        title="ویرایش و دسترسی‌ها"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => handleStatusToggle(user)}
                        className={`p-1.5 rounded-lg transition border border-transparent ${user.status?.slug === 'banned' ? 'text-green-600 hover:bg-green-50 hover:border-green-100' : 'text-red-600 hover:bg-red-50 hover:border-red-100'}`}
                        title={user.status?.slug === 'banned' ? 'فعال‌سازی' : 'مسدود کردن'}
                    >
                        {user.status?.slug === 'banned' ? <CheckCircle size={16} /> : <ShieldBan size={16} />}
                    </button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout breadcrumbs={[{ label: 'مدیریت کاربران' }]}>
            <Head title="مدیریت کاربران" />

            <div className="mb-6 space-y-4">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">
                        مدیریت کاربران
                    </h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition active:scale-95"
                    >
                        <Plus size={18} /> کاربر جدید
                    </button>
                </div>

                <UserFilters
                    search={search}
                    setSearch={setSearch}
                    onSearch={performSearch}
                    roleFilter={roleFilter}
                    setRoleFilter={setRoleFilter}
                    clubFilter={clubFilter}
                    setClubFilter={setClubFilter}
                    onApply={applyFilters}
                    roles={roles}
                    clubs={clubs}
                />
            </div>

            <DataTable
                data={users.data}
                columns={columns}
                sort={{
                    field: filters.sort_by || 'created_at',
                    direction: (filters.sort_dir as 'asc' | 'desc') || 'desc'
                }}
                onSort={handleSort}
                from={users.from}
                emptyMessage="کاربری با این مشخصات یافت نشد."
                selectable={true}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onToggleAll={handleToggleAll}
            />

            <Pagination links={users.links} />

            <UserBulkFloatingBar 
                count={selectedIds.length}
                onAction={setBulkActionType}
                onClear={() => setSelectedIds([])}
            />

            <CreateUserModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                clubs={clubs}
                roles={roles}
            />

            <EditUserModal
                user={editingUser}
                onClose={() => setEditingUser(null)}
                clubs={clubs}
                roles={roles}
                allPermissions={allPermissions}
            />

            <BulkActionModal
                isOpen={!!bulkActionType}
                onClose={() => setBulkActionType(null)}
                selectedIds={selectedIds}
                actionType={bulkActionType}
                clubs={clubs}
                statuses={statuses}
                onSuccess={() => setSelectedIds([])}
            />

            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.action}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
            />
        </DashboardLayout>
    );
}