import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Pagination from '@/Components/Pagination';
import { PageProps } from '@/types';
import { Search, CheckCircle, XCircle, Truck, Package, AlertTriangle, Loader2 } from 'lucide-react';

interface Redemption {
    id: number;
    user: {
        first_name: string;
        last_name: string;
        mobile: string;
    };
    reward: {
        title: string;
        type: string;
    };
    points_spent: number;
    status: string;
    status_farsi: string;
    created_at_jalali: string;
    delivery_info: any;
    admin_note: string;
    tracking_code: string;
}

type Props = PageProps<{
    redemptions: {
        data: Redemption[];
        links: any[];
    };
}>;

export default function AdminRedemptions({ redemptions }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        status: '',
        admin_note: '',
        tracking_code: ''
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRedemption, setSelectedRedemption] = useState<Redemption | null>(null);

    const openModal = (redemption: Redemption) => {
        setSelectedRedemption(redemption);
        setData({
            status: redemption.status,
            admin_note: redemption.admin_note || '',
            tracking_code: redemption.tracking_code || ''
        });
        setModalOpen(true);
    };

    const submitStatus = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRedemption) return;

        post(route('admin.rewards.status', selectedRedemption.id), {
            onSuccess: () => {
                setModalOpen(false);
                reset();
                setSelectedRedemption(null);
            },
            preserveScroll: true
        });
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'مدیریت درخواست‌های جایزه' }]}>
            <Head title="مدیریت جوایز" />

            {/* Inline Flash Removed */}

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="font-bold text-lg text-gray-800">لیست درخواست‌ها</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4">شناسه</th>
                                <th className="px-6 py-4">کاربر</th>
                                <th className="px-6 py-4">جایزه</th>
                                <th className="px-6 py-4">وضعیت</th>
                                <th className="px-6 py-4">تاریخ</th>
                                <th className="px-6 py-4">عملیات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {redemptions.data.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-gray-500">#{item.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800">{item.user.first_name} {item.user.last_name}</div>
                                        <div className="text-xs text-gray-500">{item.user.mobile}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-700">{item.reward.title}</div>
                                        <div className="text-xs text-gray-500">{item.points_spent} امتیاز</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                            item.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            item.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {item.status_farsi}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{item.created_at_jalali}</td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => openModal(item)}
                                            className="text-primary-600 hover:bg-primary-50 px-4 py-1.5 rounded-lg transition border border-transparent hover:border-primary-100 bg-primary-50/50"
                                        >
                                            مدیریت
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {redemptions.data.length === 0 && (
                    <div className="p-8 text-center text-gray-500">موردی یافت نشد.</div>
                )}
            </div>
            
            <Pagination links={redemptions.links} />

            {/* Modal */}
            {modalOpen && selectedRedemption && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg">مدیریت درخواست #{selectedRedemption.id}</h3>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        
                        <form onSubmit={submitStatus} className="p-6 space-y-4">
                            {/* Delivery Info Display */}
                            <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-2 border border-gray-200">
                                <div className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <Truck size={16} />
                                    اطلاعات ارسال:
                                </div>
                                {selectedRedemption.delivery_info ? (
                                    Object.entries(selectedRedemption.delivery_info).map(([key, value]: any) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="text-gray-500">{key}:</span>
                                            <span className="text-gray-800 font-medium">{value}</span>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-gray-400 italic">اطلاعاتی ثبت نشده است</span>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت جدید</label>
                                <select 
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                    className="w-full border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="pending">در انتظار بررسی</option>
                                    <option value="processing">در حال آماده‌سازی</option>
                                    <option value="completed">تکمیل / ارسال شده</option>
                                    <option value="rejected">رد شده (برگشت امتیاز)</option>
                                </select>
                            </div>

                            {data.status === 'rejected' && (
                                <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg flex items-center gap-2">
                                    <AlertTriangle size={16} />
                                    با انتخاب وضعیت "رد شده"، امتیاز کسر شده به حساب کاربر بازگردانده می‌شود.
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">کد رهگیری (اختیاری)</label>
                                <input 
                                    type="text" 
                                    value={data.tracking_code}
                                    onChange={e => setData('tracking_code', e.target.value)}
                                    className="w-full border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="مثلا کد پستی"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">یادداشت مدیر</label>
                                <textarea 
                                    value={data.admin_note}
                                    onChange={e => setData('admin_note', e.target.value)}
                                    className="w-full border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                                    rows={3}
                                    placeholder="علت رد یا توضیحات تکمیلی..."
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">انصراف</button>
                                <button 
                                    type="submit" 
                                    disabled={processing} 
                                    className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-lg transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            در حال ذخیره...
                                        </>
                                    ) : (
                                        'ذخیره تغییرات'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}