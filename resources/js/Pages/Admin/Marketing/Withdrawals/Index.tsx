import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    CreditCard, Search, Filter, CheckCircle,
    XCircle, Clock, Eye, Download, Wallet
} from 'lucide-react';
import Pagination from '@/Components/Pagination';

export default function WithdrawalsIndex({ withdrawals, filters }: any) {
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
    const [actionType, setActionType] = useState<string>('');
    const { data, setData, post, processing, errors, reset } = useForm({
        status: '',
        admin_note: ''
    });

    const handleSearch = (e: any) => {
        e.preventDefault();
        router.get(route('admin.withdrawals.index'), { search: e.target.search.value, status: filters.status }, { preserveState: true });
    };

    const handleStatusFilter = (e: any) => {
        router.get(route('admin.withdrawals.index'), { status: e.target.value, search: filters.search }, { preserveState: true });
    };

    const openActionModal = (withdrawal: any, type: string) => {
        setSelectedWithdrawal(withdrawal);
        setActionType(type);
        setData({
            status: type === 'approve' ? 'approved' : (type === 'reject' ? 'rejected' : 'paid'),
            admin_note: withdrawal.admin_note || ''
        });
    };

    const submitAction = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.withdrawals.update_status', selectedWithdrawal.id), {
            onSuccess: () => {
                setSelectedWithdrawal(null);
                reset();
            }
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1 w-fit"><Clock size={14}/> در انتظار بررسی</span>;
            case 'approved':
                return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center gap-1 w-fit"><CheckCircle size={14}/> تایید شده (در صف پرداخت)</span>;
            case 'paid':
                return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center gap-1 w-fit"><CheckCircle size={14}/> پرداخت شده</span>;
            case 'rejected':
                return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center gap-1 w-fit"><XCircle size={14}/> رد شده</span>;
            default: return status;
        }
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'امور مالی', url: '#' }, { label: 'درخواست‌های برداشت وجه' }]}>
            <Head title="مدیریت برداشت وجه" />

            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold border-none text-gray-800">درخواست‌های برداشت وجه</h1>
                        <p className="text-sm text-gray-500">مدیریت درخواست‌های تسویه حساب کاربران</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <form onSubmit={handleSearch} className="flex-1 w-full sm:max-w-md relative">
                    <input
                        type="text"
                        name="search"
                        defaultValue={filters.search}
                        placeholder="جستجوی کاربر (نام، موبایل)..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                </form>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="text-gray-400" size={20} />
                    <select
                        value={filters.status || 'all'}
                        onChange={handleStatusFilter}
                        className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500 pr-8"
                    >
                        <option value="all">همه وضعیت‌ها</option>
                        <option value="pending">در انتظار بررسی</option>
                        <option value="approved">تایید شده</option>
                        <option value="paid">پرداخت شده</option>
                        <option value="rejected">رد شده</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                            <tr>
                                <th className="px-6 py-4 font-medium">کاربر</th>
                                <th className="px-6 py-4 font-medium">مبلغ (تومان)</th>
                                <th className="px-6 py-4 font-medium">اطلاعات حساب</th>
                                <th className="px-6 py-4 font-medium">وضعیت</th>
                                <th className="px-6 py-4 font-medium">تاریخ ثبت</th>
                                <th className="px-6 py-4 font-medium text-center">عملیات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {withdrawals.data.map((item: any) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs">
                                                {item.user?.first_name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800 text-sm">{item.user?.first_name} {item.user?.last_name}</div>
                                                <div className="text-xs text-gray-500 font-mono" dir="ltr">{item.user?.mobile}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold font-mono text-gray-800 dir-ltr inline-block">
                                            {Number(item.amount).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-gray-800">
                                            <span className="text-gray-500 font-medium">بانک:</span> {item.bank_name}
                                        </div>
                                        <div className="text-xs text-gray-800 font-mono tracking-wider mt-1">
                                            {item.card_number}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(item.status)}
                                    </td>
                                    <td className="px-6 py-4 text-xs tracking-wide text-gray-500">
                                        {new Date(item.created_at).toLocaleDateString('fa-IR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => openActionModal(item, 'view')}
                                                className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 hover:bg-gray-100 rounded-md transition"
                                                title="مشاهده جزئیات"
                                            >
                                                <Eye size={18} />
                                            </button>

                                            {item.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => openActionModal(item, 'approve')}
                                                        className="text-blue-500 hover:text-blue-600 p-1 bg-blue-50 hover:bg-blue-100 rounded-md transition"
                                                        title="تایید درخواست"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => openActionModal(item, 'reject')}
                                                        className="text-red-500 hover:text-red-600 p-1 bg-red-50 hover:bg-red-100 rounded-md transition"
                                                        title="رد درخواست"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}

                                            {item.status === 'approved' && (
                                                <button
                                                    onClick={() => openActionModal(item, 'pay')}
                                                    className="text-green-500 hover:text-green-600 p-1 bg-green-50 hover:bg-green-100 rounded-md transition"
                                                    title="تایید نهایی پرداخت رسید"
                                                >
                                                    <CreditCard size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {withdrawals.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        هیچ درخواستی یافت نشد!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {withdrawals.data.length > 0 && (
                <div className="mt-6 flex justify-center">
                    <Pagination links={withdrawals.links} />
                </div>
            )}

            {/* Action Modal */}
            {selectedWithdrawal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 relative z-50">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">
                                    {actionType === 'view' ? 'جزئیات درخواست برداشت وجه' :
                                     actionType === 'approve' ? 'تایید درخواست برداشت' :
                                     actionType === 'pay' ? 'ثبت پرداخت موفق' :
                                     'رد درخواست برداشت'}
                               </h3>
                                <button onClick={() => setSelectedWithdrawal(null)} className="text-gray-400 hover:text-gray-600">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-gray-500">کاربر:</span> <span className="font-bold">{selectedWithdrawal.user?.first_name} {selectedWithdrawal.user?.last_name}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">مبلغ درخواست:</span> <span className="font-bold text-lg text-primary-600">{Number(selectedWithdrawal.amount).toLocaleString()} تومان</span></div>
                                <div className="border-t border-gray-200 my-2 pt-2"></div>
                                <div className="flex justify-between"><span className="text-gray-500">صاحب حساب:</span> <span>{selectedWithdrawal.account_holder}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">بانک:</span> <span>{selectedWithdrawal.bank_name}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">شماره کارت:</span> <span className="font-mono tracking-widest">{selectedWithdrawal.card_number}</span></div>
                                {selectedWithdrawal.iban_number && (
                                    <div className="flex justify-between"><span className="text-gray-500">شماره شبا:</span> <span className="font-mono tracking-widest">{selectedWithdrawal.iban_number}</span></div>
                                )}
                                <div className="border-t border-gray-200 my-2 pt-2"></div>
                                <div className="flex justify-between"><span className="text-gray-500">وضعیت فعلی:</span> <span>{getStatusBadge(selectedWithdrawal.status)}</span></div>
                            </div>

                            {actionType !== 'view' && (
                                <form onSubmit={submitAction}>
                                    <div className="mb-4">
                                        <label className="block text-sm text-gray-700 mb-1">توضیحات / علت (اختیاری):</label>
                                        <textarea
                                            rows={3}
                                            className="w-full border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 mt-1"
                                            placeholder={actionType === 'reject' ? "علت رد درخواست (به کاربر نمایش داده می‌شود)" : "یادداشت پرداخت (مثلا: کد رهگیری واریز پایا)"}
                                            value={data.admin_note}
                                            onChange={e => setData('admin_note', e.target.value)}
                                        ></textarea>
                                        {errors.admin_note && <div className="text-red-500 text-xs mt-1">{errors.admin_note}</div>}
                                    </div>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedWithdrawal(null)}
                                            className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                                        >
                                            انصراف
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className={`px-6 py-2 text-white font-bold rounded-xl transition ${
                                                actionType === 'approve' ? 'bg-blue-600 hover:bg-blue-700' :
                                                actionType === 'pay' ? 'bg-green-600 hover:bg-green-700' :
                                                'bg-red-600 hover:bg-red-700'
                                            }`}
                                        >
                                            {actionType === 'approve' ? 'تایید و ارسال به حسابداری' :
                                             actionType === 'pay' ? 'ثبت تراکنش موفق' :
                                             'رد و برگشت وجه'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {actionType === 'view' && (
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedWithdrawal(null)}
                                        className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                                    >
                                        بستن
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
