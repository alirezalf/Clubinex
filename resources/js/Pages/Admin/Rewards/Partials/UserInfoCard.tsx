import React from 'react';
import { User, Phone, MapPin, CreditCard } from 'lucide-react';

interface Props {
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
    };
}

export default function UserInfoCard({ user, stats }: Props) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden animate-in fade-in slide-in-from-top-4">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary-50 rounded-br-full -mt-10 -ml-10 opacity-50"></div>
            
            <div className="flex flex-col md:flex-row gap-8 relative z-10">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 border border-gray-200">
                            <User size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                            <p className="text-sm text-gray-500 mt-1">شناسه کاربر: <span className="font-mono">{user.id}</span></p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                            <Phone size={16} className="text-gray-400" /> <span className="font-mono text-gray-800">{user.mobile}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                            <CreditCard size={16} className="text-gray-400" /> 
                            <span>کد ملی: <span className="font-mono text-gray-800">{user.national_code}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 sm:col-span-2 px-2">
                            <MapPin size={16} className="text-gray-400 shrink-0" /> 
                            <span className="truncate">{user.address || 'آدرس ثبت نشده'}</span>
                        </div>
                    </div>
                </div>

                <div className="w-px bg-gray-100 hidden md:block"></div>

                <div className="flex-1 flex flex-col justify-center gap-4">
                    <div className="flex items-center justify-between bg-primary-50 p-3 rounded-xl border border-primary-100">
                        <span className="text-primary-800 font-bold text-sm">موجودی فعلی:</span>
                        <span className="text-2xl font-black text-primary-600 font-mono tracking-tight">{user.current_points.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between px-2">
                        <span className="text-gray-500 text-sm font-medium">سطح باشگاه:</span>
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-bold border border-purple-200 shadow-sm">{user.club}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-green-50 p-2.5 rounded-xl text-green-800 text-center border border-green-100">
                            <div className="font-black text-base mb-1 font-mono">+{stats.total_earned.toLocaleString()}</div>
                            <span className="opacity-80">مجموع کسب شده</span>
                        </div>
                        <div className="bg-red-50 p-2.5 rounded-xl text-red-800 text-center border border-red-100">
                            <div className="font-black text-base mb-1 font-mono">-{stats.total_spent.toLocaleString()}</div>
                            <span className="opacity-80">مجموع خرج شده</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}