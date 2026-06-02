import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Smartphone, Mail, UserPlus, Sparkles, Home, ChevronLeft, Shield, Gift, Award } from 'lucide-react';
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
    const [hoveredTab, setHoveredTab] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const primaryColor = settings.login_btn_bg || '#6366f1';
    const textColor = settings.login_title_color || '#1e293b';

    const getBgStyle = () => {
        const type = settings.login_left_bg_type || 'gradient';
        if (type === 'image') return { backgroundImage: `url(${settings.login_left_image})`, backgroundSize: 'cover', backgroundPosition: 'center' };
        if (type === 'color') return { backgroundColor: settings.login_left_color };
        if (type === 'gradient') return { background: settings.login_left_gradient || 'radial-gradient(ellipse at 0% 0%, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.1) 50%, rgba(236,72,153,0.05) 100%)' };

        return {
            backgroundColor: '#f8fafc',
            backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(99,102,241,0.08) 0%, transparent 40%),
                radial-gradient(circle at 80% 70%, rgba(168,85,247,0.06) 0%, transparent 45%),
                radial-gradient(circle at 40% 90%, rgba(236,72,153,0.05) 0%, transparent 50%),
                repeating-linear-gradient(45deg, rgba(0,0,0,0.01) 0px, rgba(0,0,0,0.01) 2px, transparent 2px, transparent 8px)
            `,
            backgroundAttachment: 'fixed'
        };
    };

    const tabs = [
        { id: 'mobile' as const, icon: Smartphone, label: 'پیامک', description: 'ورود با کد یکبارمصرف' },
        { id: 'email' as const, icon: Mail, label: 'ایمیل', description: 'ورود با ایمیل و رمز عبور' },
        { id: 'register' as const, icon: UserPlus, label: 'ثبت نام', description: 'ایجاد حساب کاربری جدید' }
    ];

    return (
        <div className="min-h-screen w-full flex items-center justify-center font-sans p-4 relative overflow-hidden" style={getBgStyle()} dir="rtl">
            <Head title={mode === 'register' ? 'ثبت نام' : 'ورود به حساب کاربری'} />

            {/* Animated Background Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-[10%] w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-purple-200/15 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-200/10 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            {/* Home Button */}
            <Link
                href="/"
                className="absolute top-6 right-6 p-3 bg-white/80 hover:bg-white backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl text-gray-600 hover:text-indigo-600 transition-all duration-300 z-50 border border-white/60 group"
                title="بازگشت به صفحه اصلی"
            >
                <Home size={18} className="group-hover:scale-110 transition-transform" />
            </Link>

            {/* Main Card */}
            <div className={clsx(
                "w-full max-w-[440px] bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 transition-all duration-700 transform relative z-10 flex flex-col max-h-[96vh] overflow-y-auto",
                mounted ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95"
            )}>
                {/* Decorative Top Bar */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full mt-3" />

                {/* Header */}
                <div className="text-center pt-6 pb-2 px-6">
                    <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-shimmer" />
                        {settings.login_logo ? (
                            <img src={settings.login_logo} alt="Logo" className="w-7 h-7 object-contain relative z-10 drop-shadow-lg" />
                        ) : (
                            <Sparkles className="w-6 h-6 text-white relative z-10 drop-shadow-lg" />
                        )}
                    </div>

                    <h1 className="text-xl lg:text-2xl font-bold tracking-tight mb-1 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent" style={{ color: textColor }}>
                        {mode === 'register' ? 'به خانواده ما بپیوندید' : (settings.login_title || 'خوش آمدید')}
                    </h1>

                    <p className="text-sm text-gray-500 font-medium">
                        {mode === 'register' ? 'چند ثانیه تا عضویت شما فاصله است' : (settings.login_subtitle || 'لطفاً روش ورود خود را انتخاب کنید')}
                    </p>
                </div>

                {/* Modern Tabs - Pill Design */}
                <div className="px-6 mb-4">
                    <div className="bg-gray-100/80 backdrop-blur-sm rounded-2xl p-1.5">
                        <div className="grid grid-cols-3 gap-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setMode(tab.id)}
                                    onMouseEnter={() => setHoveredTab(tab.id)}
                                    onMouseLeave={() => setHoveredTab(null)}
                                    className={clsx(
                                        "relative group transition-all duration-300 rounded-xl py-2.5",
                                        mode === tab.id
                                            ? "bg-white shadow-lg shadow-indigo-500/10"
                                            : "hover:bg-white/50"
                                    )}
                                >
                                    <div className="flex flex-col items-center gap-1">
                                        <tab.icon
                                            size={16}
                                            className={clsx(
                                                "transition-all duration-300",
                                                mode === tab.id
                                                    ? "text-indigo-600 scale-110"
                                                    : "text-gray-500 group-hover:text-indigo-500 group-hover:scale-105"
                                            )}
                                        />
                                        <span className={clsx(
                                            "text-[11px] font-semibold transition-colors",
                                            mode === tab.id ? "text-gray-800" : "text-gray-500 group-hover:text-gray-700"
                                        )}>
                                            {tab.label}
                                        </span>
                                    </div>

                                    {/* Tooltip on hover */}
                                    {hoveredTab === tab.id && mode !== tab.id && (
                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-[10px] px-2 py-1 rounded-lg shadow-lg z-20 animate-in fade-in zoom-in-95 duration-200">
                                            {tab.description}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Forms Container */}
                <div className="px-6 pb-0">
                    <div className="relative min-h-[250px] transition-all duration-300">
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
                </div>

                {/* Features Row */}
                <div className="px-6 pb-4 pt-2 hidden sm:block">
                    <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
                        {[
                            { icon: Shield, label: 'امنیت بالا' },
                            { icon: Gift, label: 'جوایز ویژه' },
                            { icon: Award, label: 'عضویت رایگان' }
                        ].map((feature, idx) => (
                            <div key={idx} className="text-center group cursor-default">
                                <div className="w-7 h-7 mx-auto bg-gray-50 rounded-xl flex items-center justify-center mb-1.5 group-hover:bg-indigo-50 transition-colors">
                                    <feature.icon size={13} className="text-gray-500 group-hover:text-indigo-600 transition-colors" />
                                </div>
                                <span className="text-[9px] font-medium text-gray-500 group-hover:text-gray-700">{feature.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-5 pt-3 sm:pt-0 text-center">
                    <p className="text-[9px] text-gray-400 font-medium tracking-wider uppercase">
                        {settings.login_copyright || 'DESIGNED WITH ❤️ BY CLUBINEX'}
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%) rotate(45deg); }
                    100% { transform: translateX(100%) rotate(45deg); }
                }
                .animate-shimmer {
                    animation: shimmer 3s infinite;
                }
            `}</style>
        </div>
    );
}
