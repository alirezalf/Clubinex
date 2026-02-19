import React from 'react';
import { Star, CheckCircle, Lock } from 'lucide-react';
import clsx from 'clsx';

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

interface Props {
    club: SpecialClub;
    onJoin: (club: SpecialClub) => void;
}

export default function SpecialClubCard({ club, onJoin }: Props) {
    return (
        <div className={clsx(
            "bg-white rounded-2xl shadow-sm border p-6 transition-all hover:shadow-md",
            club.is_member ? "border-green-200 ring-1 ring-green-100" : "border-gray-100"
        )}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gray-50 text-gray-600" style={{ color: club.color }}>
                        <Star size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{club.name}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {club.joining_cost > 0 ? `${club.joining_cost.toLocaleString()} امتیاز` : 'رایگان'}
                        </span>
                    </div>
                </div>
                {club.is_member && (
                    <span className="bg-green-100 text-green-700 p-1.5 rounded-full">
                        <CheckCircle size={16} />
                    </span>
                )}
            </div>

            <div className="space-y-2 mb-6 min-h-[60px]">
                {club.benefits && club.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle size={14} className="text-green-500" />
                        {benefit}
                    </div>
                ))}
            </div>

            {club.is_member ? (
                <button disabled className="w-full py-2.5 rounded-xl bg-green-50 text-green-600 font-bold border border-green-200 cursor-default">
                    عضو هستید
                </button>
            ) : (
                <button
                    onClick={() => onJoin(club)}
                    disabled={!club.can_join}
                    className={clsx(
                        "w-full py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2",
                        club.can_join 
                            ? "bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-500/20" 
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                >
                    عضویت در باشگاه
                    {!club.can_join && <Lock size={16} />}
                </button>
            )}
        </div>
    );
}