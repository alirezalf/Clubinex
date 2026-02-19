import React from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps, PaginatedData } from '@/types';
import { Gift, ShoppingBag } from 'lucide-react';

// Import Partials
import RewardsList from './Partials/RewardsList';
import RedemptionsList from './Partials/RedemptionsList';

interface Reward {
    id: number;
    title: string;
    points_cost: number;
    type: string;
    stock: number;
    description: string;
    required_club_id: number | null;
    is_active: number | boolean;
    image: string | null;
    club: { name: string } | null;
}

interface Redemption {
    id: number;
    user: { id: number; first_name: string; last_name: string; mobile: string };
    reward: { title: string; image: string | null } | null;
    points_spent: number;
    status: string;
    status_farsi: string;
    tracking_code: string | null;
    admin_note: string | null;
    created_at_jalali: string;
    admin_name: string | null;
    reward_title: string;
}

interface FilterParams {
    search?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
}

interface Props extends PageProps {
    tab: string;
    rewards: PaginatedData<Reward>;
    redemptions: PaginatedData<Redemption>;
    clubs: { id: number, name: string }[];
    filters: FilterParams;
    counts?: { rewards: number, redemptions: number, redemptions_total: number };
}

export default function AdminRewardsIndex({ tab, rewards, redemptions, clubs, filters, counts }: Props) {
    const switchTab = (newTab: string) => {
        router.get(route('admin.rewards.index'), { tab: newTab }, { preserveState: true });
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'مدیریت جوایز' }]}>
            <Head title="مدیریت جوایز" />

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    <button 
                        onClick={() => switchTab('list')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition ${tab === 'list' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Gift size={18} />
                        لیست جوایز
                        {counts && <span className="bg-white/20 px-1.5 rounded-full text-xs">{counts.rewards}</span>}
                    </button>
                    <button 
                        onClick={() => switchTab('redemptions')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition ${tab === 'redemptions' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <ShoppingBag size={18} />
                        درخواست‌ها
                        {counts && counts.redemptions > 0 && (
                            <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px] animate-pulse">
                                {counts.redemptions}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {tab === 'list' && (
                <RewardsList rewards={rewards} clubs={clubs} />
            )}

            {tab === 'redemptions' && (
                <RedemptionsList redemptions={redemptions} filters={filters} />
            )}
        </DashboardLayout>
    );
}