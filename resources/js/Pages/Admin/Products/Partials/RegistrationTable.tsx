import React from 'react';
import { Eye, CheckCircle2, Clock, XCircle, User } from 'lucide-react';

interface Props {
    registrations: { data: any[] };
    onReview: (reg: any) => void;
}

export default function RegistrationTable({ registrations, onReview }: Props) {
    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-6 py-4">کاربر</th>
                            <th className="px-6 py-4">محصول اظهار شده</th>
                            <th className="px-6 py-4">کد سریال</th>
                            <th className="px-6 py-4">تاریخ درخواست</th>
                            <th className="px-6 py-4">وضعیت</th>
                            <th className="px-6 py-4">عملیات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {registrations.data.map((reg: any) => (
                            <tr key={reg.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800">{reg.user?.first_name} {reg.user?.last_name}</div>
                                            <div className="text-xs text-gray-500">{reg.user?.mobile}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-800">{reg.product_name}</div>
                                    <div className="text-xs text-gray-500">{reg.product_model}</div>
                                </td>
                                <td className="px-6 py-4 font-mono text-gray-600 text-xs bg-gray-50 px-2 py-1 rounded w-fit">
                                    {reg.serial_code}
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-xs">
                                    {reg.created_at_jalali}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 w-fit ${
                                        reg.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        reg.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {reg.status === 'approved' && <CheckCircle2 size={12} />}
                                        {reg.status === 'rejected' && <XCircle size={12} />}
                                        {reg.status === 'pending' && <Clock size={12} />}
                                        {reg.status_farsi}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => onReview(reg)}
                                        className="text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition border border-primary-100 flex items-center gap-1"
                                    >
                                        <Eye size={16} />
                                        بررسی
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {registrations.data.length === 0 && <div className="p-8 text-center text-gray-500">هیچ درخواست ثبتی وجود ندارد.</div>}
        </div>
    );
}