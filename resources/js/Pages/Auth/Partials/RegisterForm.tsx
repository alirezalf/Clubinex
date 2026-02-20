import React, { FormEvent, useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Loader2, User, Mail, Lock, Phone, RefreshCw } from 'lucide-react';

interface Props {
    captchaUrl: string | null;
    refreshCaptcha: () => void;
}

export default function RegisterForm({ captchaUrl, refreshCaptcha }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        mobile: '',
        password: '',
        password_confirmation: '',
        captcha: '',
        referral_code: '',
    });

    useEffect(() => {
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
        <form onSubmit={submit} className="space-y-2 animate-in fade-in slide-in-from-left-4">
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                    <label className="block text-[10px] font-medium text-gray-500">نام</label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={data.first_name}
                            onChange={e => setData('first_name', e.target.value)}
                            className="w-full pl-2 pr-7 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-[11px] placeholder:text-gray-300"
                            required
                        />
                        <User className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={12} />
                    </div>
                    {errors.first_name && <p className="text-red-500 text-[9px]">{errors.first_name}</p>}
                </div>
                <div className="space-y-0.5">
                    <label className="block text-[10px] font-medium text-gray-500">نام خانوادگی</label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={data.last_name}
                            onChange={e => setData('last_name', e.target.value)}
                            className="w-full pl-2 pr-7 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-[11px] placeholder:text-gray-300"
                            required
                        />
                        <User className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={12} />
                    </div>
                    {errors.last_name && <p className="text-red-500 text-[9px]">{errors.last_name}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                    <label className="block text-[10px] font-medium text-gray-500">موبایل</label>
                    <div className="relative group">
                        <input
                            type="tel"
                            value={data.mobile}
                            onChange={e => setData('mobile', e.target.value)}
                            className="w-full pl-2 pr-7 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-[11px] text-left ltr placeholder:text-gray-300"
                            placeholder="0912..."
                            required
                        />
                        <Phone className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={12} />
                    </div>
                    {errors.mobile && <p className="text-red-500 text-[9px]">{errors.mobile}</p>}
                </div>

                <div className="space-y-0.5">
                    <label className="block text-[10px] font-medium text-gray-500">ایمیل</label>
                    <div className="relative group">
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            className="w-full pl-2 pr-7 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-[11px] text-left ltr placeholder:text-gray-300"
                            required
                        />
                        <Mail className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={12} />
                    </div>
                    {errors.email && <p className="text-red-500 text-[9px]">{errors.email}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                    <label className="block text-[10px] font-medium text-gray-500">رمز عبور</label>
                    <div className="relative group">
                        <input
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            className="w-full pl-2 pr-7 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-[11px] text-left ltr placeholder:text-gray-300"
                            required
                        />
                        <Lock className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={12} />
                    </div>
                    {errors.password && <p className="text-red-500 text-[9px]">{errors.password}</p>}
                </div>

                <div className="space-y-0.5">
                    <label className="block text-[10px] font-medium text-gray-500">تکرار رمز</label>
                    <div className="relative group">
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={e => setData('password_confirmation', e.target.value)}
                            className="w-full pl-2 pr-7 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-[11px] text-left ltr placeholder:text-gray-300"
                            required
                        />
                        <Lock className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={12} />
                    </div>
                </div>
            </div>

            <div className="space-y-0.5">
                <label className="block text-[10px] font-medium text-gray-500">کد امنیتی</label>
                <div className="flex gap-2 h-[34px]">
                    <input
                        type="text"
                        value={data.captcha}
                        onChange={(e) => setData('captcha', e.target.value)}
                        className="w-20 px-2 h-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dir-ltr text-center transition-all text-[11px] font-mono tracking-widest"
                        placeholder="Code"
                        required
                    />
                    <div className="relative group cursor-pointer flex-1 h-full" onClick={refreshCaptcha} title="تغییر کد">
                        {captchaUrl ? (
                            <div className="h-full w-full rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                                <img src={captchaUrl} alt="captcha" className="h-full w-full object-contain" />
                            </div>
                        ) : (
                            <div className="h-full w-full bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-[10px]">
                                ...
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-lg">
                            <RefreshCw size={14} className="text-gray-700" />
                        </div>
                    </div>
                </div>
                {errors.captcha && <p className="text-red-500 text-[9px]">{errors.captcha}</p>}
            </div>

            <input type="hidden" name="referral_code" value={data.referral_code} />

            <button
                disabled={processing}
                className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2 font-bold text-xs shadow-sm shadow-primary-500/20 active:scale-[0.98] mt-1"
            >
                {processing && <Loader2 className="animate-spin" size={16} />}
                ثبت نام
            </button>
        </form>
    );
}
