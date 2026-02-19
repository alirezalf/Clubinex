import React from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Pagination from '@/Components/Pagination';
import { PageProps } from '@/types';
import { Inbox, CheckCircle, Archive, LayoutList, RefreshCcw, Headset } from 'lucide-react';
import clsx from 'clsx';
import TicketsTable from './Partials/TicketsTable';

interface Ticket {
    id: number;
    subject: string;
    status: string;
    status_farsi: string;
    priority: string;
    department: string;
    user: { id: number; first_name: string; last_name: string; mobile: string };
    created_at_jalali: string;
}

interface Props extends PageProps {
    tickets: { data: Ticket[]; links: any[] };
    filters: { status?: string };
}

export default function AdminTickets({ tickets, filters }: Props) {
    const currentStatus = filters.status || 'open';

    const handleFilterChange = (status: string) => {
        router.get(route('admin.tickets.index'), { status }, { 
            preserveState: true,
            preserveScroll: true 
        });
    };

    const tabs = [
        { id: 'open', label: 'نیاز به پاسخ (Badge)', icon: Inbox, color: 'text-red-600', bg: 'bg-red-50' },
        { id: 'active', label: 'تمام تیکت‌های باز', icon: RefreshCcw, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'answered', label: 'پاسخ داده شده', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        { id: 'closed', label: 'بسته شده', icon: Archive, color: 'text-gray-500', bg: 'bg-gray-100' },
        { id: 'all', label: 'تاریخچه کل تیکت‌ها', icon: LayoutList, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <DashboardLayout breadcrumbs={[{ label: 'مدیریت تیکت‌ها' }]}>
            <Head title="پنل مدیریت | پشتیبانی" />

            <div className="flex flex-col space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                            <div className="p-2 bg-primary-100 rounded-xl">
                                <Headset className="text-primary-600" size={28} />
                            </div>
                            مدیریت تیکت‌های پشتیبانی
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 mr-12">پاسخگویی و مدیریت درخواست‌های کاربران سیستم.</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex bg-white p-1.5 rounded-[1.5rem] shadow-sm border border-gray-100 overflow-x-auto no-print scrollbar-none">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleFilterChange(tab.id)}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap",
                                currentStatus === tab.id 
                                    ? "bg-primary-600 text-white shadow-xl shadow-primary-500/30" 
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                            )}
                        >
                            <tab.icon size={18} className={clsx(currentStatus === tab.id ? "text-white" : tab.color)} /> 
                            {tab.label}
                            {tab.id === 'open' && (
                                <span className={clsx(
                                    "px-1.5 py-0.5 rounded-lg text-[10px] font-black",
                                    currentStatus === 'open' ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
                                )}>
                                    بج
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100 flex flex-col min-h-[500px]">
                    <TicketsTable tickets={tickets.data} />
                    
                    {tickets.data.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <div className="bg-gray-50 p-6 rounded-full mb-4">
                                <Inbox size={64} className="text-gray-200" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-700">موردی یافت نشد</h3>
                            <p className="text-sm text-gray-400 mt-1">تیکتی با فیلتر انتخاب شده وجود ندارد.</p>
                        </div>
                    )}
                </div>

                <Pagination links={tickets.links} />
            </div>
        </DashboardLayout>
    );
}