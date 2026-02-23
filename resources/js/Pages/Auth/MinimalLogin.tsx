import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Smartphone, Mail, UserPlus, Sparkles } from 'lucide-react';
import OtpLoginForm from './Partials/OtpLoginForm';
import EmailLoginForm from './Partials/EmailLoginForm';
import RegisterForm from './Partials/RegisterForm';
import clsx from 'clsx';

interface MinimalLoginProps {
    mode: 'mobile' | 'email' | 'register';
    setMode: (mode: 'mobile' | 'email' | 'register') => void;
    captchaUrl: string | null;
    refreshCaptcha: () => void;
    settings: any;
}

export default function MinimalLogin({ mode, setMode, captchaUrl, refreshCaptcha, settings }: MinimalLoginProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Colors
    const primaryColor = settings.login_btn_bg || '#000000';
    const textColor = settings.login_title_color || '#111827';

    // Background Styles
    const getBgStyle = () => {
        const type = settings.login_left_bg_type || 'color';
        if (type === 'image') return { backgroundImage: `url(${settings.login_left_image})`, backgroundSize: 'cover' };
        if (type === 'color') return { backgroundColor: settings.login_left_color };
        if (type === 'gradient') return { background: settings.login_left_gradient };

        // Default Pale Bubbles Background
        return {
            backgroundColor: '#f8fafc',
            backgroundImage: `
                radial-gradient(at 10% 10%, rgba(255, 228, 230, 0.5) 0px, transparent 50%),
                radial-gradient(at 90% 10%, rgba(224, 231, 255, 0.5) 0px, transparent 50%),
                radial-gradient(at 50% 50%, rgba(240, 253, 244, 0.5) 0px, transparent 50%),
                radial-gradient(at 10% 90%, rgba(254, 243, 199, 0.5) 0px, transparent 50%),
                radial-gradient(at 90% 90%, rgba(253, 230, 138, 0.3) 0px, transparent 50%)
            `,
            backgroundAttachment: 'fixed'
        };
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center font-sans p-4" style={getBgStyle()} dir="rtl">
            <Head title={mode === 'register' ? 'ثبت نام' : 'ورود به حساب کاربری'} />

            <div className={clsx(
                "w-full max-w-[400px] bg-white/70 backdrop-blur-2xl rounded-[24px] p-6 shadow-xl border border-white/60 transition-all duration-700 transform",
                mounted ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95"
            )}>
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm mb-3">
                        {settings.login_logo ? (
                            <img src={settings.login_logo} alt="Logo" className="w-7 h-7 object-contain" />
                        ) : (
                            <Sparkles className="w-5 h-5" style={{ color: primaryColor }} />
                        )}
                    </div>
                    <h1 className="text-xl font-bold tracking-tight mb-1" style={{ color: textColor }}>
                        {mode === 'register' ? 'عضویت جدید' : (settings.login_title || 'خوش آمدید')}
                    </h1>
                    <p className="text-xs text-gray-500">
                        {mode === 'register' ? 'اطلاعات خود را وارد کنید' : (settings.login_subtitle || 'لطفا وارد حساب کاربری خود شوید')}
                    </p>
                </div>

                {/* Minimal Tabs */}
                <div className="flex justify-center gap-3 mb-6">
                    {[
                        { id: 'mobile', icon: Smartphone, label: 'پیامک' },
                        { id: 'email', icon: Mail, label: 'ایمیل' },
                        { id: 'register', icon: UserPlus, label: 'ثبت نام' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setMode(tab.id as any)}
                            className={clsx(
                                "flex flex-col items-center gap-1.5 group transition-all duration-300",
                                mode === tab.id ? "opacity-100 scale-105" : "opacity-50 hover:opacity-80"
                            )}
                        >
                            <div className={clsx(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm",
                                mode === tab.id ? "bg-white text-black shadow-md ring-1 ring-black/5" : "bg-gray-50 text-gray-500"
                            )}>
                                <tab.icon size={18} style={{ color: mode === tab.id ? primaryColor : undefined }} />
                            </div>
                            <span className="text-[9px] font-medium text-gray-600">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Forms */}
                <div className="relative min-h-[280px]">
                    {mode === 'mobile' ? (
                        <OtpLoginForm
                            captchaUrl={captchaUrl}
                            refreshCaptcha={refreshCaptcha}
                            onSwitchMethod={() => setMode('email')}
                        />
                    ) : mode === 'email' ? (
                        <EmailLoginForm
                            captchaUrl={captchaUrl}
                            refreshCaptcha={refreshCaptcha}
                            onSwitchMethod={() => setMode('mobile')}
                        />
                    ) : (
                        <RegisterForm
                            captchaUrl={captchaUrl}
                            refreshCaptcha={refreshCaptcha}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                    <p className="text-[10px] text-gray-400 font-medium tracking-wide">
                        {settings.login_copyright || 'DESIGNED BY CLUBINEX'}
                    </p>
                </div>
            </div>
        </div>
    );
}
