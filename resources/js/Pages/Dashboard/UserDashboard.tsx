import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    ShieldCheck, CreditCard, ArrowUpRight, ArrowDownLeft,
    AlertCircle, Copy, Check, User, Gift, TrendingUp,
    Award, Sparkles, Clock, ChevronLeft, Zap, Star
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
    const referralLink = `${window.location.origin}/register?ref=${auth.user.mobile}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Quick Access Section */}
            <QuickAccess pinned={quickAccess.pinned} frequent={quickAccess.frequent} isAdmin={false} />

            {/* بخش خوش‌آمدگویی با کارت پیشرفت */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* کارت خوش‌آمدگویی */}
                <div className="lg:col-span-2 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden group">
                    {/* المان‌های تزئینی */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                            {/* آواتار */}
                            <div className="relative">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white/30 shadow-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl font-bold backdrop-blur-sm overflow-hidden group-hover:scale-105 transition-transform">
                                    {auth.user.avatar ? (
                                        <img src={auth.user.avatar} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-white">{auth.user.first_name?.[0]}</span>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-3 border-white shadow-lg" />
                            </div>

                            {/* متن خوش‌آمدگویی */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h1 className="text-2xl md:text-3xl font-bold">سلام، {auth.user.first_name}! 👋</h1>
                                    <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                                        <Sparkles size={12} />
                                        خوش آمدید
                                    </span>
                                </div>
                                <p className="text-amber-100 text-sm md:text-base flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                                    به باشگاه مشتریان خوش آمدید. از امتیازات خود لذت ببرید!
                                </p>
                            </div>
                        </div>

                        {/* آمار سریع */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                <div className="flex items-center gap-2 mb-1">
                                    <Award size={14} className="text-amber-300" />
                                    <span className="text-xs text-amber-200">امتیاز کل</span>
                                </div>
                                <span className="text-xl font-bold">{stats.points?.toLocaleString()}</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                <div className="flex items-center gap-2 mb-1">
                                    <Gift size={14} className="text-amber-300" />
                                    <span className="text-xs text-amber-200">دعوت‌ها</span>
                                </div>
                                <span className="text-xl font-bold">{stats.referrals || 0}</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 col-span-2 md:col-span-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp size={14} className="text-amber-300" />
                                    <span className="text-xs text-amber-200">سطح فعلی</span>
                                </div>
                                <span className="text-xl font-bold" style={{ color: stats.club_color }}>
                                    {stats.club}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* کارت لینک دعوت */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />

                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-amber-500/20 rounded-xl">
                                <Zap size={20} className="text-amber-400" />
                            </div>
                            <span className="text-sm font-bold text-amber-400">دعوت دوستان</span>
                        </div>

                        <p className="text-xs text-gray-400 mb-3">
                            با دعوت دوستان خود امتیاز بگیرید
                        </p>

                        <div className="bg-gray-800/80 backdrop-blur rounded-xl p-3 border border-gray-700 mb-3">
                            <span className="block text-[10px] text-gray-500 mb-1">لینک دعوت اختصاصی:</span>
                            <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2">
                                <code className="text-xs text-gray-300 truncate flex-1 dir-ltr font-mono">
                                    {referralLink}
                                </code>
                                <button
                                    onClick={handleCopy}
                                    className="p-1.5 hover:bg-gray-700 rounded-md transition-all group/btn"
                                    title="کپی لینک"
                                >
                                    {copied ? (
                                        <Check size={16} className="text-green-400" />
                                    ) : (
                                        <Copy size={16} className="text-gray-400 group-hover/btn:text-amber-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {copied && (
                            <div className="text-xs text-green-400 flex items-center gap-1 animate-in fade-in slide-in-from-top-2">
                                <Check size={12} />
                                لینک کپی شد!
                            </div>
                        )}

                        {/* آمار دعوت */}
                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-700">
                            <span className="text-xs text-gray-500">تعداد دعوت‌ها</span>
                            <span className="text-lg font-bold text-amber-400">{stats.referrals || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* کارت پیشرفت سطح */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative p-6 border-b border-gray-100 bg-gradient-to-l from-amber-50/50 to-transparent">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-x-16 -translate-y-16" />

                    <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="p-3 rounded-xl shadow-lg"
                                style={{
                                    backgroundColor: stats.club_color + '20',
                                    boxShadow: `0 10px 20px -5px ${stats.club_color}40`
                                }}
                            >
                                <ShieldCheck size={24} style={{ color: stats.club_color }} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">پیشرفت سطح باشگاه</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    سطح فعلی: <span className="font-bold" style={{ color: stats.club_color }}>{stats.club}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-left">
                                <span className="text-sm font-bold text-gray-700 block">
                                    {stats.points_needed.toLocaleString()} امتیاز
                                </span>
                                <span className="text-xs text-gray-400">تا سطح {stats.next_club}</span>
                            </div>
                            <div className="px-3 py-1.5 bg-amber-100 rounded-lg">
                                <span className="text-xs font-bold text-amber-700">
                                    {stats.progress_percent}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* نوار پیشرفت */}
                <div className="p-6">
                    <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-1000 ease-out relative"
                            style={{
                                width: `${stats.progress_percent}%`,
                                background: `linear-gradient(90deg, ${stats.club_color} 0%, ${stats.club_color}dd 100%)`
                            }}
                        >
                            {/* انیمیشن حرکت نور */}
                            <div className="absolute inset-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </div>
                    </div>

                    {/* مراحل سطح */}
                    <div className="flex justify-between mt-3">
                        <span className="text-xs text-gray-400">شروع</span>
                        <span className="text-xs font-bold" style={{ color: stats.club_color }}>{stats.club}</span>
                        <span className="text-xs text-gray-600">{stats.next_club}</span>
                    </div>
                </div>
            </div>

            {/* تراکنش‌های اخیر */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative p-6 border-b border-gray-100 bg-gradient-to-l from-green-50/50 to-transparent">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-green-500/5 rounded-full -translate-x-16 -translate-y-16" />

                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/20">
                                <CreditCard size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">تراکنش‌های اخیر</h3>
                                <p className="text-xs text-gray-500 mt-0.5">آخرین فعالیت‌های مالی شما</p>
                            </div>
                        </div>

                        <Link
                            href={route('export.transactions')}
                            className="group flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-green-500 hover:text-green-600 transition-all hover:shadow-md"
                        >
                            دانلود اکسل
                            <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>

                <div className="p-4 max-h-[400px] overflow-y-auto">
                    {recentTransactions && recentTransactions.length > 0 ? (
                        <div className="space-y-2">
                            {recentTransactions.map((tx, index) => {
                                const isPositive = tx.amount_with_sign.startsWith('+');
                                return (
                                    <div
                                        key={tx.id}
                                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* آیکون */}
                                            <div className={clsx(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110",
                                                isPositive
                                                    ? "bg-green-100 text-green-600 group-hover:bg-green-200"
                                                    : "bg-red-100 text-red-600 group-hover:bg-red-200"
                                            )}>
                                                {isPositive ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                            </div>

                                            {/* اطلاعات تراکنش */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="font-bold text-gray-800 text-sm">{tx.type_farsi}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-500">
                                                        {tx.category}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 flex items-center gap-2">
                                                    <span>{tx.description}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {tx.created_at_jalali}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* مبلغ */}
                                        <div className="text-left">
                                            <span className={clsx(
                                                "block text-sm font-bold",
                                                isPositive ? "text-green-600" : "text-red-600"
                                            )}>
                                                {tx.amount_with_sign}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {tx.balance_after?.toLocaleString()} امتیاز
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <EmptyState
                            icon={CreditCard}
                            title="تراکنشی یافت نشد"
                            description="با فعالیت در سایت، تراکنش‌های شما نمایش داده می‌شود"
                        />
                    )}
                </div>
            </div>

            {/* کارت‌های پیشنهادی */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SuggestionCard
                    icon={Gift}
                    title="فروشگاه جوایز"
                    description="امتیازات خود را با جوایز ویژه تعویض کنید"
                    color="from-pink-500 to-pink-600"
                    route="rewards.index"
                />
                <SuggestionCard
                    icon={Star}
                    title="گردونه شانس"
                    description="شانس خود را برای برنده شدن امتحان کنید"
                    color="from-purple-500 to-purple-600"
                    route="lucky-wheel.index"
                />
                <SuggestionCard
                    icon={Users}
                    title="دعوت دوستان"
                    description="با دعوت دوستان، امتیاز بیشتری کسب کنید"
                    color="from-blue-500 to-blue-600"
                    route="referrals.index"
                />
            </div>
        </div>
    );
}

// کارت پیشنهادی
const SuggestionCard = ({ icon: Icon, title, description, color, route }: any) => (
    <Link
        href={route(route)}
        className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 p-5 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
        {/* پس‌زمینه گرادینت در هاور */}
        <div className={clsx(
            "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300",
            `bg-gradient-to-br ${color}`
        )} />

        <div className="relative flex items-center gap-4">
            <div className={clsx(
                "w-12 h-12 rounded-xl bg-gradient-to-br text-white shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300",
                `from-${color.split(' ')[0].replace('from-', '')} to-${color.split(' ')[1].replace('to-', '')}`
            )}>
                <Icon size={24} />
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-gray-800 mb-1 group-hover:text-gray-900">{title}</h4>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
            <ChevronLeft size={18} className="text-gray-300 group-hover:text-amber-500 group-hover:-translate-x-1 transition-all" />
        </div>
    </Link>
);

// کامپوننت حالت خالی
const EmptyState = ({ icon: Icon, title, description }: any) => (
    <div className="py-12 text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
            <Icon size={24} className="text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-xs text-gray-400">{description}</p>
    </div>
);
