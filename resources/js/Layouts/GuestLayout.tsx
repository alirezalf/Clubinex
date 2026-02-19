import React, { PropsWithChildren, useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Instagram, Twitter, Linkedin, Phone, Mail, MapPin, Send, Calendar, User, LayoutDashboard } from 'lucide-react';
import { PageProps } from '@/types';

// تعریف اینترفیس برای تنظیمات سایت
interface SiteSettings {
    name: string;
    description: string;
    logo: string | null;
    socials: {
        instagram: string | null;
        telegram: string | null;
        whatsapp: string | null;
        linkedin: string | null;
    };
    contact: {
        phone: string;
        email: string;
        address: string;
    };
}

export default function GuestLayout({ children }: PropsWithChildren) {
    // دریافت اطلاعات سایت و احراز هویت از طریق Inertia shared props
    const { site, auth } = usePage<PageProps & { site: SiteSettings }>().props;
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        const date = new Date().toLocaleDateString('fa-IR', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
        setCurrentDate(date);
    }, []);

    return (
        <div className="min-h-screen flex flex-col font-sans bg-white" dir="rtl">
            {/* Top Bar */}
            <div className="bg-primary-900 text-white text-xs py-2 px-6">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
                    {/* راست: تاریخ و تلفن */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 opacity-90">
                            <Calendar size={14} />
                            <span>{currentDate}</span>
                        </div>
                        {site.contact.phone && (
                            <a href={`tel:${site.contact.phone}`} className="hover:text-primary-200 transition flex items-center gap-1 border-r border-white/20 pr-4 mr-2">
                                <Phone size={14} /> <span dir="ltr">{site.contact.phone}</span>
                            </a>
                        )}
                    </div>

                    {/* چپ: شبکه‌های اجتماعی */}
                    <div className="flex gap-3 items-center">
                        <span className="hidden sm:inline opacity-70">ما را دنبال کنید:</span>
                        {site.socials.instagram && <a href={site.socials.instagram} target="_blank" className="hover:text-primary-200 transition"><Instagram size={14} /></a>}
                        {site.socials.telegram && <a href={site.socials.telegram} target="_blank" className="hover:text-primary-200 transition"><Send size={14} /></a>}
                        {site.socials.linkedin && <a href={site.socials.linkedin} target="_blank" className="hover:text-primary-200 transition"><Linkedin size={14} /></a>}
                        {site.contact.email && (
                            <a href={`mailto:${site.contact.email}`} className="hover:text-primary-200 transition flex items-center gap-1 border-r border-white/20 pr-3 mr-1">
                                <Mail size={14} />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Header */}
            <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        {site.logo ? (
                            <img src={site.logo} alt={site.name} className="h-10 w-auto" />
                        ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30">
                                {site.name.charAt(0)}
                            </div>
                        )}
                        <span className="font-bold text-xl text-gray-800">{site.name}</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                        <Link href="/" className="hover:text-primary-600 transition">خانه</Link>
                        <a href="#features" className="hover:text-primary-600 transition">امکانات</a>
                        <a href="#pricing" className="hover:text-primary-600 transition">تعرفه‌ها</a>
                        <a href="#contact" className="hover:text-primary-600 transition">تماس با ما</a>
                    </nav>

                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <Link href={route('dashboard')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition font-medium text-sm">
                                <LayoutDashboard size={18} />
                                داشبورد
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition font-medium text-sm">
                                    ورود
                                </Link>
                                <Link href={route('login')} className="hidden sm:inline-block px-5 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition font-medium text-sm">
                                    عضویت رایگان
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4 text-white">
                                {site.logo ? (
                                    <img src={site.logo} alt={site.name} className="h-8 w-auto bg-white rounded p-1" />
                                ) : (
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-900 font-bold">W</div>
                                )}
                                <span className="font-bold text-lg">{site.name}</span>
                            </div>
                            <p className="text-sm leading-relaxed text-gray-400 mb-6">
                                {site.description || 'بهترین راهکار برای مدیریت باشگاه مشتریان و افزایش وفاداری.'}
                            </p>
                            <div className="flex gap-3">
                                {site.socials.instagram && <a href={site.socials.instagram} className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition"><Instagram size={18} /></a>}
                                {site.socials.twitter && <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition"><Twitter size={18} /></a>}
                                {site.socials.linkedin && <a href={site.socials.linkedin} className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition"><Linkedin size={18} /></a>}
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="text-white font-bold mb-6">دسترسی سریع</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-primary-400 transition">درباره ما</a></li>
                                <li><a href="#" className="hover:text-primary-400 transition">قوانین و مقررات</a></li>
                                <li><a href="#" className="hover:text-primary-400 transition">حریم خصوصی</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6">خدمات</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-primary-400 transition">باشگاه مشتریان</a></li>
                                <li><a href="#" className="hover:text-primary-400 transition">قرعه‌کشی آنلاین</a></li>
                                <li><a href="#" className="hover:text-primary-400 transition">گیمیفیکیشن</a></li>
                            </ul>
                        </div>

                        <div id="contact">
                            <h4 className="text-white font-bold mb-6">تماس با ما</h4>
                            <ul className="space-y-4 text-sm">
                                {site.contact.address && (
                                    <li className="flex items-start gap-3">
                                        <MapPin className="mt-1 text-primary-500 shrink-0" size={18} />
                                        <span>{site.contact.address}</span>
                                    </li>
                                )}
                                {site.contact.phone && (
                                    <li className="flex items-center gap-3">
                                        <Phone className="text-primary-500 shrink-0" size={18} />
                                        <span dir="ltr">{site.contact.phone}</span>
                                    </li>
                                )}
                                {site.contact.email && (
                                    <li className="flex items-center gap-3">
                                        <Mail className="text-primary-500 shrink-0" size={18} />
                                        <span>{site.contact.email}</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                        <p>© ۱۴۰۳ تمامی حقوق برای {site.name} محفوظ است.</p>
                        <p>طراحی و توسعه با عشق ❤️</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}