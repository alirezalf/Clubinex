import React from 'react';
import { Head } from '@inertiajs/react';
import { ServerCrash, RefreshCcw } from 'lucide-react';

export default function Error500() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 font-sans text-white relative overflow-hidden" dir="rtl">
            <Head title="خطای سرور" />
            
            <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-32 h-32 bg-blue-600 rounded-full blur-[100px] opacity-20"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-600 rounded-full blur-[100px] opacity-20"></div>
            </div>

            <div className="text-center max-w-lg w-full relative z-10">
                <div className="mb-8 flex justify-center">
                    <ServerCrash size={100} className="text-blue-400 opacity-80" strokeWidth={1} />
                </div>
                
                <h1 className="text-4xl font-black mb-4 tracking-tight">خطای سرور (500)</h1>
                <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                    متاسفانه مشکلی در سمت سرور رخ داده است.
                    <br/>
                    تیم فنی ما به صورت خودکار از این مشکل مطلع شده و در حال بررسی هستند.
                </p>
                
                <button 
                    onClick={() => window.location.reload()} 
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 font-bold mx-auto hover:scale-105 transform duration-200"
                >
                    <RefreshCcw size={20} /> تلاش مجدد
                </button>
            </div>
        </div>
    );
}