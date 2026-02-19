import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps } from '@/types';
import { Award, ArrowLeft, Crown, Star } from 'lucide-react';
import TierCard from './Partials/TierCard';
import SpecialClubCard from './Partials/SpecialClubCard';
import ConfirmModal from '@/Components/ConfirmModal';

interface Tier {
    id: number;
    name: string;
    icon: string;
    color: string;
    min_points: number;
    joining_cost: number;
    benefits: string[];
    status: 'passed' | 'current' | 'locked';
    is_next: boolean;
    can_upgrade: boolean;
}

interface SpecialClub {
    id: number;
    name: string;
    icon: string;
    color: string;
    joining_cost: number;
    benefits: string[];
    is_member: boolean;
    can_join: boolean;
}

type Props = PageProps<{
    tiers: Tier[];
    specialClubs: SpecialClub[];
    userPoints: number;
    currentClub: { name: string, color: string } | null;
}>;

export default function ClubsIndex({ tiers, specialClubs, userPoints, currentClub }: Props) {
    
    const safeTiers = Array.isArray(tiers) ? tiers : [];
    const safeSpecialClubs = Array.isArray(specialClubs) ? specialClubs : [];
    const safePoints = userPoints ?? 0;

    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        action: () => {}
    });

    const handleUpgrade = (tier: Tier) => {
        if (!tier.can_upgrade) return;
        
        setModal({
            isOpen: true,
            title: 'ارتقای سطح',
            message: `آیا مطمئن هستید؟ با پرداخت ${tier.joining_cost.toLocaleString()} امتیاز به سطح ${tier.name} ارتقا می‌یابید.`,
            action: () => router.post(route('club.upgrade'), { club_id: tier.id }, { 
                onFinish: () => setModal(prev => ({ ...prev, isOpen: false })) 
            })
        });
    };

    const handleJoinSpecial = (club: SpecialClub) => {
        if (!club.can_join) return;

        setModal({
            isOpen: true,
            title: 'عضویت در باشگاه ویژه',
            message: `برای عضویت در "${club.name}" مبلغ ${club.joining_cost.toLocaleString()} امتیاز کسر می‌شود. ادامه می‌دهید؟`,
            action: () => router.post(route('clubs.join', club.id), {}, { 
                onFinish: () => setModal(prev => ({ ...prev, isOpen: false })) 
            })
        });
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'باشگاه‌های من' }]}>
            <Head title="باشگاه‌های مشتریان" />

            {/* Inline Alerts Removed: Handled by ToastContainer */}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Award className="text-primary-600" />
                        باشگاه‌های مشتریان
                    </h1>
                    <p className="text-gray-500 mt-1">سطح خود را ارتقا دهید و در باشگاه‌های ویژه عضو شوید.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 px-4 py-2 rounded-xl text-sm">
                        سطح فعلی: <span className="font-bold" style={{ color: currentClub?.color }}>{currentClub?.name || 'تازه وارد'}</span>
                    </div>
                    <div className="bg-gradient-to-l from-primary-600 to-primary-500 text-white px-4 py-2 rounded-xl shadow-lg font-bold">
                        {safePoints.toLocaleString()} امتیاز
                    </div>
                </div>
            </div>

            {/* Section 1: Progress Path (Tiers) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 overflow-hidden">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <ArrowLeft className="text-gray-400" size={20} />
                    مسیر پیشرفت شما
                </h2>
                
                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-gray-100 rounded-full -z-0"></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                        {safeTiers.map((tier) => (
                            <TierCard key={tier.id} tier={tier} onUpgrade={handleUpgrade} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Section 2: Special Clubs */}
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 px-1">
                <Crown className="text-amber-500" />
                باشگاه‌های ویژه (عضویت جانبی)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {safeSpecialClubs.map((club) => (
                    <SpecialClubCard key={club.id} club={club} onJoin={handleJoinSpecial} />
                ))}
                
                {safeSpecialClubs.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
                        <Star size={48} className="mx-auto text-gray-300 mb-3" />
                        <p>هیچ باشگاه ویژه‌ای در حال حاضر وجود ندارد.</p>
                    </div>
                )}
            </div>

            <ConfirmModal 
                isOpen={modal.isOpen}
                onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modal.action}
                title={modal.title}
                message={modal.message}
                confirmText="تایید و انجام"
                type="info"
            />
        </DashboardLayout>
    );
}