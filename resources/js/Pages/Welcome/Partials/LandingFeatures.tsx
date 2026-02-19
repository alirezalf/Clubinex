import React from 'react';
import { Trophy, Users, Zap, ShieldCheck, CheckCircle } from 'lucide-react';

export default function LandingFeatures() {
    const features = [
        { icon: Trophy, title: 'گیمیفیکیشن پیشرفته', desc: 'گردونه شانس، مدال‌ها و سیستم امتیازدهی جذاب برای درگیر کردن مشتریان.', color: 'bg-yellow-500' },
        { icon: Users, title: 'مدیریت مشتریان', desc: 'پروفایل کامل، دسته‌بندی هوشمند و تحلیل رفتار خرید مشتریان.', color: 'bg-blue-500' },
        { icon: Zap, title: 'اتوماسیون بازاریابی', desc: 'ارسال خودکار پیامک و ایمیل در مناسبت‌ها و رویدادهای خاص.', color: 'bg-purple-500' },
        { icon: ShieldCheck, title: 'امنیت بالا', desc: 'رمزنگاری داده‌ها، احراز هویت دو مرحله‌ای و بکاپ‌گیری منظم.', color: 'bg-green-500' },
        { icon: CheckCircle, title: 'گزارش‌دهی دقیق', desc: 'داشبورد مدیریتی کامل با نمودارهای تحلیلی و خروجی اکسل.', color: 'bg-red-500' },
        { icon: CheckCircle, title: 'طراحی واکنش‌گرا', desc: 'سازگار با تمام دستگاه‌ها، موبایل، تبلت و دسکتاپ.', color: 'bg-indigo-500' },
    ];

    return (
        <section id="features" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">چرا Clubinex؟</h2>
                    <p className="text-gray-500">ابزارهایی که برای موفقیت باشگاه مشتریان نیاز دارید</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <div key={i} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition duration-300 border border-gray-100 group">
                            <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition duration-300 shadow-lg`}>
                                <feature.icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}