import React, { useRef, useState } from 'react';
import { Camera, Award, Star, Sparkles, Medal, TrendingUp } from 'lucide-react';
import { User } from '@/types';

interface Props {
    user: User & {
        club?: { name: string, color: string };
        current_points: number;
        avatar?: string;
    };
    avatarData: File | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    progress: number;
}

export default function ProfileHeader({ user, avatarData, onFileChange, progress }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImagePreview(URL.createObjectURL(file));
            onFileChange(e);
        }
    };

    // تعیین رنگ بر اساس پیشرفت
    const getProgressColor = () => {
        if (progress === 100) return 'bg-gradient-to-r from-emerald-500 to-green-500';
        if (progress >= 70) return 'bg-gradient-to-r from-amber-500 to-amber-600';
        if (progress >= 40) return 'bg-gradient-to-r from-amber-400 to-amber-500';
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
    };

    return (
        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* پس‌زمینه گرادینت بالای هدر */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent" />

            {/* المان‌های تزئینی */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full -translate-x-32 -translate-y-32" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full translate-x-24 translate-y-24" />

            <div className="relative p-6 flex flex-col md:flex-row items-center gap-8">
                {/* بخش آواتار */}
                <div className="relative group">
                    <div
                        className="relative w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-1 cursor-pointer transform transition-transform duration-300 group-hover:scale-105"
                        onClick={handleAvatarClick}
                    >
                        <div className="w-full h-full rounded-full bg-white border-4 border-white/50 overflow-hidden shadow-xl">
                            {(avatarData || imagePreview) ? (
                                <img
                                    src={imagePreview || (avatarData ? URL.createObjectURL(avatarData) : user.avatar)}
                                    alt={user.first_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : user.avatar ? (
                                <img src={user.avatar} alt={user.first_name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 text-3xl font-bold">
                                    {user.first_name?.[0]?.toUpperCase()}
                                    {user.last_name?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* نشان ویژه برای کاربران ویژه */}
                        {progress === 100 && (
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 border-4 border-white shadow-lg">
                                <Sparkles size={14} className="text-white" />
                            </div>
                        )}
                    </div>

                    {/* اوورلی افکت هاور */}
                    <div
                        onClick={handleAvatarClick}
                        className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer transform group-hover:scale-105"
                    >
                        <div className="text-center">
                            <Camera className="text-white mx-auto mb-1" size={22} />
                            <span className="text-white text-xs font-medium">تغییر عکس</span>
                        </div>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>

                {/* اطلاعات کاربر */}
                <div className="flex-1 text-center md:text-right w-full">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 justify-center md:justify-start">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                    {user.first_name} {user.last_name}
                                </h1>
                                {progress === 100 && (
                                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        <Medal size={12} />
                                        کامل
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 justify-center md:justify-start">
                                <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                                    {user.mobile}
                                </span>
                                {user.email && (
                                    <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                                        {user.email}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* بخش باشگاه و امتیاز */}
                        <div className="flex flex-col items-center md:items-end gap-2">
                            {user.club && (
                                <div className="relative group">
                                    <div
                                        className="px-5 py-2 rounded-full text-sm font-bold text-white shadow-lg flex items-center gap-2 transform transition-transform group-hover:scale-105"
                                        style={{
                                            backgroundColor: user.club.color,
                                            boxShadow: `0 10px 20px -5px ${user.club.color}40`
                                        }}
                                    >
                                        <Award size={18} className="animate-pulse" />
                                        <span>باشگاه {user.club.name}</span>
                                    </div>
                                    {/* توضیح باشگاه (مخفی در حالت عادی) */}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-gray-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        سطح {user.club.name} - برای ارتقا به سطح بعدی امتیاز بیشتری کسب کنید
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3 bg-gradient-to-l from-amber-50 to-transparent px-4 py-2 rounded-xl">
                                <div className="flex items-center gap-1.5">
                                    <Star size={16} className="text-amber-500 fill-amber-500" />
                                    <span className="text-sm text-gray-600">امتیاز:</span>
                                </div>
                                <span className="font-bold text-lg text-amber-600">
                                    {(user.current_points || 0).toLocaleString()}
                                </span>
                                <TrendingUp size={16} className="text-green-500" />
                            </div>
                        </div>
                    </div>

                    {/* نوار پیشرفت با طراحی بهتر */}
                    <div className="mt-6 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                تکمیل پروفایل
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-800">{progress}%</span>
                                {progress < 100 && (
                                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                        {100 - progress}% تا کامل شدن
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="relative h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ease-out ${getProgressColor()}`}
                                style={{ width: `${progress}%` }}
                            >
                                {/* انیمیشن حرکت نور روی نوار پیشرفت */}
                                <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-white/30 to-transparent animate-shimmer" />
                            </div>
                        </div>

                        {/* نکات تکمیلی بر اساس پیشرفت */}
                        {progress < 100 && (
                            <div className="flex items-start gap-2 mt-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                                <Sparkles size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700">
                                    با تکمیل اطلاعات پروفایل، شانس دریافت جوایز ویژه را افزایش دهید
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

