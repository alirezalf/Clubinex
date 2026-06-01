import React, { useEffect, useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import { Smartphone, Mail, UserPlus, Sparkles, Home } from 'lucide-react';
import OtpLoginForm from './Partials/OtpLoginForm';
import EmailLoginForm from './Partials/EmailLoginForm';
import RegisterForm from './Partials/RegisterForm';
import clsx from 'clsx';

interface ModernLoginProps {
    mode: 'mobile' | 'email' | 'register';
    setMode: (mode: 'mobile' | 'email' | 'register') => void;
    captchaUrl: string | null;
    refreshCaptcha: () => void;
    settings: any;
}

export default function ModernLogin({ mode, setMode, captchaUrl, refreshCaptcha, settings }: ModernLoginProps) {
    const { pageSlider } = usePage<any>().props;

    const isReversed = settings.login_layout_reversed === '1' || settings.login_layout_reversed === true;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Background Styles
    const getBgStyle = (side: 'left' | 'right') => {
        const type = settings[`login_${side}_bg_type`] || (side === 'left' ? 'random' : 'color');

        if (type === 'image') {
            return { backgroundImage: `url(${settings[`login_${side}_image`]})`, backgroundSize: 'cover', backgroundPosition: 'center' };
        }
        if (type === 'color') {
            return { backgroundColor: settings[`login_${side}_color`] };
        }
        if (type === 'gradient') {
            return { background: settings[`login_${side}_gradient`] };
        }
        return {};
    };

    const leftBgStyle = getBgStyle('left');

    const isGlass = settings.login_card_glass === '1' || settings.login_card_glass === true;
    const isCaptchaEnabled = settings.captcha_enabled === '1' || settings.captcha_enabled === true;

    // Slider Logic
    const hasSlider = settings.login_left_bg_type === 'slider' && pageSlider;
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (hasSlider && pageSlider.active_slides.length > 1) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % pageSlider.active_slides.length);
            }, pageSlider.interval || 5000);
            return () => clearInterval(interval);
        }
    }, [hasSlider, pageSlider]);

    // Use settings or fallback to elegant defaults
    const tabActiveBg = settings.login_tab_active_bg || '#ffffff';
    const tabActiveText = settings.login_tab_active_text || '#111827';
    const tabInactiveText = settings.login_tab_inactive_text || '#6b7280';
    const tabContainerBg = settings.login_tab_container_bg || '#f3f4f6';

    return (
        <div className={clsx("min-h-screen w-full flex overflow-hidden font-sans bg-gray-50 text-gray-900 selection:bg-primary-500 selection:text-white", isReversed ? "flex-row-reverse" : "flex-row")} dir="rtl">
            <Head title={mode === 'register' ? 'ثبت نام' : 'ورود به حساب کاربری'} />

            {/* Form Side */}
            <div
                className={clsx(
                    "w-full md:w-[480px] lg:w-[550px] flex flex-col justify-center items-center p-8 relative z-10 transition-all duration-500 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.05)]",
                    isGlass ? "bg-white/80 backdrop-blur-3xl border-l border-white" : "bg-white border-l border-gray-100"
                )}
            >
                {/* Home Button */}
                <Link
                    href="/"
                    className="absolute top-6 right-6 p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl shadow-sm text-gray-600 transition-all focus:outline-none z-50 border border-gray-200"
                    title="بازگشت به صفحه اصلی"
                >
                    <Home size={18} />
                </Link>

                <div className={clsx("w-full max-w-[380px] transition-all duration-700 transform", mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0")}>
                    {/* Header */}
                    <div className="mb-10 text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-xl shadow-primary-500/20 mb-2 transform hover:scale-105 transition-transform duration-300">
                            {settings.login_logo ? (
                                <img src={settings.login_logo} alt="Logo" className="w-10 h-10 object-contain drop-shadow-md" />
                            ) : (
                                <Sparkles className="text-white w-8 h-8" />
                            )}
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight" style={{ color: settings.login_title_color }}>
                            {mode === 'register' ? 'ایجاد حساب کاربری' : (settings.login_title || 'خوش آمدید')}
                        </h1>
                        <p className="text-gray-500 text-sm font-medium" style={{ color: settings.login_subtitle_color }}>
                            {mode === 'register' ? 'لطفاً اطلاعات خود را برای ثبت‌نام وارد کنید' : (settings.login_subtitle || 'جهت ورود به پنل، مشخصات خود را تایپ کنید')}
                        </p>
                    </div>

                    {/* Modern Tabs */}
                    <div
                        className="flex p-1.5 rounded-[14px] mb-8 relative border border-gray-100/50"
                        style={{ backgroundColor: tabContainerBg }}
                    >
                        <div
                            className={clsx(
                                "absolute top-1.5 bottom-1.5 rounded-[10px] shadow-sm transition-all duration-500 ease-spring border border-gray-200/50",
                                mode === 'mobile' ? 'w-[calc(33.33%-6px)] right-1.5' :
                                mode === 'email' ? 'w-[calc(33.33%-6px)] right-[calc(33.33%+1.5px)]' : 'w-[calc(33.33%-6px)] right-[calc(66.66%-1.5px)]'
                            )}
                            style={{ backgroundColor: tabActiveBg }}
                        ></div>
                        {[
                            { id: 'mobile', icon: Smartphone, label: 'پیامک' },
                            { id: 'email', icon: Mail, label: 'ایمیل' },
                            { id: 'register', icon: UserPlus, label: 'ثبت نام' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setMode(tab.id as any)}
                                className={clsx(
                                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-[10px] text-[12px] font-bold transition-all relative z-10",
                                    mode === tab.id ? "scale-100" : "hover:text-primary-600 scale-95 hover:bg-black/5"
                                )}
                                style={{ color: mode === tab.id ? tabActiveText : tabInactiveText }}
                            >
                                <tab.icon size={15} className={clsx("transition-colors", mode === tab.id ? "text-primary-500" : "opacity-70")} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Forms */}
                    <div className="relative group">
                        <div className="relative z-10 bg-transparent">
                            {mode === 'mobile' ? (
                                <OtpLoginForm
                                    captchaUrl={isCaptchaEnabled ? captchaUrl : null}
                                    refreshCaptcha={refreshCaptcha}
                                    onSwitchMethod={() => setMode('email')}
                                />
                            ) : mode === 'email' ? (
                                <EmailLoginForm
                                    captchaUrl={isCaptchaEnabled ? captchaUrl : null}
                                    refreshCaptcha={refreshCaptcha}
                                    onSwitchMethod={() => setMode('mobile')}
                                />
                            ) : (
                                <RegisterForm
                                    captchaUrl={isCaptchaEnabled ? captchaUrl : null}
                                    refreshCaptcha={refreshCaptcha}
                                />
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-6 border-t border-gray-100 text-center">
                        <p className="text-[11px] font-medium text-gray-400" style={{ color: settings.login_copyright_color }}>
                            {settings.login_copyright || '© 2024 تمامی حقوق سامانه محفوظ است.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Visual Side */}
            <div className="hidden md:flex flex-1 relative overflow-hidden items-center justify-center bg-gray-900 group/visual">
                <div className="absolute inset-0 z-0 bg-primary-900/20" style={leftBgStyle}>
                    {hasSlider ? (
                        <div className="relative w-full h-full">
                            {pageSlider.active_slides.map((slide: any, index: number) => (
                                <div
                                    key={slide.id}
                                    className={clsx(
                                        "absolute inset-0 w-full h-full transition-opacity duration-1000",
                                        index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
                                    )}
                                >
                                    {slide.image_path ? (
                                        <img
                                            src={slide.image_path}
                                            className={clsx("w-full h-full object-cover transition-transform duration-[20s]", index === currentSlide ? "scale-105" : "scale-100")}
                                            alt={slide.title || 'Slide'}
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full"
                                            style={{
                                                background: slide.bg_color || 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
                                            }}
                                        ></div>
                                    )}
                                    {(slide.title || slide.description) && (
                                        <div className="absolute bottom-20 left-0 right-0 text-center z-20 px-16">
                                            {slide.title && (
                                                <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 drop-shadow-xl animate-in slide-in-from-bottom-8 fade-in duration-1000 tracking-tight">
                                                    {slide.title}
                                                </h2>
                                            )}
                                            {slide.description && (
                                                <p className="text-lg lg:text-xl text-white/80 max-w-xl mx-auto drop-shadow-md animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200 font-light leading-relaxed">
                                                    {slide.description}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (!settings.login_left_bg_type || settings.login_left_bg_type === 'random') && (
                        <img
                            src="https://picsum.photos/1920/1080?blur=1"
                            className="w-full h-full object-cover scale-105 group-hover/visual:scale-100 transition-transform duration-[30s]"
                            alt="Background"
                        />
                    )}
                </div>

                {/* Overlay Gradient for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-gray-900/10 z-10 pointer-events-none"></div>

                {/* Static Content (Fallback) */}
                {!hasSlider && (
                    <div className="relative z-20 max-w-2xl px-12 text-center mt-32">
                        <div className={clsx("transition-all duration-1000 delay-300 transform", mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0")}>
                            <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 drop-shadow-2xl tracking-tighter" style={{ color: settings.login_slogan_color }}>
                                {settings.login_slogan_title || 'تجربه ای متفاوت'}
                            </h2>
                            <p className="text-xl text-white/80 leading-relaxed font-light max-w-md mx-auto" style={{ color: settings.login_slogan_color }}>
                                {settings.login_slogan_text || 'طراحی شده برای ایجاد ارتباطی عمیق و وفادارانه با مشتریان ارزشمند شما.'}
                            </p>

                            <div className="mt-12 flex justify-center gap-3 opacity-80">
                                <span className="w-12 h-1 bg-white/50 rounded-full animate-pulse"></span>
                                <span className="w-3 h-1 bg-white/30 rounded-full"></span>
                                <span className="w-3 h-1 bg-white/30 rounded-full"></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
