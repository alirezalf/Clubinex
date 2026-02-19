import React from 'react';
import { Shield, CheckCircle, Lock } from 'lucide-react';
import clsx from 'clsx';

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

interface Props {
    tier: Tier;
    onUpgrade: (tier: Tier) => void;
}

export default function TierCard({ tier, onUpgrade }: Props) {
    return (
        <div className={clsx(
            "relative rounded-xl p-4 border-2 transition-all duration-300 flex flex-col items-center text-center",
            tier.status === 'current' ? "border-primary-500 bg-primary-50 shadow-md transform scale-105" :
            tier.status === 'passed' ? "border-green-200 bg-green-50 opacity-70" :
            "border-gray-100 bg-white opacity-60 grayscale hover:grayscale-0"
        )}>
            {/* Status Badge */}
            {tier.status === 'current' && (
                <div className="absolute -top-3 bg-primary-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                    سطح شما
                </div>
            )}
            {tier.status === 'passed' && (
                <div className="absolute -top-3 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                    تکمیل شده
                </div>
            )}

            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-inner bg-white" style={{ color: tier.color }}>
                <Shield size={32} />
            </div>
            
            <h3 className="font-bold text-gray-800 mb-1">{tier.name}</h3>
            <p className="text-xs text-gray-500 mb-3">هزینه ارتقا: {tier.joining_cost.toLocaleString()}</p>
            
            <div className="text-xs text-gray-600 space-y-1.5 mb-4 w-full px-1">
                {tier.benefits && tier.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center justify-center gap-1.5">
                        <CheckCircle size={12} className="text-green-500 shrink-0" />
                        <span>{benefit}</span>
                    </div>
                ))}
            </div>

            <div className="mt-auto w-full">
                {tier.is_next ? (
                    <button
                        onClick={() => onUpgrade(tier)}
                        disabled={!tier.can_upgrade}
                        className={clsx(
                            "w-full py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm",
                            tier.can_upgrade 
                                ? "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md" 
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        )}
                    >
                        {tier.can_upgrade ? 'ارتقا سطح' : 'امتیاز ناکافی'}
                        {!tier.can_upgrade && <Lock size={14} />}
                    </button>
                ) : tier.status === 'passed' ? (
                    <button disabled className="w-full py-2 rounded-lg text-sm font-bold bg-gray-100 text-gray-400 flex items-center justify-center gap-2 cursor-default">
                        <CheckCircle size={14} /> عبور کرده‌اید
                    </button>
                ) : tier.status === 'current' ? (
                    <button disabled className="w-full py-2 rounded-lg text-sm font-bold bg-primary-100 text-primary-700 flex items-center justify-center gap-2 cursor-default border border-primary-200">
                        موقعیت فعلی
                    </button>
                ) : (
                    <button disabled className="w-full py-2 rounded-lg text-sm font-bold bg-gray-50 text-gray-300 flex items-center justify-center gap-2 cursor-not-allowed">
                        <Lock size={14} /> قفل
                    </button>
                )}
            </div>
        </div>
    );
}