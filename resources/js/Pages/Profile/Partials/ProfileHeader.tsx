import React, { useRef } from 'react';
import { Camera, Award } from 'lucide-react';
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

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <div className="w-24 h-24 rounded-full bg-primary-50 border-4 border-white shadow-md flex items-center justify-center text-primary-600 text-3xl font-bold overflow-hidden">
                    {avatarData ? (
                        <img src={URL.createObjectURL(avatarData)} className="w-full h-full object-cover" />
                    ) : user.avatar ? (
                        <img src={user.avatar} className="w-full h-full object-cover" />
                    ) : (
                        user.first_name?.[0]
                    )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={onFileChange} 
                />
            </div>

            <div className="flex-1 text-center md:text-right w-full">
                <div className="flex flex-col md:flex-row justify-between items-center mb-2">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-1">
                            {user.first_name} {user.last_name}
                        </h1>
                        <p className="text-gray-500">{user.mobile}</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col items-end">
                        {user.club && (
                            <span className="px-4 py-1.5 rounded-full text-sm font-bold text-white shadow-sm flex items-center gap-2" style={{ backgroundColor: user.club.color }}>
                                <Award size={16} /> باشگاه {user.club.name}
                            </span>
                        )}
                        <span className="text-xs text-gray-400 mt-1">امتیاز فعلی: {(user.current_points || 0).toLocaleString()}</span>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">تکمیل پروفایل</span>
                        <span className="font-bold text-primary-600">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${progress === 100 ? 'bg-green-500' : 'bg-primary-500'}`} style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}