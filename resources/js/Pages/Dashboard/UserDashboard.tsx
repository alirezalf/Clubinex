import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    ShieldCheck, CreditCard, ArrowUpRight, ArrowDownLeft,
    AlertCircle, Copy, Check
} from 'lucide-react';
import clsx from 'clsx';
import { PageProps } from '@/types';
import QuickAccess from './Components/QuickAccess';

interface UserStats {
    points: number;
    referrals: number;
    club: string;
    club_color: string;
    club_icon: string;
    next_club: string;
    progress_percent: number;
    points_needed: number;
}

interface Props {
    stats: UserStats;
    recentTransactions?: any[];
    quickAccess: { pinned: string[], frequent: string[] };
}

export default function UserDashboard({ stats, recentTransactions, quickAccess }: Props) {
    const { auth } = usePage<PageProps>().props;
    const [copied, setCopied] = useState(false);
    const referralLink = `${window.location.origin}/register?ref=${auth.user.mobile}`; // Or generic code

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* Quick Access Section (Added) */}
            <QuickAccess
                pinned={quickAccess.pinned}
                frequent={quickAccess.frequent}
                isAdmin={false}
            />

            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary-900 to-primary-700 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white/20 shadow-inner bg-white/10 flex items-center justify-center text-3xl font-bold backdrop-blur-sm overflow-hidden">
                             {auth.user.avatar ? <img src={auth.user.avatar} className="w-full h-full object-cover" /> : auth.user.first_name?.[0]}
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">سلام، {auth.user.first_name}! 👋</h1>
                            <p className="text-primary-100 text-sm md:text-base opacity-90">به باشگاه مشتریان خوش آمدید.</p>
                        </div>
                    </div>

                    {/* Referral Link Box */}
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 max-w-sm w-full">
                        <span className="block text-xs text-primary-200 mb-2">لینک دعوت اختصاصی شما:</span>
                        <div className="flex items-center gap-2 bg-black/20 rounded-lg p-2">
                            <code className="text-xs text-white truncate flex-1 dir-ltr font-mono">{referralLink}</code>
                            <button
                                onClick={handleCopy}
                                className="p-1.5 hover:bg-white/10 rounded-md transition text-white"
                                title="کپی لینک"
                            >
                                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Level Progress */}
             <div className="card-base p-6">
                <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{backgroundColor: stats.club_color + '20', color: stats.club_color}}>
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">سطح فعلی: <span style={{color: stats.club_color}}>{stats.club}</span></h3>
                            <p className="text-xs text-gray-500">برای رسیدن به {stats.next_club} تلاش کنید</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-bold text-gray-700">{stats.points_needed.toLocaleString()} امتیاز دیگر</span>
                        <span className="text-xs text-gray-400 block">تا سطح {stats.next_club}</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden relative">
                    <div
                        className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                        style={{ width: `${stats.progress_percent}%`, backgroundColor: stats.club_color }}
                    >
                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Recent Transactions Widget (Full Width now since Quick Access moved up) */}
                <div className="card-base p-5 h-fit">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <CreditCard size={18} className="text-gray-400" />
                            تراکنش‌های اخیر
                        </h3>
                        <Link href={route('export.transactions')} className="text-xs text-primary-600 hover:bg-primary-50 px-2 py-1 rounded transition">
                            دانلود اکسل
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentTransactions?.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between group hover:bg-gray-50 p-2 rounded-lg transition">
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                        tx.amount_with_sign.startsWith('+') ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                    )}>
                                        {tx.amount_with_sign.startsWith('+') ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-700">{tx.type_farsi}</p>
                                        <p className="text-[10px] text-gray-400 truncate w-32 md:w-full">{tx.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={clsx(
                                        "block text-sm font-bold",
                                        tx.amount_with_sign.startsWith('+') ? "text-green-600" : "text-red-600"
                                    )}>
                                        {tx.amount_with_sign}
                                    </span>
                                    <span className="text-[10px] text-gray-400">{tx.created_at_jalali}</span>
                                </div>
                            </div>
                        ))}
                        {(!recentTransactions || recentTransactions.length === 0) && (
                            <div className="text-center py-6 text-gray-400 text-sm">
                                <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
                                هنوز تراکنشی ندارید
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
