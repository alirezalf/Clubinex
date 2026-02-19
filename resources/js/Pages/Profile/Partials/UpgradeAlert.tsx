import React from 'react';
import { router } from '@inertiajs/react';
import { ArrowUpCircle, Shield, Award } from 'lucide-react';
import { User } from '@/types';

interface Props {
    user: User & {
        club?: { name: string, color: string, id: number, next_club?: { id: number, name: string, min_points: number, benefits: string[] } };
        current_points: number;
    };
}

export default function UpgradeAlert({ user }: Props) {
    if (!user.club?.next_club) return null;

    const handleUpgrade = () => {
        if (!user.club?.next_club) return;
        const cost = user.club.next_club.min_points;
        if (confirm(`آیا مطمئن هستید؟ با پرداخت ${cost.toLocaleString()} امتیاز به سطح ${user.club.next_club.name} ارتقا می‌یابید.`)) {
            router.post(route('club.upgrade'), {
                club_id: user.club.next_club.id
            }, { preserveScroll: true });
        }
    };

    return (
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden animate-in slide-in-from-top-4 duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <ArrowUpCircle size={28} className="text-yellow-300" />
                        ارتقا به سطح {user.club.next_club.name}
                    </h2>
                    <p className="text-indigo-100 mb-4 opacity-90 max-w-xl text-lg">
                        با ارتقای سطح کاربری، به تخفیف‌های بیشتر، جوایز ویژه و پشتیبانی اختصاصی دسترسی پیدا کنید.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 border border-white/10">
                            <Shield size={18} className="text-indigo-200" />
                            <span>سطح فعلی: {user.club.name}</span>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 border border-white/10 font-bold">
                            <Award size={18} className="text-yellow-300" />
                            <span>هزینه ارتقا: {user.club.next_club.min_points.toLocaleString()} امتیاز</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 min-w-[200px]">
                    {user.current_points >= user.club.next_club.min_points ? (
                        <button onClick={handleUpgrade} className="w-full bg-yellow-400 text-indigo-900 py-3 px-6 rounded-xl font-bold hover:bg-yellow-300 transition shadow-lg transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                            <ArrowUpCircle size={20} /> ارتقای سطح همین حالا
                        </button>
                    ) : (
                        <div className="w-full bg-white/10 text-white py-3 px-6 rounded-xl text-center border border-white/20">
                            <span className="block font-bold opacity-80 text-sm">امتیاز ناکافی</span>
                            <span className="text-xs opacity-60">{(user.club.next_club.min_points - user.current_points).toLocaleString()} امتیاز دیگر نیاز دارید</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}