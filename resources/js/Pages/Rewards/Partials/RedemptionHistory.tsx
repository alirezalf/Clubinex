import React from 'react';
import { Gift, CheckCircle2, Truck, Clock, XCircle, Package } from 'lucide-react';
import clsx from 'clsx';

interface Redemption {
    id: number;
    reward: {
        title: string;
        image: string | null;
    };
    points_spent: number;
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    status_farsi: string;
    tracking_code: string | null;
    admin_note: string | null;
    created_at_jalali: string;
}

interface Props {
    redemptions: Redemption[];
    onSwitchToStore: () => void;
}

export default function RedemptionHistory({ redemptions, onSwitchToStore }: Props) {
    if (redemptions.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center text-gray-500">
                <Package size={48} className="mx-auto mb-4 text-gray-300" />
                <p>شما هنوز هیچ جایزه‌ای دریافت نکرده‌اید.</p>
                <button onClick={onSwitchToStore} className="text-primary-600 hover:underline mt-2 text-sm font-bold">
                    مشاهده فروشگاه جوایز
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-6 py-4">جایزه</th>
                            <th className="px-6 py-4">امتیاز پرداختی</th>
                            <th className="px-6 py-4">وضعیت</th>
                            <th className="px-6 py-4">اطلاعات پیگیری</th>
                            <th className="px-6 py-4">تاریخ درخواست</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {redemptions.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-gray-50 border flex items-center justify-center overflow-hidden shrink-0">
                                            {item.reward && item.reward.image ? (
                                                <img src={item.reward.image} alt={item.reward.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <Gift size={20} className="text-gray-400" />
                                            )}
                                        </div>
                                        <span className="font-bold text-gray-800">{item.reward ? item.reward.title : 'جایزه حذف شده'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-700">
                                    {item.points_spent.toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className={clsx(
                                        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold",
                                        item.status === 'completed' && "bg-green-100 text-green-700",
                                        item.status === 'rejected' && "bg-red-100 text-red-700",
                                        item.status === 'processing' && "bg-blue-100 text-blue-700",
                                        item.status === 'pending' && "bg-yellow-100 text-yellow-700",
                                    )}>
                                        {item.status === 'completed' && <CheckCircle2 size={12} />}
                                        {item.status === 'rejected' && <XCircle size={12} />}
                                        {item.status === 'processing' && <Truck size={12} />}
                                        {item.status === 'pending' && <Clock size={12} />}
                                        {item.status_farsi}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        {item.tracking_code && (
                                            <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded w-fit font-mono">
                                                کد رهگیری: {item.tracking_code}
                                            </div>
                                        )}
                                        {item.admin_note && (
                                            <div className="text-xs text-gray-500 max-w-xs truncate" title={item.admin_note}>
                                                {item.admin_note}
                                            </div>
                                        )}
                                        {!item.tracking_code && !item.admin_note && <span className="text-gray-400 text-xs">-</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-xs">
                                    {item.created_at_jalali}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}