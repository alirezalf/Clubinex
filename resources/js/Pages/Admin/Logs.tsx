import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Pagination from '@/Components/Pagination';
import PersianDatePicker from '@/Components/PersianDatePicker';
import { Activity, Search, User, Filter, X } from 'lucide-react';
import clsx from 'clsx';

// لیست عملیات‌ها برای فیلتر
const ACTION_GROUPS = [
    { value: 'all', label: 'همه عملیات‌ها' },
    { value: 'user', label: 'مدیریت کاربران' },
    { value: 'system', label: 'سیستمی' },
    { value: 'product', label: 'محصولات' },
    { value: 'point', label: 'امتیازات' },
    { value: 'reward', label: 'جوایز' },
    { value: 'sms', label: 'پیامک' },
    { value: 'email', label: 'ایمیل' },
    { value: 'club', label: 'باشگاه' },
];

export default function AdminLogs({ logs, filters }: any) {
    const [search, setSearch] = useState(filters?.search || '');
    const [date, setDate] = useState(filters?.date || '');
    const [hour, setHour] = useState(filters?.hour || '');
    const [action, setAction] = useState(filters?.action || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.logs'), { 
            search, 
            date, 
            hour: hour !== '' ? hour : null, 
            action: action !== 'all' ? action : null 
        }, { preserveState: true });
    };

    const clearFilters = () => {
        setSearch('');
        setDate('');
        setHour('');
        setAction('all');
        router.get(route('admin.logs'));
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'لاگ‌های سیستم' }]}>
            <Head title="لاگ‌های سیستم" />

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        <Activity size={20} className="text-primary-600" />
                        فعالیت‌های سیستم
                    </h2>
                    {(search || date || hour || action !== 'all') && (
                        <button 
                            onClick={clearFilters}
                            className="text-xs text-red-500 flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition"
                        >
                            <X size={14} /> پاک کردن فیلترها
                        </button>
                    )}
                </div>

                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    {/* Search Input */}
                    <div className="md:col-span-2 relative">
                        <label className="text-xs font-bold text-gray-500 mb-1 block">جستجو</label>
                        <input
                            type="text"
                            placeholder="متن توضیحات، نام کاربر..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        />
                        <Search size={16} className="absolute right-3 top-8 text-gray-400" />
                    </div>

                    {/* Date Picker */}
                    <div>
                        <PersianDatePicker 
                            label="تاریخ"
                            value={date}
                            onChange={setDate}
                            placeholder="انتخاب تاریخ"
                        />
                    </div>

                    {/* Hour Picker */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block">ساعت (تقریبی)</label>
                        <select 
                            value={hour}
                            onChange={e => setHour(e.target.value)}
                            className="w-full py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm dir-ltr bg-white"
                            disabled={!date} // ساعت فقط وقتی تاریخ انتخاب شده فعال باشد
                        >
                            <option value="">همه ساعات</option>
                            {Array.from({ length: 24 }).map((_, i) => (
                                <option key={i} value={i}>
                                    {String(i).padStart(2, '0')}:00 - {String(i).padStart(2, '0')}:59
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Action Filter */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block">نوع عملیات</label>
                        <select 
                            value={action}
                            onChange={e => setAction(e.target.value)}
                            className="w-full py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm bg-white"
                        >
                            {ACTION_GROUPS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Submit Button */}
                    <div className="md:col-span-5 flex justify-end mt-2">
                        <button className="bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700 transition flex items-center gap-2 shadow-lg shadow-primary-500/20">
                            <Filter size={16} />
                            اعمال فیلتر
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 w-16 text-center">#</th>
                                <th className="px-6 py-4">کاربر</th>
                                <th className="px-6 py-4">عملیات</th>
                                <th className="px-6 py-4">توضیحات</th>
                                <th className="px-6 py-4">IP</th>
                                <th className="px-6 py-4">تاریخ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.data.map((log: any) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-center text-gray-400 font-mono">{log.id}</td>
                                    <td className="px-6 py-4 font-bold">
                                        {log.user ? (
                                            <Link 
                                                href={route('admin.users', { search: log.user.mobile })} 
                                                className="flex items-center gap-2 text-primary-600 hover:underline hover:text-primary-800 transition"
                                                title="مشاهده کاربر در لیست کاربران"
                                            >
                                                <User size={14} />
                                                {log.user.first_name} {log.user.last_name}
                                            </Link>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic flex items-center gap-1">
                                                <Activity size={12} /> سیستم / مهمان
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={clsx(
                                            "px-2 py-1 rounded text-[10px] font-mono border",
                                            log.action_group === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 
                                            log.action_group === 'user' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            'bg-gray-50 text-gray-600 border-gray-200'
                                        )}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={log.description}>
                                        {log.description}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">{log.ip_address}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs dir-ltr text-right">
                                        {log.created_at_jalali}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {logs.data.length === 0 && <div className="p-12 text-center text-gray-400">هیچ فعالیتی با این مشخصات یافت نشد.</div>}
            </div>
            
            <Pagination links={logs.links} />
        </DashboardLayout>
    );
}