import React from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Info, User, Phone, Layers, ShieldCheck, Star } from 'lucide-react';

interface Props {
    appVersion: string;
    author: string;
    mobile: string;
    appName: string;
    description: string;
}

export default function AboutUs({ appVersion, author, mobile, appName, description }: Props) {
    return (
        <DashboardLayout breadcrumbs={[{ label: 'درباره ما', href: route('about') }]}>
            <Head title="درباره نرم‌افزار" />

            <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-3xl rotate-12 flex items-center justify-center shadow-lg mb-6">
                        <Layers size={36} className="text-white -rotate-12" />
                    </div>
                    
                    <h1 className="text-2xl font-bold text-gray-800 mb-2 font-black">{appName}</h1>
                    <p className="text-gray-500 max-w-lg mb-6 leading-relaxed">
                        {description}
                    </p>
                    
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-bold text-sm">
                        <Info size={16} />
                        نسخه {appVersion}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4 transition hover:shadow-md">
                        <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm text-gray-500 mb-1">نویسنده و توسعه‌دهنده</h3>
                            <p className="font-bold text-gray-800 text-lg">{author}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4 transition hover:shadow-md">
                        <div className="bg-green-100 p-3 rounded-xl text-green-600">
                            <Phone size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm text-gray-500 mb-1">شماره تماس (پشتیبانی)</h3>
                            <p className="font-bold text-gray-800 text-lg dir-ltr">{mobile}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Star size={18} className="text-amber-500" />
                        ویژگی‌های کلیدی سیستم
                    </h2>
                    
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                        <li className="flex items-center gap-2 relative pl-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-blue-500 before:rounded-full">
                            داشبورد مدیریتی مجزا با گزارشات آنی
                        </li>
                        <li className="flex items-center gap-2 relative pl-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-blue-500 before:rounded-full">
                            گیمیفیکیشن پیشرفته (باشگاه، گردونه شانس)
                        </li>
                        <li className="flex items-center gap-2 relative pl-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-blue-500 before:rounded-full">
                            شبکه معرفی و سیستم همکاری در فروش
                        </li>
                        <li className="flex items-center gap-2 relative pl-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-blue-500 before:rounded-full">
                            هسته‌ قدرتمند مبتنی بر لاراول و React
                        </li>
                        <li className="flex items-center gap-2 relative pl-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-blue-500 before:rounded-full">
                            مدیریت دسترسی‌های دانه ریز کاربران
                        </li>
                        <li className="flex items-center gap-2 relative pl-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-blue-500 before:rounded-full">
                            رابط کاربری پیشرفته و واکنش‌گرا
                        </li>
                    </ul>
                </div>
            </div>
        </DashboardLayout>
    );
}
