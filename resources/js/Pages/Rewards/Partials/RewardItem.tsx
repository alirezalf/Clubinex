import React from 'react';
import { Gift, ShoppingCart } from 'lucide-react';

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

interface Props {
    reward: Reward;
    onRedeem: (id: number, title: string) => void;
    processing: boolean;
    points: number;
}

export default function RewardItem({ reward, onRedeem, processing, points }: Props) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
            <div className="h-48 bg-gray-50 relative flex items-center justify-center p-4">
                {reward.image ? (
                    <img src={reward.image} alt={reward.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                ) : (
                    <Gift size={48} className="text-gray-300 group-hover:scale-110 transition-transform duration-300" />
                )}
                
                {reward.club && (
                    <div 
                        className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: reward.club.color }}
                    >
                        سطح {reward.club.name}
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">{reward.title}</h3>
                <p className="text-gray-500 text-sm h-10 line-clamp-2 mb-4">{reward.description || 'بدون توضیحات'}</p>

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="text-primary-600 font-bold">
                        {reward.points_cost.toLocaleString()} <span className="text-xs font-normal">امتیاز</span>
                    </div>
                    <button
                        onClick={() => onRedeem(reward.id, reward.title)}
                        disabled={!reward.can_redeem || processing}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                            ${reward.can_redeem 
                                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <ShoppingCart size={16} />
                        دریافت
                    </button>
                </div>
                
                {!reward.can_redeem && (
                    <div className="mt-2 text-xs text-red-500 text-center bg-red-50 py-1 rounded">
                        {points < reward.points_cost ? 'امتیاز ناکافی' : 'عدم دسترسی سطح باشگاه'}
                    </div>
                )}
            </div>
        </div>
    );
}