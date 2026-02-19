import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps } from '@/types';
import { Award, ShoppingBag, Dna, Package, ArrowRight } from 'lucide-react';
import UserInfoCard from './Partials/UserInfoCard';
import SimpleHistoryTable from './Partials/SimpleHistoryTable';

interface Props extends PageProps {
    user: {
        id: number;
        name: string;
        mobile: string;
        national_code: string;
        address: string;
        club: string;
        current_points: number;
    };
    stats: {
        total_earned: number;
        total_spent: number;
        today_earned: number;
        today_spent: number;
    };
    transactions: { data: any[] };
    rewards: any[];
    products: any[];
    spins: { data: any[] };
    from?: 'users' | 'rewards';
}

export default function UserHistory({ user, stats, transactions, rewards, products, spins, from = 'rewards' }: Props) {
    
    const backRoute = from === 'users' ? route('admin.users') : route('admin.rewards.index', {tab: 'redemptions'});
    const parentLabel = from === 'users' ? 'مدیریت کاربران' : 'مدیریت جوایز';

    return (
        <DashboardLayout breadcrumbs={[
            { label: parentLabel, href: backRoute },
            { label: `سوابق کاربر: ${user.name}` }
        ]}>
            <Head title={`سوابق: ${user.name}`} />

            <div className="space-y-6">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                    <Link href={backRoute} className="p-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition text-gray-500 hover:text-gray-800">
                        <ArrowRight size={20} />
                    </Link>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">سوابق جامع کاربر</h1>
                </div>

                {/* User Info */}
                <UserInfoCard user={user} stats={stats} />

                {/* History Lists Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8">
                    
                    {/* 1. Rewards */}
                    <SimpleHistoryTable
                        title="جوایز دریافتی"
                        icon={ShoppingBag}
                        iconColorClass="text-blue-600"
                        headers={['جایزه', 'امتیاز', 'وضعیت', 'تاریخ']}
                        data={rewards}
                        renderRow={(r, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition">
                                <td className="px-4 py-3 font-medium text-gray-800">{r.title}</td>
                                <td className="px-4 py-3 text-red-500 font-bold dir-ltr text-right">{r.points.toLocaleString()}</td>
                                <td className="px-4 py-3 text-xs">
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">{r.status}</span>
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs dir-ltr text-right">{r.date}</td>
                            </tr>
                        )}
                        emptyMessage="هیچ جایزه‌ای دریافت نشده است."
                    />

                    {/* 2. Products */}
                    <SimpleHistoryTable
                        title="محصولات ثبت شده"
                        icon={Package}
                        iconColorClass="text-orange-600"
                        headers={['محصول', 'سریال', 'تاریخ']}
                        data={products}
                        renderRow={(p, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition">
                                <td className="px-4 py-3 font-medium text-gray-800">{p.title}</td>
                                <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.serial}</td>
                                <td className="px-4 py-3 text-gray-500 text-xs dir-ltr text-right">{p.date}</td>
                            </tr>
                        )}
                        emptyMessage="هیچ محصولی ثبت نشده است."
                    />

                    {/* 3. Transactions */}
                    <SimpleHistoryTable
                        title="تراکنش‌های اخیر امتیاز"
                        icon={Award}
                        iconColorClass="text-amber-600"
                        headers={['عنوان', 'مقدار', 'تاریخ']}
                        data={transactions.data}
                        renderRow={(tx, i) => (
                            <tr key={tx.id} className="hover:bg-gray-50 transition">
                                <td className="px-4 py-3 text-xs">
                                    <div className="font-bold text-gray-700 mb-0.5">{tx.type_farsi}</div>
                                    <div className="text-gray-500 truncate max-w-[200px]" title={tx.description}>{tx.description}</div>
                                </td>
                                <td className={`px-4 py-3 font-black dir-ltr text-right ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs dir-ltr text-right">{tx.created_at_jalali}</td>
                            </tr>
                        )}
                        emptyMessage="تراکنشی یافت نشد."
                    />

                    {/* 4. Lucky Wheel */}
                    <SimpleHistoryTable
                        title="تاریخچه گردونه شانس"
                        icon={Dna}
                        iconColorClass="text-purple-600"
                        headers={['نتیجه', 'هزینه', 'تاریخ']}
                        data={spins.data}
                        renderRow={(spin, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition">
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-1 rounded font-medium ${spin.is_win ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {spin.prize}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-red-500 text-xs font-bold">{spin.cost > 0 ? spin.cost : 'رایگان'}</td>
                                <td className="px-4 py-3 text-gray-500 text-xs dir-ltr text-right">{spin.date}</td>
                            </tr>
                        )}
                        emptyMessage="هنوز از گردونه استفاده نشده است."
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}