import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ShieldAlert, Home, ArrowRight } from 'lucide-react';

export default function Error403() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4 font-sans relative overflow-hidden" dir="rtl">
            <Head title="دسترسی غیرمجاز" />
            
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:20px_20px]"></div>
            </div>

            <div className="text-center max-w-lg w-full bg-white p-12 rounded-[2.5rem] shadow-2xl border border-red-100 relative z-10">
                <div className="mb-6 flex justify-center">
                    <div className="bg-red-100 p-6 rounded-3xl animate-pulse">
                        <ShieldAlert size={64} className="text-red-600" />
                    </div>
                </div>
                
                <h1 className="text-2xl font-black text-red-700 mb-4">دسترسی غیرمجاز (403)</h1>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    شما اجازه دسترسی به این صفحه را ندارید.
                    <br/>
                    اگر فکر می‌کنید اشتباهی رخ داده، با پشتیبانی تماس بگیرید.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/" className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-500/20 font-bold">
                        <Home size={18} /> صفحه اصلی
                    </Link>
                    <button onClick={() => window.history.back()} className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition font-medium">
                        <ArrowRight size={18} /> بازگشت
                    </button>
                </div>
            </div>
        </div>
    );
}