import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Gift, Activity, TrendingUp, Calendar, Award, Star, Clock, ArrowUp, ArrowDown, MoreHorizontal, Sparkles, Zap, MessageSquare, CreditCard, Check, Settings2 } from 'lucide-react';
import clsx from 'clsx';
import { Link, usePage } from '@inertiajs/react';
import QuickAccess from './Components/QuickAccess';

interface AdminStats {
    total_users: number;
    new_users_today: number;
    pending_rewards: number;
    total_points_distributed: number;
    avg_points: number;
    busiest_hour: string;
    retention_rate: number;
    point_real_value?: number;
    total_redeemed_points?: number;
    open_tickets: number;
    pending_withdrawals: number;
}

interface Props {
    stats: AdminStats;
    recentActivities?: any[];
    latestUsers?: any[];
    chartData?: Record<string, number>;
    quickAccess: { pinned: string[], frequent: string[] };
}

export default function AdminDashboard({ stats, recentActivities, latestUsers, quickAccess }: Props) {
    const { modules } = usePage<any>().props;
    const [isWidgetMenuOpen, setIsWidgetMenuOpen] = useState(false);

    // Modules logic
    const isGamificationEnabled = modules?.enable_clubs === '1' || modules?.enable_clubs === true;
    const isTicketsEnabled = modules?.enable_tickets === '1' || modules?.enable_tickets === true;
    const isWithdrawalsEnabled = modules?.enable_wallet === '1' || modules?.enable_wallet === true;
    const isRewardsEnabled = modules?.enable_rewards === '1' || modules?.enable_rewards === true;

    const availableWidgets = [
        { key: 'users', label: 'کل کاربران' },
        { key: 'newUsers', label: 'کاربران امروز' },
        ...(isRewardsEnabled ? [{ key: 'rewards', label: 'درخواست‌های جایزه' }] : []),
        ...(isTicketsEnabled ? [{ key: 'tickets', label: 'تیکت‌های باز' }] : []),
        ...(isWithdrawalsEnabled ? [{ key: 'withdrawals', label: 'درخواست تسویه' }] : [])
    ];

    const [visibleWidgets, setVisibleWidgets] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('adminDashboardWidgets');
            if (saved) return JSON.parse(saved);
        }
        return {
            users: true,
            newUsers: true,
            rewards: true,
            tickets: true,
            withdrawals: true
        };
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('adminDashboardWidgets', JSON.stringify(visibleWidgets));
        }
    }, [visibleWidgets]);

    const toggleWidget = (key: keyof typeof visibleWidgets) => {
        setVisibleWidgets((prev: any) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Quick Access Section - با طراحی جدید */}
            <QuickAccess pinned={quickAccess.pinned} frequent={quickAccess.frequent} isAdmin={true} />

            {/* هدر داشبورد */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-white to-gray-50/50 p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg shadow-amber-500/20">
                        <Zap size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">نمای کلی سیستم</h1>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <span>آخرین بروزرسانی:</span>
                            <span className="bg-white px-2 py-0.5 rounded-lg border border-gray-200 text-xs">
                                {new Date().toLocaleDateString('fa-IR')}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm text-gray-600">سیستم فعال</span>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setIsWidgetMenuOpen(!isWidgetMenuOpen)}
                            className="p-2.5 bg-white rounded-xl border border-gray-200 hover:border-amber-500 hover:text-amber-500 transition-all group"
                        >
                            <Settings2 size={18} className="transition-transform hover:rotate-90" />
                        </button>

                        {isWidgetMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsWidgetMenuOpen(false)}></div>
                                <div className="absolute top-full mt-2 left-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-2 py-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="px-3 pb-2 mb-2 border-b border-gray-100">
                                        <h4 className="text-sm font-bold text-gray-800">مدیریت ویجت‌ها</h4>
                                        <p className="text-[10px] text-gray-500">ویجت‌های فعال در داشبورد را انتخاب کنید</p>
                                    </div>
                                    <div className="space-y-1">
                                        {availableWidgets.map((widget) => (
                                            <button
                                                key={widget.key}
                                                onClick={() => toggleWidget(widget.key as any)}
                                                className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <span className={clsx("text-gray-700", !visibleWidgets[widget.key as keyof typeof visibleWidgets] && "opacity-50")}>
                                                    {widget.label}
                                                </span>
                                                <div className={clsx("w-5 h-5 rounded-md flex items-center justify-center transition-colors", visibleWidgets[widget.key as keyof typeof visibleWidgets] ? "bg-amber-500 text-white" : "bg-gray-100 border border-gray-200 text-transparent")}>
                                                    <Check size={14} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* کارت‌های آمار */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                {visibleWidgets.users && (
                    <StatCard
                        title="کل کاربران"
                        value={stats.total_users.toLocaleString()}
                        icon={Users}
                        trend={stats.total_users > 0 ? "" : undefined}
                        trendLabel="کل ثبت نامی ها"
                        color="from-blue-500 to-blue-600"
                        iconBg="bg-gradient-to-r from-blue-500 to-blue-600"
                        href="/admin/users"
                    />
                )}
                {visibleWidgets.newUsers && (
                    <StatCard
                        title="کاربران امروز"
                        value={stats.new_users_today.toLocaleString()}
                        icon={UserPlus}
                        trend={stats.new_users_today > 0 ? "+" + stats.new_users_today : "0"}
                        trendLabel="نسبت به دیروز"
                        color="from-green-500 to-green-600"
                        iconBg="bg-gradient-to-r from-green-500 to-green-600"
                        href="/admin/users"
                    />
                )}
                {visibleWidgets.rewards && isRewardsEnabled && (
                    <StatCard
                        title="درخواست‌های جایزه"
                        value={stats.pending_rewards.toLocaleString()}
                        icon={Gift}
                        trend={stats.pending_rewards > 0 ? stats.pending_rewards.toString() : ""}
                        trendLabel={stats.pending_rewards > 0 ? "در انتظار تایید" : "موردی نیست"}
                        color="from-amber-500 to-amber-600"
                        iconBg="bg-gradient-to-r from-amber-500 to-amber-600"
                        href="/admin/marketing/rewards"
                    />
                )}
                {visibleWidgets.tickets && isTicketsEnabled && (
                    <StatCard
                        title="تیکت‌های باز"
                        value={stats.open_tickets.toLocaleString()}
                        icon={MessageSquare}
                        trend={stats.open_tickets > 0 ? stats.open_tickets.toString() : ""}
                        trendLabel={stats.open_tickets > 0 ? "نیاز به پاسخ" : "همه پاسخ داده شده"}
                        color="from-rose-500 to-rose-600"
                        iconBg="bg-gradient-to-r from-rose-500 to-rose-600"
                        href="/admin/support/tickets"
                    />
                )}
                {visibleWidgets.withdrawals && isWithdrawalsEnabled && (
                    <StatCard
                        title="درخواست تسویه"
                        value={stats.pending_withdrawals.toLocaleString()}
                        icon={CreditCard}
                        trend={stats.pending_withdrawals > 0 ? stats.pending_withdrawals.toString() : ""}
                        trendLabel={stats.pending_withdrawals > 0 ? "در انتظار بررسی" : "موردی نیست"}
                        color="from-indigo-500 to-indigo-600"
                        iconBg="bg-gradient-to-r from-indigo-500 to-indigo-600"
                        href="/admin/marketing/points/transactions" /* temporary link until withdrawal page is ready */
                    />
                )}
            </div>

            {/* بخش‌های پایینی */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* فعالیت‌های اخیر */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="relative p-6 border-b border-gray-100 bg-gradient-to-l from-amber-50/50 to-transparent">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-x-16 -translate-y-16" />
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg shadow-amber-500/20">
                                    <Activity size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">فعالیت‌های اخیر</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">آخرین رویدادهای سیستم</p>
                                </div>
                            </div>
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                                {recentActivities?.length || 0} فعالیت
                            </span>
                        </div>
                    </div>

                    <div className="p-4 max-h-[400px] overflow-y-auto">
                        {recentActivities && recentActivities.length > 0 ? (
                            <div className="space-y-3">
                                {recentActivities.map((activity, index) => (
                                    <div
                                        key={activity.id}
                                        className="relative flex gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                                    >
                                        {/* خط زمانی */}
                                        {index < recentActivities.length - 1 && (
                                            <div className="absolute right-[23px] top-12 bottom-0 w-0.5 bg-gray-200" />
                                        )}

                                        {/* دایره وضعیت */}
                                        <div className="relative">
                                            <div className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-50 group-hover:ring-amber-100 transition-all" />
                                        </div>

                                        {/* محتوای فعالیت */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-800">{activity.user}</span>
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {activity.time}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {activity.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Activity}
                                title="هیچ فعالیتی یافت نشد"
                                description="با انجام فعالیت‌ها، این بخش پر می‌شود"
                            />
                        )}
                    </div>
                </div>

                {/* کاربران جدید */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="relative p-6 border-b border-gray-100 bg-gradient-to-l from-blue-50/50 to-transparent">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-x-16 -translate-y-16" />
                        <div className="relative flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                                <Users size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">کاربران جدید</h3>
                                <p className="text-xs text-gray-500 mt-0.5">به تازگی ثبت‌نام کرده‌اند</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 max-h-[400px] overflow-y-auto">
                        {latestUsers && latestUsers.length > 0 ? (
                            <div className="space-y-2">
                                {latestUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-all group"
                                    >
                                        {/* آواتار */}
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-bold text-blue-600 text-lg">
                                                        {user.name?.[0]}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                                        </div>

                                        {/* اطلاعات کاربر */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="font-bold text-gray-800 text-sm truncate">
                                                    {user.name}
                                                </span>
                                                {user.is_agent && (
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">
                                                        نماینده
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="text-gray-500">{user.mobile}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                <span className="text-gray-400 flex items-center gap-1">
                                                    <Calendar size={10} />
                                                    {user.joined_at}
                                                </span>
                                            </div>
                                        </div>

                                        {/* امتیاز */}
                                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg">
                                            <Star size={12} className="text-amber-500 fill-amber-500" />
                                            <span className="text-xs font-bold text-amber-700">
                                                {user.points || 0}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Users}
                                title="کاربر جدیدی یافت نشد"
                                description="با ثبت‌نام کاربران، این بخش پر می‌شود"
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* بخش آمار سریع */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <QuickStatCard
                    title="ارزش هر امتیاز"
                    value={`${stats.point_real_value || 0} تومان`}
                    icon={Sparkles}
                    trend="مبتنی بر جوایز بازخریدشده"
                    trendUp={true}
                />
                <QuickStatCard
                    title="میانگین امتیاز هر کاربر"
                    value={stats.avg_points?.toLocaleString() || "0"}
                    icon={Award}
                    trend="مبتنی بر تراکنش‌ها"
                    trendUp={true}
                />
                <QuickStatCard
                    title="بیشترین فعالیت"
                    value={stats.busiest_hour || "نامشخص"}
                    icon={Clock}
                    trend="بر اساس لاگ‌ها"
                    trendUp={true}
                />
                <QuickStatCard
                    title="نرخ بازگشت کاربران"
                    value={`${stats.retention_rate || 0}٪`}
                    icon={TrendingUp}
                    trend="۳۰ روز اخیر"
                    trendUp={stats.retention_rate > 50}
                />
            </div>
        </div>
    );
}

// کارت آمار اصلی
const StatCard = ({ title, value, icon: Icon, trend, trendLabel, color, bgColor, iconBg, href }: any) => {
    const CardContent = (
        <div className="relative group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
            {/* پس‌زمینه گرادینت در هاور */}
            <div className={clsx(
                "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300",
                `bg-gradient-to-br ${color}`
            )} />

            <div className="relative flex items-start justify-between">
                <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
                    <div className="flex items-center gap-2">
                        {trend && (
                            <span className={clsx(
                                "text-xs font-medium flex items-center gap-1",
                                trend.startsWith('+') ? 'text-green-600' : (trend.startsWith('-') ? 'text-red-600' : 'text-gray-600')
                            )}>
                                {trend.startsWith('+') && <ArrowUp size={12} />}
                                {trend.startsWith('-') && <ArrowDown size={12} />}
                                {trend}
                            </span>
                        )}
                        <span className="text-xs text-gray-400">• {trendLabel}</span>
                    </div>
                </div>

                {/* آیکون با پس‌زمینه گرادینت */}
                <div className={clsx(
                    "p-3.5 rounded-2xl text-white shadow-lg shrink-0",
                    iconBg,
                    "group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                )}>
                    <Icon size={24} />
                </div>
            </div>

            {/* گرادینت خط پایین */}
            <div className={clsx(
                "absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-gradient-to-r",
                color
            )} />
        </div>
    );

    return href ? <Link href={href} className="block w-full">{CardContent}</Link> : CardContent;
};

// کارت آمار سریع
const QuickStatCard = ({ title, value, icon: Icon, trend, trendUp }: any) => (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group hover:border-amber-200">
        <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gray-50 group-hover:bg-amber-50 transition-colors">
                <Icon size={18} className="text-gray-600 group-hover:text-amber-500" />
            </div>
            <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{title}</p>
                <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800">{value}</span>
                    <span className={clsx(
                        "text-xs flex items-center gap-0.5",
                        trendUp ? 'text-green-600' : 'text-red-600'
                    )}>
                        {trend}
                        {trendUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                    </span>
                </div>
            </div>
        </div>
    </div>
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
