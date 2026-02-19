import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import {
    TrendingUp, ShoppingBag, Users, Barcode, FileQuestion,
    Loader2, X, Eye, FileText
} from 'lucide-react';
import Pagination from '@/Components/Pagination';
import DashboardLayout from '@/Layouts/DashboardLayout';
import ReportFilters from './Partials/ReportFilters';
import clsx from 'clsx';
import type { PageProps } from '@/types';

// Import New Partials
import TransactionsTable from './Partials/TransactionsTable';
import RedemptionsTable from './Partials/RedemptionsTable';
import UsersTable from './Partials/UsersTable';
import ProductsTable from './Partials/ProductsTable';
import SurveysTable from './Partials/SurveysTable';

interface Props extends PageProps {
    data: {
        data: any[];
        links: any[];
        from: number;
    };
    filters: any;
    currentTab: string;
}

export default function AdminReports({ data, filters, currentTab }: Props) {
    // --- State Management ---
    const [params, setParams] = useState({
        tab: currentTab,
        search: filters.search || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        status: filters.status || 'all',
        type: filters.type || (currentTab === 'products' ? 'inventory' : 'all'),
        sort_by: filters.sort_by || 'created_at',
        sort_dir: filters.sort_dir || 'desc',
    });

    const [userStatsModal, setUserStatsModal] = useState<{
        show: boolean;
        data: any;
        loading: boolean;
    }>({ show: false, data: null, loading: false });

    // --- Effects ---
    useEffect(() => {
        setParams((prev) => ({
            ...prev,
            ...filters,
            tab: currentTab,
            type: filters.type || (currentTab === 'products' ? 'inventory' : 'all'),
        }));
    }, [filters, currentTab]);

    // --- Handlers ---
    const applyFilters = (newParams: any = {}) => {
        const queryParams = { ...params, ...newParams };
        setParams(queryParams);
        router.get(route('admin.reports.index'), queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSort = (field: string) => {
        const newDir = params.sort_by === field && params.sort_dir === 'desc' ? 'asc' : 'desc';
        applyFilters({ sort_by: field, sort_dir: newDir });
    };

    const handleTabChange = (tab: string) => {
        const defaultType = tab === 'products' ? 'inventory' : 'all';
        const newParams = {
            tab,
            search: '',
            status: 'all',
            type: defaultType,
            date_from: '',
            date_to: '',
            sort_by: 'created_at',
            sort_dir: 'desc',
        };
        setParams(newParams);
        router.get(route('admin.reports.index'), { ...newParams, page: 1 }, { preserveState: true });
    };

    const openUserStats = async (id: number) => {
        setUserStatsModal({ show: true, data: null, loading: true });
        try {
            const response = await axios.get(route('admin.reports.user_stats', id));
            setUserStatsModal({ show: true, data: response.data, loading: false });
        } catch (error) {
            console.error(error);
            alert('خطا در دریافت اطلاعات');
            setUserStatsModal({ show: false, data: null, loading: false });
        }
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'گزارشات و آمار' }]}>
            <Head title="گزارشات سیستم" />

            <div className="flex flex-col space-y-6">
                {/* Header & Tabs */}
                <div className="flex flex-col items-center justify-between gap-4 xl:flex-row">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-800">گزارشات جامع</h1>
                        <a href={route('admin.reports.dynamic')} className="flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 transition hover:bg-purple-100">
                            <FileText size={14} /> گزارش‌ساز پیشرفته
                        </a>
                    </div>
                    <div className="flex max-w-full overflow-x-auto rounded-xl border border-gray-100 bg-white p-1 shadow-sm hide-scrollbar">
                        <TabButton active={currentTab === 'transactions'} onClick={() => handleTabChange('transactions')} icon={TrendingUp} label="تراکنش‌ها" />
                        <TabButton active={currentTab === 'redemptions'} onClick={() => handleTabChange('redemptions')} icon={ShoppingBag} label="سفارشات" />
                        <TabButton active={currentTab === 'users'} onClick={() => handleTabChange('users')} icon={Users} label="کاربران" />
                        <TabButton active={currentTab === 'products'} onClick={() => handleTabChange('products')} icon={Barcode} label="محصولات" />
                        <TabButton active={currentTab === 'surveys'} onClick={() => handleTabChange('surveys')} icon={FileQuestion} label="نظرسنجی‌ها" />
                    </div>
                </div>

                {/* Filter Bar */}
                <ReportFilters
                    params={params}
                    setParams={setParams}
                    currentTab={currentTab}
                    onApply={() => applyFilters()}
                    onTypeChange={(type) => applyFilters({ type, page: 1 })}
                />

                {/* Data Tables */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {currentTab === 'transactions' && (
                        <TransactionsTable 
                            data={data.data} 
                            sort={{ sort_by: params.sort_by, sort_dir: params.sort_dir }} 
                            onSort={handleSort} 
                            from={data.from} 
                        />
                    )}

                    {currentTab === 'redemptions' && (
                        <RedemptionsTable 
                            data={data.data} 
                            sort={{ sort_by: params.sort_by, sort_dir: params.sort_dir }} 
                            onSort={handleSort} 
                            from={data.from} 
                        />
                    )}

                    {currentTab === 'users' && (
                        <UsersTable 
                            data={data.data} 
                            sort={{ sort_by: params.sort_by, sort_dir: params.sort_dir }} 
                            onSort={handleSort} 
                            from={data.from}
                            onShowStats={openUserStats}
                        />
                    )}

                    {currentTab === 'products' && (
                        <ProductsTable 
                            data={data.data} 
                            sort={{ sort_by: params.sort_by, sort_dir: params.sort_dir }} 
                            onSort={handleSort} 
                            from={data.from}
                            type={params.type}
                        />
                    )}

                    {currentTab === 'surveys' && (
                        <SurveysTable 
                            data={data.data} 
                            sort={{ sort_by: params.sort_by, sort_dir: params.sort_dir }} 
                            onSort={handleSort} 
                            from={data.from}
                        />
                    )}

                    {data.data.length === 0 && (
                        <div className="p-12 text-center text-gray-400">داده‌ای برای نمایش یافت نشد.</div>
                    )}
                </div>

                <Pagination links={data.links} />
            </div>

            {/* User Participation Modal */}
            {userStatsModal.show && (
                <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-5">
                            <h3 className="text-lg font-bold text-gray-800">
                                سوابق مسابقات: {userStatsModal.data?.user_name}
                            </h3>
                            <button onClick={() => setUserStatsModal({ ...userStatsModal, show: false })} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-0">
                            {userStatsModal.loading ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="animate-spin text-primary-600" size={32} />
                                </div>
                            ) : userStatsModal.data?.participations.length > 0 ? (
                                <table className="w-full text-right text-sm">
                                    <thead className="sticky top-0 bg-gray-50 text-gray-500">
                                        <tr>
                                            <th className="px-4 py-3">عنوان</th>
                                            <th className="px-4 py-3">نوع</th>
                                            <th className="px-4 py-3">تاریخ</th>
                                            <th className="px-4 py-3">نمره</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {userStatsModal.data.participations.map((p: any) => (
                                            <tr key={p.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-800">{p.title}</td>
                                                <td className="px-4 py-3 text-xs text-gray-500">{p.type}</td>
                                                <td className="px-4 py-3 text-xs text-gray-500">{p.date}</td>
                                                <td className="px-4 py-3 text-xs font-bold text-primary-600">{p.score}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-gray-500">این کاربر در هیچ مسابقه‌ای شرکت نکرده است.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
    <button
        onClick={onClick}
        className={clsx(
            'flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium whitespace-nowrap transition-all',
            active ? 'bg-primary-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50',
        )}
    >
        <Icon size={18} />
        {label}
    </button>
);