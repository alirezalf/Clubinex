import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Pagination from '@/Components/Pagination';
import { PageProps } from '@/types';
import { Users, Copy, Check, Share2, Coins, UserPlus } from 'lucide-react';

export default function ReferralsIndex({ referralCode, stats, referrals }: any) {
    const [copied, setCopied] = useState(false);
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'معرفی دوستان' }]}>
            <Head title="معرفی دوستان" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Invite Box */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <UserPlus size={24} className="text-indigo-200" />
                        دعوت از دوستان
                    </h2>
                    <p className="text-indigo-100 mb-6 leading-relaxed">
                        با دعوت از دوستان خود به باشگاه، هم شما و هم دوستانتان امتیاز ویژه دریافت کنید. به ازای هر خرید آنها، درصدی به عنوان پاداش دریافت خواهید کرد.
                    </p>
                    
                    <div className="bg-black/20 p-4 rounded-xl flex items-center gap-4 mb-4 backdrop-blur-sm border border-white/10">
                        <div className="flex-1 truncate font-mono text-lg text-center tracking-wider">{referralCode}</div>
                        <div className="h-8 w-px bg-white/20"></div>
                        <button onClick={handleCopy} className="text-white hover:text-indigo-200 transition">
                            {copied ? <Check size={20} /> : <Copy size={20} />}
                        </button>
                    </div>
                    
                    <div className="text-xs text-indigo-200 text-center">
                        لینک اختصاصی: <span className="font-mono dir-ltr select-all">{referralLink}</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                        <div className="bg-blue-50 p-3 rounded-full text-blue-600 mb-3">
                            <Users size={24} />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.total}</h3>
                        <p className="text-sm text-gray-500">کل زیرمجموعه‌ها</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                        <div className="bg-amber-50 p-3 rounded-full text-amber-600 mb-3">
                            <Coins size={24} />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.total_commission}</h3>
                        <p className="text-sm text-gray-500">امتیاز دریافتی</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                        <div className="bg-green-50 p-3 rounded-full text-green-600 mb-3">
                            <Check size={24} />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.active}</h3>
                        <p className="text-sm text-gray-500">زیرمجموعه فعال</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                        <div className="bg-orange-50 p-3 rounded-full text-orange-600 mb-3">
                            <Share2 size={24} />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.direct}</h3>
                        <p className="text-sm text-gray-500">معرفی مستقیم</p>
                    </div>
                </div>
            </div>

            {/* Referrals List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-lg text-gray-800">لیست دوستان دعوت شده</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4">نام کاربر</th>
                                <th className="px-6 py-4">تاریخ عضویت</th>
                                <th className="px-6 py-4">وضعیت</th>
                                <th className="px-6 py-4">سطح</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {referrals.data.map((ref: any) => (
                                <tr key={ref.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-bold text-gray-700">
                                        {ref.referred?.first_name} {ref.referred?.last_name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{ref.created_at_jalali}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs bg-${ref.status_color}-100 text-${ref.status_color}-700`}>
                                            {ref.status_text}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {ref.level === 1 ? 'مستقیم' : `سطح ${ref.level}`}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {referrals.data.length === 0 && (
                    <div className="p-10 text-center text-gray-500">هنوز کسی را دعوت نکرده‌اید.</div>
                )}
            </div>
            
            <Pagination links={referrals.links} />
        </DashboardLayout>
    );
}