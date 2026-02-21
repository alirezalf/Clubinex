import React from 'react';
import { Users, UserPlus, Gift, Activity } from 'lucide-react';
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
             {/* Quick Access Section */}
             <QuickAccess
                pinned={quickAccess.pinned}
                frequent={quickAccess.frequent}
                isAdmin={true}
            />

             <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">نمای کلی سیستم</h1>
                <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-lg border shadow-sm">
                    بروزرسانی زنده
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard title="کل کاربران" value={stats.total_users.toLocaleString()} icon={Users} trend="+12% این ماه" color="bg-blue-500" />
                <StatCard title="ثبت‌نام امروز" value={stats.new_users_today.toLocaleString()} icon={UserPlus} trend="کاربر جدید" color="bg-green-500" />
                <StatCard title="درخواست‌های جایزه" value={stats.pending_rewards.toLocaleString()} icon={Gift} trend="در انتظار تایید" color="bg-amber-500" />
                <StatCard title="گردش امتیاز" value={stats.total_points_distributed.toLocaleString()} icon={Activity} trend="امتیاز کل" color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-base p-6">
                    <h3 className="font-bold text-gray-800 mb-4">فعالیت‌های اخیر</h3>
                    <div className="space-y-4">
                        {recentActivities?.map((activity) => (
                            <div key={activity.id} className="flex gap-3 text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0"></div>
                                <div>
                                    <span className="font-bold text-gray-700">{activity.user}</span>
                                    <span className="text-gray-500 mx-1">:</span>
                                    <span className="text-gray-600">{activity.description}</span>
                                    <span className="text-xs text-gray-400 block mt-0.5">{activity.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card-base p-6">
                    <h3 className="font-bold text-gray-800 mb-4">کاربران جدید</h3>
                    <div className="space-y-3">
                        {latestUsers?.map((user) => (
                            <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0 overflow-hidden">
                                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm text-gray-800 truncate">{user.name}</div>
                                    <div className="text-xs text-gray-500">{user.mobile}</div>
                                </div>
                                <div className="text-xs text-gray-400 whitespace-nowrap">{user.joined_at}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <div className="card-base p-5 flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            <p className="text-xs mt-2 text-green-600 font-medium flex items-center gap-1">
                <Activity size={12} /> {trend}
            </p>
        </div>
        <div className={clsx("p-3 rounded-xl text-white shadow-lg shadow-gray-200", color)}>
            <Icon size={22} />
        </div>
    </div>
);
