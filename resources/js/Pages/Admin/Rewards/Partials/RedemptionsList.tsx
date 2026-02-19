import React, { useState } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import { Search, Filter, Truck, AlertCircle, Loader2, UserCheck, Eye, X, Settings } from 'lucide-react';
import PersianDatePicker from '@/Components/PersianDatePicker';
import Pagination from '@/Components/Pagination';
import { PaginatedData } from '@/types';

interface Redemption {
    id: number;
    user: { id: number; first_name: string; last_name: string; mobile: string };
    reward: { title: string; image: string | null } | null;
    points_spent: number;
    status: string;
    status_farsi: string;
    tracking_code: string | null;
    admin_note: string | null;
    created_at_jalali: string;
    admin_name: string | null;
    reward_title: string;
    delivery_info: any;
}

interface Props {
    redemptions: PaginatedData<Redemption>;
    filters: any;
}

export default function RedemptionsList({ redemptions, filters }: Props) {
    const [params, setParams] = useState({
        tab: 'redemptions',
        search: filters?.search || '',
        status: filters?.status || 'all',
        date_from: filters?.date_from || '',
        date_to: filters?.date_to || '',
    });

    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [selectedRedemption, setSelectedRedemption] = useState<Redemption | null>(null);

    const { data: statusData, setData: setStatusData, post: statusPost, processing: statusProcessing, reset: statusReset } = useForm({
        status: '',
        admin_note: '',
        tracking_code: ''
    });

    const applyFilters = () => {
        router.get(route('admin.rewards.index'), params, { 
            preserveState: true,
            preserveScroll: true 
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') applyFilters();
    };

    const openStatusModal = (redemption: Redemption) => {
        setSelectedRedemption(redemption);
        setStatusData({
            status: redemption.status,
            admin_note: redemption.admin_note || '',
            tracking_code: redemption.tracking_code || ''
        });
        setStatusModalOpen(true);
    };

    const submitStatus = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRedemption) return;

        statusPost(route('admin.rewards.status', selectedRedemption.id), {
            onSuccess: () => {
                setStatusModalOpen(false);
                statusReset();
                setSelectedRedemption(null);
            }
        });
    };

    return (
        <>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
                <div className="lg:col-span-2">
                    <label className="text-xs font-bold text-gray-500 mb-1 block">جستجو</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="کد رهگیری، نام کاربر، موبایل..." 
                            value={params.search}
                            onChange={e => setParams({...params, search: e.target.value})}
                            onKeyDown={handleKeyDown}
                            className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        />
                        <Search size={16} className="absolute right-3 top-3 text-gray-400" />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">وضعیت</label>
                    <select 
                        value={params.status}
                        onChange={e => setParams({...params, status: e.target.value})}
                        className="w-full py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm"
                    >
                        <option value="all">همه</option>
                        <option value="pending">در انتظار</option>
                        <option value="processing">در حال پردازش</option>
                        <option value="completed">تکمیل شده</option>
                        <option value="rejected">رد شده</option>
                    </select>
                </div>

                <div>
                    <PersianDatePicker 
                        label="از تاریخ"
                        value={params.date_from}
                        onChange={(date) => setParams({...params, date_from: date})}
                        placeholder="تاریخ..."
                    />
                </div>

                <div className="flex">
                    <button 
                        onClick={applyFilters}
                        className="w-full bg-primary-600 text-white py-2 rounded-xl hover:bg-primary-700 transition flex justify-center items-center gap-2 text-sm font-bold shadow-lg shadow-primary-500/20 h-[42px]"
                    >
                        <Filter size={16} />
                        فیلتر
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4">کاربر</th>
                                <th className="px-6 py-4">جایزه</th>
                                <th className="px-6 py-4">وضعیت / پیگیری</th>
                                <th className="px-6 py-4">مسئول پیگیری</th>
                                <th className="px-6 py-4">تاریخ</th>
                                <th className="px-6 py-4">عملیات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {redemptions.data.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-bold">{item.user.first_name} {item.user.last_name}</div>
                                        <div className="text-xs text-gray-500">{item.user.mobile}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{item.reward_title}</div>
                                        <div className="text-xs text-gray-500">{item.points_spent > 0 ? item.points_spent + ' امتیاز' : 'بدون هزینه (گردونه)'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-2 py-1 rounded text-xs w-fit ${
                                                item.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {item.status_farsi}
                                            </span>
                                            {item.tracking_code && (
                                                <span className="text-xs text-gray-600 font-mono bg-gray-50 px-1 rounded border border-gray-100 w-fit">
                                                    کد: {item.tracking_code}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-600">
                                        {item.admin_name ? (
                                            <div className="flex items-center gap-1">
                                                <UserCheck size={14} className="text-primary-600" />
                                                {item.admin_name}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{item.created_at_jalali}</td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <button 
                                            onClick={() => openStatusModal(item)}
                                            className="text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition border border-transparent hover:border-primary-100"
                                            title="مدیریت وضعیت"
                                        >
                                            <Settings size={18} />
                                        </button>
                                        <Link 
                                            href={route('admin.rewards.user_history', { id: item.user.id, from: 'rewards' })}
                                            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                                            title="مشاهده سوابق کاربر"
                                        >
                                            <Eye size={18} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {redemptions.data.length === 0 && <div className="p-8 text-center text-gray-500">درخواستی وجود ندارد.</div>}
            </div>
            <Pagination links={redemptions.links} />

            {statusModalOpen && selectedRedemption && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">مدیریت درخواست #{selectedRedemption.id}</h3>
                            <button onClick={() => setStatusModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        
                        <form onSubmit={submitStatus} className="p-6 space-y-4">
                            <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-2 border border-gray-200">
                                <div className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <Truck size={16} /> اطلاعات ارسال:
                                </div>
                                {selectedRedemption.delivery_info ? (
                                    Object.entries(selectedRedemption.delivery_info).map(([key, value]: any) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="text-gray-500">{key}:</span>
                                            <span className="text-gray-800 font-medium">{value}</span>
                                        </div>
                                    ))
                                ) : <span className="text-gray-400 italic">اطلاعاتی ثبت نشده است</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت جدید</label>
                                <select 
                                    value={statusData.status}
                                    onChange={e => setStatusData('status', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="pending">در انتظار بررسی</option>
                                    <option value="processing">در حال آماده‌سازی</option>
                                    <option value="completed">تکمیل / ارسال شده</option>
                                    <option value="rejected">رد شده (برگشت امتیاز)</option>
                                </select>
                            </div>

                            {statusData.status === 'rejected' && (
                                <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    با انتخاب وضعیت "رد شده"، امتیاز کسر شده به حساب کاربر بازگردانده می‌شود.
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">کد رهگیری (اختیاری)</label>
                                <input 
                                    type="text" 
                                    value={statusData.tracking_code}
                                    onChange={e => setStatusData('tracking_code', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    placeholder="مثلا کد پستی"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">یادداشت مدیر</label>
                                <textarea value={statusData.admin_note} onChange={e => setStatusData('admin_note', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} placeholder="علت رد یا توضیحات تکمیلی..."></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setStatusModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">انصراف</button>
                                <button disabled={statusProcessing} className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 flex items-center gap-2">
                                    {statusProcessing && <Loader2 className="animate-spin" size={18} />}
                                    {statusProcessing ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}