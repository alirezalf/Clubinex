import React from 'react';
import { Head } from '@inertiajs/react';
import { CloudOff, Clock, Wrench } from 'lucide-react';

export default function Error503() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4 font-sans" dir="rtl">
            <Head title="در حال بروزرسانی" />
            <div className="text-center max-w-lg w-full">
                <div className="mb-8 flex justify-center relative">
                    <div className="absolute inset-0 bg-amber-200 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                    <CloudOff size={100} className="text-amber-500 relative z-10" />
                    <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md">
                        <Wrench size={24} className="text-amber-600" />
                    </div>
                </div>
                
                <h1 className="text-3xl font-black text-amber-900 mb-4">سایت در حال بروزرسانی است</h1>
                <p className="text-amber-700 mb-8 text-lg leading-relaxed">
                    در حال انجام تغییرات و بهبود سیستم هستیم.
                    <br/>
                    لطفاً دقایقی دیگر مراجعه کنید. از شکیبایی شما سپاسگزاریم.
                </p>
                
                <div className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-full shadow-sm text-amber-600 font-bold border border-amber-100">
                    <Clock size={22} className="animate-spin-slow" />
                    <span>به زودی برمی‌گردیم...</span>
                </div>
                
                <style>{`
                    .animate-spin-slow { animation: spin 4s linear infinite; }
                `}</style>
            </div>
        </div>
    );
}