import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps } from '@/types';
import { ShoppingCart, Gift, History } from 'lucide-react';
import clsx from 'clsx';
import RewardItem from './Partials/RewardItem';
import RedemptionHistory from './Partials/RedemptionHistory';

interface Reward {
    id: number;
    title: string;
    description: string;
    image: string | null;
    points_cost: number;
    type: string;
    stock: number;
    can_redeem: boolean;
    club?: {
        name: string;
        color: string;
    };
}

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

type Props = PageProps<{
    rewards: Reward[];
    current_points?: number; 
    userPoints?: number; 
    myRedemptions: Redemption[];
}>;

export default function RewardsIndex({ auth, rewards, current_points, userPoints, myRedemptions }: Props) {
    const { post, processing } = useForm();
    const [activeTab, setActiveTab] = useState<'store' | 'history'>('store');

    const points = typeof current_points === 'number' 
        ? current_points 
        : (typeof userPoints === 'number' ? userPoints : (auth?.user?.points || 0));

    const handleRedeem = (rewardId: number, title: string) => {
        if (confirm(`آیا مطمئن هستید که می‌خواهید "${title}" را دریافت کنید؟`)) {
            post(route('rewards.redeem', rewardId), {
                onSuccess: () => setActiveTab('history'), 
            });
        }
    };

    return (
        <DashboardLayout breadcrumbs={[
            { label: 'فروشگاه جوایز' }
        ]}>
            <Head title="فروشگاه جوایز" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Gift className="text-primary-600" />
                        فروشگاه جوایز
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">امتیازات خود را به جوایز ارزشمند تبدیل کنید</p>
                </div>
                <div className="bg-gradient-to-l from-primary-600 to-primary-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
                    <span className="text-sm opacity-90">موجودی شما:</span>
                    <span className="text-2xl font-bold" dir="ltr">
                        {points.toLocaleString()}
                    </span>
                    <span className="text-sm">امتیاز</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-6 w-fit">
                <button 
                    onClick={() => setActiveTab('store')}
                    className={clsx(
                        "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
                        activeTab === 'store' ? "bg-primary-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"
                    )}
                >
                    <ShoppingCart size={18} />
                    فروشگاه
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={clsx(
                        "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
                        activeTab === 'history' ? "bg-primary-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"
                    )}
                >
                    <History size={18} />
                    جوایز من <span className="bg-white/20 px-1.5 rounded text-xs font-bold">{myRedemptions.length}</span>
                </button>
            </div>

            {/* Store Content */}
            {activeTab === 'store' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in">
                    {rewards.map((reward) => (
                        <RewardItem 
                            key={reward.id} 
                            reward={reward} 
                            onRedeem={handleRedeem} 
                            processing={processing}
                            points={points}
                        />
                    ))}

                    {rewards.length === 0 && (
                        <div className="col-span-full py-16 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
                            <Gift size={48} className="mx-auto text-gray-300 mb-3" />
                            <p>هنوز جایزه‌ای تعریف نشده است.</p>
                        </div>
                    )}
                </div>
            )}

            {/* History Content */}
            {activeTab === 'history' && (
                <RedemptionHistory 
                    redemptions={myRedemptions} 
                    onSwitchToStore={() => setActiveTab('store')} 
                />
            )}
        </DashboardLayout>
    );
}