import React from 'react';
import { Shield, Award, MessageSquare, X } from 'lucide-react';

interface Props {
    count: number;
    onAction: (action: 'change_status' | 'change_club' | 'send_message') => void;
    onClear: () => void;
}

export default function UserBulkFloatingBar({ count, onAction, onClear }: Props) {
    if (count === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white border border-gray-200 rounded-2xl shadow-2xl p-2 flex items-center gap-2 animate-in slide-in-from-bottom-6 fade-in duration-300">
            <div className="bg-primary-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md whitespace-nowrap">
                <span>{count}</span>
                <span>انتخاب شده</span>
            </div>
            
            <div className="w-px h-6 bg-gray-200 mx-1"></div>

            <div className="flex items-center gap-1">
                <button 
                    onClick={() => onAction('change_status')}
                    className="flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded-xl text-gray-700 text-xs font-bold transition-colors whitespace-nowrap"
                >
                    <Shield size={16} className="text-blue-600" />
                    <span className="hidden sm:inline">تغییر وضعیت</span>
                </button>
                
                <button 
                    onClick={() => onAction('change_club')}
                    className="flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded-xl text-gray-700 text-xs font-bold transition-colors whitespace-nowrap"
                >
                    <Award size={16} className="text-purple-600" />
                    <span className="hidden sm:inline">تغییر سطح</span>
                </button>

                <button 
                    onClick={() => onAction('send_message')}
                    className="flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded-xl text-gray-700 text-xs font-bold transition-colors whitespace-nowrap"
                >
                    <MessageSquare size={16} className="text-green-600" />
                    <span className="hidden sm:inline">ارسال پیام</span>
                </button>
            </div>

            <div className="w-px h-6 bg-gray-200 mx-1"></div>

            <button 
                onClick={onClear}
                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-colors"
                title="لغو انتخاب"
            >
                <X size={18} />
            </button>
        </div>
    );
}