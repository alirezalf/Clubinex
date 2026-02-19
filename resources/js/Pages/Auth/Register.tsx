import React, { FormEvent, useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Loader2, User, Mail, Lock, Phone, RefreshCw, UserPlus } from 'lucide-react';

export default function Register() {
    const [captchaUrl, setCaptchaUrl] = useState<string | null>(null);

    const refreshCaptcha = () => {
        setCaptchaUrl(`/captcha/flat?${Math.random()}`);
    };

    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        mobile: '',
        password: '',
        password_confirmation: '',
        captcha: '',
        referral_code: '', // اضافه شده برای ذخیره کد معرف
    });

    useEffect(() => {
        refreshCaptcha();
        
        // دریافت کد معرف از URL
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) {
            setData('referral_code', ref);
        }
    }, []);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('register'), {
            onError: () => refreshCaptcha()
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4" dir="rtl">
            <Head title="ثبت نام" />
            
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-800">ایجاد حساب کاربری</h1>
                        <p className="text-gray-500 mt-2">به جمع مشتریان ما بپیوندید</p>
                    </div>

                    {data.referral_code && (
                        <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg mb-6 border border-blue-200 flex items-center gap-2">
                            <UserPlus size={16} />
                            شما با کد دعوت <b>{data.referral_code}</b> در حال ثبت‌نام هستید.
                        </div>
                    )}

                    {!data.referral_code && (
                        <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg mb-6 border border-yellow-200">
                            توجه: برای اولین ثبت‌نام حتماً شماره موبایل معتبر خود را وارد کنید.
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={data.first_name}
                                        onChange={e => setData('first_name', e.target.value)}
                                        className="w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        required
                                    />
                                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">نام خانوادگی</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={data.last_name}
                                        onChange={e => setData('last_name', e.target.value)}
                                        className="w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        required
                                    />
                                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">شماره موبایل</label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={data.mobile}
                                    onChange={e => setData('mobile', e.target.value)}
                                    className="w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-left ltr"
                                    placeholder="0912..."
                                    required
                                />
                                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                            {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-left ltr"
                                    required
                                />
                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className="w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-left ltr"
                                    required
                                />
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">تکرار رمز عبور</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    className="w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-left ltr"
                                    required
                                />
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                        </div>
                        
                        {/* Captcha */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">کد امنیتی</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={data.captcha}
                                    onChange={(e) => setData('captcha', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dir-ltr text-center"
                                    required
                                />
                                <div className="relative group cursor-pointer" onClick={refreshCaptcha}>
                                    {captchaUrl ? (
                                        <img src={captchaUrl} alt="captcha" className="h-10 rounded-lg border min-w-[120px] object-cover" />
                                    ) : (
                                        <div className="h-10 w-[120px] bg-gray-100 rounded-lg border flex items-center justify-center text-gray-400 text-xs">
                                            در حال بارگذاری...
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-lg">
                                        <RefreshCw size={16} className="text-white" />
                                    </div>
                                </div>
                            </div>
                            {errors.captcha && <p className="text-red-500 text-xs mt-1">{errors.captcha}</p>}
                        </div>

                        {/* Hidden Referral Input */}
                        <input type="hidden" name="referral_code" value={data.referral_code} />

                        <button
                            disabled={processing}
                            className="w-full bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2"
                        >
                            {processing && <Loader2 className="animate-spin" size={18} />}
                            ثبت نام
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        حساب کاربری دارید؟ 
                        <Link href={route('login')} className="text-primary-600 font-bold mr-1 hover:underline">
                            وارد شوید
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}