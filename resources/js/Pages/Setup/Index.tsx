import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Shield, Smartphone, Lock, AlertCircle, ArrowRight, Loader2, Mail, XCircle } from 'lucide-react';
import clsx from 'clsx';

export default function Setup() {
    const { data, setData, post, processing, errors } = useForm({
        mobile: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const { flash } = usePage<any>().props;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/setup');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-900" dir="rtl">
            <Head title="نصب و راه‌اندازی اولیه" />

            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header Pattern */}
                <div className="bg-primary-600 relative overflow-hidden py-8 px-6 text-center">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/30 shadow-lg">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-white">نصب و راه‌اندازی</h1>
                        <p className="text-white/80 text-sm mt-1">ایجاد حساب مدیریت کل (Super Admin)</p>
                    </div>
                </div>

                {/* Form */}
                <div className="p-8">
                    {flash?.error && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 mb-6">
                            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div className="text-[12px] text-red-700 leading-relaxed font-medium">
                                {flash.error}
                            </div>
                        </div>
                    )}

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 mb-6">
                        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div className="text-[12px] text-blue-700 leading-relaxed font-medium">
                            به سیستم کلابینکس خوش آمدید! دیتابیس فعلاً خالی است. برای شروع، اطلاعات ورود اولین مدیر سیستم را تعیین کنید تا تنظیمات پایه اعمال شوند.
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        {/* Mobile */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">شماره موبایل مدیر تخصیص یابد</label>
                            <div className="relative">
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Smartphone className="w-5 h-5" />
                                </span>
                                <input
                                    type="tel"
                                    value={data.mobile}
                                    onChange={e => setData('mobile', e.target.value)}
                                    placeholder="مثال: 09123456789"
                                    className={clsx(
                                        "w-full bg-gray-50 border pr-12 pl-4 py-3 rounded-xl outline-none transition-all text-left font-mono focus:bg-white",
                                        errors.mobile ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                                    )}
                                    maxLength={11}
                                    dir="ltr"
                                />
                            </div>
                            {errors.mobile && <p className="text-xs text-red-500 mt-1 font-medium">{errors.mobile}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">ایمیل مدیر</label>
                            <div className="relative">
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail className="w-5 h-5" />
                                </span>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="مثال: admin@example.com"
                                    className={clsx(
                                        "w-full bg-gray-50 border pr-12 pl-4 py-3 rounded-xl outline-none transition-all text-left font-mono focus:bg-white",
                                        errors.email ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                                    )}
                                    dir="ltr"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">کلمه عبور</label>
                            <div className="relative">
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock className="w-5 h-5" />
                                </span>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    placeholder="حداقل ۶ کاراکتر"
                                    className={clsx(
                                        "w-full bg-gray-50 border pr-12 pl-4 py-3 rounded-xl outline-none transition-all text-left font-mono focus:bg-white",
                                        errors.password ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                                    )}
                                    dir="ltr"
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-500 mt-1 font-medium">{errors.password}</p>}
                        </div>

                        {/* Password Confirm */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">تکرار کلمه عبور</label>
                            <div className="relative">
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock className="w-5 h-5" />
                                </span>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    placeholder="تکرار همان کلمه عبور..."
                                    className={clsx(
                                        "w-full bg-gray-50 border pr-12 pl-4 py-3 rounded-xl outline-none transition-all text-left font-mono focus:bg-white",
                                        errors.password_confirmation ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                                    )}
                                    dir="ltr"
                                />
                            </div>
                            {errors.password_confirmation && <p className="text-xs text-red-500 mt-1 font-medium">{errors.password_confirmation}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing || !data.mobile || !data.email || !data.password || data.password !== data.password_confirmation}
                            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/20 text-white rounded-xl py-3.5 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {processing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>نصب و اعمال تنظیمات</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <p className="fixed bottom-4 text-gray-400 text-xs font-mono">Powered by Clubinex Platform</p>
        </div>
    );
}
