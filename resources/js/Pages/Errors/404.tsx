import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { FileQuestion, Home, ArrowRight } from 'lucide-react';

export default function Error404() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans relative overflow-hidden" dir="rtl">
            <Head title="صفحه پیدا نشد" />
            
            {/* Background Decoration */}
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-200 opacity-20 blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-200 opacity-20 blur-3xl"></div>

            <div className="text-center max-w-lg w-full relative z-10">
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="text-[180px] font-black text-gray-100 leading-none select-none tracking-tighter">404</div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-purple-50 p-6 rounded-3xl shadow-inner transform rotate-6 hover:rotate-0 transition-transform duration-500">
                                <FileQuestion size={80} className="text-purple-600 drop-shadow-sm" />
                            </div>
                        </div>
                    </div>
                </div>
                
                <h1 className="text-3xl font-black text-gray-800 mb-4">صفحه مورد نظر یافت نشد!</h1>
                <p className="text-gray-500 mb-10 text-lg leading-relaxed">
                    متاسفانه آدرسی که وارد کرده‌اید وجود ندارد یا حذف شده است.
                    <br/>
                    شاید آدرس را اشتباه تایپ کرده‌اید؟
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/" className="flex items-center justify-center gap-2 bg-purple-600 text-white px-8 py-3.5 rounded-2xl hover:bg-purple-700 transition shadow-lg shadow-purple-500/30 font-bold hover:-translate-y-1">
                        <Home size={20} /> صفحه اصلی
                    </Link>
                    <button onClick={() => window.history.back()} className="flex items-center justify-center gap-2 bg-white text-gray-600 border border-gray-200 px-8 py-3.5 rounded-2xl hover:bg-gray-50 transition font-medium">
                        <ArrowRight size={20} /> بازگشت
                    </button>
                </div>
            </div>
        </div>
    );
}