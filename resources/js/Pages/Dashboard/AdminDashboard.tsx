import React from 'react';
import { Users, UserPlus, Gift, Activity, TrendingUp, Calendar, Award, Star, Clock, ArrowUp, ArrowDown, MoreHorizontal, Sparkles, Zap } from 'lucide-react';
import clsx from 'clsx';
import QuickAccess from './Components/QuickAccess';

interface AdminStats {
    total_users: number;
    new_users_today: number;
    pending_rewards: number;
    total_points_distributed: number;
}

interface Props {
    stats: AdminStats;
    recentActivities?: any[];
    latestUsers?: any[];
    chartData?: Record<string, number>;
    quickAccess: { pinned: string[], frequent: string[] };
}

export default function AdminDashboard({ stats, recentActivities, latestUsers, quickAccess }: Props) {
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

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm text-gray-600">سیستم فعال</span>
                    </div>
                    <button className="p-2.5 bg-white rounded-xl border border-gray-200 hover:border-amber-500 hover:text-amber-500 transition-all group">
                        <MoreHorizontal size={18} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>
            </div>

            {/* کارت‌های آمار */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title="کل کاربران"
                    value={stats.total_users.toLocaleString()}
                    icon={Users}
                    trend="+12%"
                    trendLabel="نسبت به ماه قبل"
                    color="from-blue-500 to-blue-600"
                    bgColor="bg-blue-50"
                    iconBg="bg-gradient-to-r from-blue-500 to-blue-600"
                />
                <StatCard
                    title="ثبت‌نام امروز"
                    value={stats.new_users_today.toLocaleString()}
                    icon={UserPlus}
                    trend="+3"
                    trendLabel="نسبت به دیروز"
                    color="from-green-500 to-green-600"
                    bgColor="bg-green-50"
                    iconBg="bg-gradient-to-r from-green-500 to-green-600"
                />
                <StatCard
                    title="درخواست‌های جایزه"
                    value={stats.pending_rewards.toLocaleString()}
                    icon={Gift}
                    trend="8"
                    trendLabel="در انتظار تایید"
                    color="from-amber-500 to-amber-600"
                    bgColor="bg-amber-50"
                    iconBg="bg-gradient-to-r from-amber-500 to-amber-600"
                />
                <StatCard
                    title="گردش امتیاز"
                    value={stats.total_points_distributed.toLocaleString()}
                    icon={Activity}
                    trend="+2,500"
                    trendLabel="امتیاز جدید"
                    color="from-purple-500 to-purple-600"
                    bgColor="bg-purple-50"
                    iconBg="bg-gradient-to-r from-purple-500 to-purple-600"
                />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <QuickStatCard
                    title="میانگین امتیاز هر کاربر"
                    value="۱,۲۵۰"
                    icon={Award}
                    trend="۸% افزایش"
                    trendUp={true}
                />
                <QuickStatCard
                    title="بیشترین فعالیت"
                    value="ساعت ۱۰-۱۲"
                    icon={Clock}
                    trend="صبح‌ها"
                    trendUp={true}
                />
                <QuickStatCard
                    title="نرخ بازگشت کاربران"
                    value="۶۸٪"
                    icon={TrendingUp}
                    trend="۲% کاهش"
                    trendUp={false}
                />
            </div>
        </div>
    );
}

// کارت آمار اصلی
const StatCard = ({ title, value, icon: Icon, trend, trendLabel, color, bgColor, iconBg }: any) => (
    <div className="relative group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
                    <span className={clsx(
                        "text-xs font-medium flex items-center gap-1",
                        trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    )}>
                        {trend.startsWith('+') ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                        {trend}
                    </span>
                    <span className="text-xs text-gray-400">• {trendLabel}</span>
                </div>
            </div>

            {/* آیکون با پس‌زمینه گرادینت */}
            <div className={clsx(
                "p-3.5 rounded-2xl text-white shadow-lg",
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
