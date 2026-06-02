import React, { useEffect, useState, useCallback } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import { Smartphone, Mail, UserPlus, Sparkles, Home, ChevronLeft, ChevronRight, Shield, Star, Gift, CheckCircle } from 'lucide-react';
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
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Slider configuration
    const hasSlider = settings.login_left_bg_type === 'slider' && pageSlider?.active_slides?.length > 0;
    const slides = hasSlider ? pageSlider.active_slides : [];
    const slideInterval = pageSlider?.interval || 5000;

    // Auto-slide effect
    useEffect(() => {
        if (!hasSlider || slides.length <= 1) return;
        const interval = setInterval(() => {
            goToNextSlide();
        }, slideInterval);
        return () => clearInterval(interval);
    }, [hasSlider, slides.length, currentSlide, slideInterval]);

    const goToNextSlide = useCallback(() => {
        if (isTransitioning || slides.length <= 1) return;
        setIsTransitioning(true);
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setTimeout(() => setIsTransitioning(false), 600);
    }, [slides.length, isTransitioning]);

    const goToPrevSlide = useCallback(() => {
        if (isTransitioning || slides.length <= 1) return;
        setIsTransitioning(true);
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        setTimeout(() => setIsTransitioning(false), 600);
    }, [slides.length, isTransitioning]);

    const goToSlide = useCallback((index: number) => {
        if (isTransitioning || index === currentSlide) return;
        setIsTransitioning(true);
        setCurrentSlide(index);
        setTimeout(() => setIsTransitioning(false), 600);
    }, [currentSlide, isTransitioning]);

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
    const rightBgStyle = getBgStyle('right');
    const isGlass = settings.login_card_glass === '1' || settings.login_card_glass === true;
    const isCaptchaEnabled = settings.captcha_enabled === '1' || settings.captcha_enabled === true;

    const tabActiveBg = settings.login_tab_active_bg || '#ffffff';
    const tabActiveText = settings.login_tab_active_text || '#4f46e5';
    const tabInactiveText = settings.login_tab_inactive_text || '#6b7280';
    const tabContainerBg = settings.login_tab_container_bg || '#f1f5f9';

    const tabs = [
        { id: 'mobile' as const, icon: Smartphone, label: 'پیامک', desc: 'ورود سریع با کد' },
        { id: 'email' as const, icon: Mail, label: 'ایمیل', desc: 'ورود با ایمیل و رمز' },
        { id: 'register' as const, icon: UserPlus, label: 'ثبت‌نام', desc: 'ایجاد حساب' }
    ];

    const features = [
        { icon: Shield, title: 'امنیت پیشرفته', desc: 'حفاظت کامل از اطلاعات شما' },
        { icon: Gift, title: 'جوایز ارزشمند', desc: 'تخفیف‌ها و هدایای اختصاصی' },
        { icon: Star, title: 'خدمات ویژه', desc: 'تجربه‌ای منحصربه‌فرد از وفاداری' }
    ];
    const [activeFeature, setActiveFeature] = useState(0);

    useEffect(() => {
        if (!hasSlider) {
            const interval = setInterval(() => {
                setActiveFeature(prev => (prev + 1) % features.length);
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [hasSlider, features.length]);

    return (
        <div className={clsx("min-h-screen w-full flex overflow-hidden font-sans selection:bg-indigo-500 selection:text-white", isReversed ? "flex-row" : "flex-row-reverse")} dir="rtl">
            <Head title={mode === 'register' ? 'ثبت نام' : 'ورود به حساب کاربری'} />

            {/* ========== LEFT SIDE - VISUAL / SLIDER ========== */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900 group">
                {/* Elegant Mesh Background */}
                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-[#0B0F19]">
                    <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/20 blur-[120px] rounded-full animate-blob"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-violet-600/20 blur-[120px] rounded-full animate-blob animation-delay-2000"></div>
                    <div className="absolute top-[20%] right-[20%] w-[50%] h-[50%] bg-fuchsia-600/20 blur-[100px] rounded-full animate-blob animation-delay-4000"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                </div>

                <div className="absolute inset-0 w-full h-full z-10" style={leftBgStyle}>
                    {hasSlider ? (
                        <div className="relative w-full h-full">
                            {slides.map((slide: any, index: number) => (
                                <div
                                    key={slide.id || index}
                                    className={clsx(
                                        "absolute inset-0 w-full h-full transition-all duration-1000 ease-out",
                                        index === currentSlide ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0 pointer-events-none"
                                    )}
                                >
                                    {slide.image_path ? (
                                        <>
                                            <img
                                                src={slide.image_path}
                                                className="w-full h-full object-cover"
                                                alt={slide.title || 'Slide'}
                                            />
                                            {/* Gradient Overlay for Text Readability */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent"></div>
                                        </>
                                    ) : (
                                        <div
                                            className="w-full h-full"
                                            style={{
                                                background: slide.bg_color || 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)'
                                            }}
                                        />
                                    )}

                                    {(slide.title || slide.description) && index === currentSlide && (
                                        <div className="absolute inset-0 flex flex-col justify-end text-center px-12 pb-28 z-20">
                                            <div className="animate-in slide-in-from-bottom-8 fade-in duration-1000 ease-out fill-mode-both">
                                                {slide.title && (
                                                    <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-white mb-4 drop-shadow-xl tracking-tight leading-tight">
                                                        {slide.title}
                                                    </h2>
                                                )}
                                                {slide.description && (
                                                    <p className="text-white/80 text-base md:text-lg font-light leading-relaxed max-w-lg mx-auto">
                                                        {slide.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {slides.length > 1 && (
                                <>
                                    <button onClick={goToPrevSlide} className="absolute left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all duration-300 hover:scale-105 opacity-0 group-hover:opacity-100">
                                        <ChevronRight size={24} />
                                    </button>
                                    <button onClick={goToNextSlide} className="absolute right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all duration-300 hover:scale-105 opacity-0 group-hover:opacity-100">
                                        <ChevronLeft size={24} />
                                    </button>
                                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                                        {slides.map((_: any, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => goToSlide(idx)}
                                                className={clsx(
                                                    "transition-all duration-500 rounded-full",
                                                    idx === currentSlide ? "w-8 h-2 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" : "w-2 h-2 bg-white/30 hover:bg-white/60"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="relative w-full h-full border-x border-white/5">
                            {(!settings.login_left_bg_type || settings.login_left_bg_type === 'random') && (
                                <div className="absolute inset-0">
                                    <img
                                        src="/images/backgrounds/photo-1556740758-90de374c12ad.jpg"
                                        className="w-full h-full object-cover mix-blend-overlay opacity-30"
                                        alt="Background"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent"></div>
                                </div>
                            )}

                            {/* Animated Features Layout */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12 z-10">
                                <div className={clsx("transition-all duration-1000 transform w-full max-w-lg", mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0")}>
                                    <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-full px-5 py-2 mb-12 border border-white/10 shadow-2xl">
                                        <Sparkles size={16} className="text-indigo-400 animate-pulse" />
                                        <span className="text-white/90 text-sm font-medium tracking-wide">نسل جدید پلتفرم وفاداری</span>
                                    </div>

                                    <div className="relative h-40 mb-10 w-full perspective">
                                        {features.map((feature, idx) => (
                                            <div
                                                key={idx}
                                                className={clsx(
                                                    "absolute inset-0 transition-all duration-700 ease-out flex flex-col items-center justify-center",
                                                    activeFeature === idx ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95 pointer-events-none"
                                                )}
                                            >
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-5 ring-1 ring-white/10 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                                                    <feature.icon size={28} className="text-indigo-300" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                                                <p className="text-slate-300 text-sm leading-relaxed max-w-xs">{feature.desc}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <h2 className="text-4xl lg:text-5xl font-black text-white mb-5 drop-shadow-2xl tracking-tighter" style={{ color: settings.login_slogan_color }}>
                                        {settings.login_slogan_title || 'تجربه‌ای ماندگار'}
                                    </h2>
                                    <p className="text-slate-300 text-base md:text-lg font-light leading-relaxed" style={{ color: settings.login_slogan_color }}>
                                        {settings.login_slogan_text || 'طراحی شده برای ایجاد ارتباطی عمیق و ارزشمند با مشتریان شما. هوشمندانه، زیبا و کارآمد.'}
                                    </p>

                                    <div className="mt-12 flex justify-center gap-2">
                                        {features.map((_, idx) => (
                                            <div key={idx} className={clsx("h-1 rounded-full transition-all duration-500", idx === activeFeature ? "w-8 bg-indigo-500" : "w-2 bg-white/20")} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ========== RIGHT SIDE - FORM ========== */}
            <div
                className={clsx(
                    "w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-8 relative z-10 transition-all duration-700 bg-white dark:bg-[#0B0F19]",
                    mounted ? "opacity-100" : "opacity-0"
                )}
                style={rightBgStyle}
            >
                {/* Form Side Ambient Background for Light Mode */}
                <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-50/50 blur-[120px] rounded-full pointer-events-none z-0"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-violet-50/50 blur-[120px] rounded-full pointer-events-none z-0"></div>

                {/* Elegant Striped Pattern from Minimal */}
                <div className="absolute inset-0 pointer-events-none z-0" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 2px, transparent 2px, transparent 8px)`
                }}></div>

                <Link
                    href="/"
                    className="absolute top-6 left-6 p-3 bg-white/80 hover:bg-white backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md text-slate-500 hover:text-indigo-600 transition-all duration-300 z-50 border border-slate-200/50 group"
                    title="بازگشت به صفحه اصلی"
                >
                    <Home size={20} className="group-hover:scale-110 transition-transform" />
                </Link>

                <div className={clsx(
                    "w-full max-w-[420px] rounded-[28px] p-8 md:p-9 transition-all duration-500 relative z-10",
                    isGlass
                        ? "bg-white/80 backdrop-blur-xl border border-white max-h-[95vh] overflow-y-auto shadow-[0_8px_40px_rgb(0,0,0,0.04)]"
                        : "bg-white border border-slate-100 max-h-[95vh] overflow-y-auto shadow-2xl shadow-slate-200/40"
                )}>
                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center mb-5 group perspective">
                            <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-indigo-600 to-violet-600 shadow-xl shadow-indigo-500/20 flex items-center justify-center transform transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 ring-4 ring-indigo-50">
                                {settings.login_logo ? (
                                    <img src={settings.login_logo} alt="Logo" className="w-8 h-8 object-contain drop-shadow-md" />
                                ) : (
                                    <Sparkles className="text-white w-7 h-7 drop-shadow-md" />
                                )}
                            </div>
                        </div>

                        <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 mb-1" style={{ color: settings.login_title_color }}>
                            {mode === 'register' ? 'ثبت‌نام در سامانه' : (settings.login_title || 'خوش آمدید')}
                        </h1>
                        <p className="text-[14px] text-slate-500 font-medium" style={{ color: settings.login_subtitle_color }}>
                            {mode === 'register' ? 'لطفاً مشخصات خود را وارد کنید' : (settings.login_subtitle || 'به سامانه مدیریت وفاداری مشتریان خوش آمدید')}
                        </p>
                    </div>

                    {/* Premium Tabs */}
                    <div className="mb-6 relative">
                        <div className="p-1.5 rounded-[20px] flex relative bg-slate-100/80 border border-slate-200/50" style={{ backgroundColor: tabContainerBg }}>
                            <div
                                className={clsx(
                                    "absolute top-1.5 bottom-1.5 rounded-[16px] bg-white shadow-sm transition-all duration-500 ease-spring border border-slate-200/50",
                                    mode === 'mobile' && "w-[calc(33.33%-4px)] right-1.5",
                                    mode === 'email' && "w-[calc(33.33%-4px)] right-[calc(33.33%+2px)]",
                                    mode === 'register' && "w-[calc(33.33%-4px)] right-[calc(66.66%-0px)]"
                                )}
                                style={{ backgroundColor: tabActiveBg }}
                            />

                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setMode(tab.id)}
                                    className={clsx(
                                        "flex-1 flex flex-col items-center justify-center py-2.5 rounded-[16px] transition-all duration-300 z-10",
                                        mode === tab.id ? "scale-100" : "hover:bg-black/5 scale-[0.98]"
                                    )}
                                    style={{ color: mode === tab.id ? tabActiveText : tabInactiveText }}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <tab.icon size={16} className={clsx("transition-transform", mode === tab.id && "scale-110 text-indigo-600")} />
                                        <span className="text-[13px] font-bold leading-none">{tab.label}</span>
                                    </div>
                                    <span className="text-[10px] opacity-70 font-medium hidden sm:inline">{tab.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Forms Container */}
                    <div className="min-h-[260px]">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
                            {mode === 'mobile' ? (
                                <OtpLoginForm captchaUrl={isCaptchaEnabled ? captchaUrl : null} refreshCaptcha={refreshCaptcha} onSwitchMethod={() => setMode('email')} />
                            ) : mode === 'email' ? (
                                <EmailLoginForm captchaUrl={isCaptchaEnabled ? captchaUrl : null} refreshCaptcha={refreshCaptcha} onSwitchMethod={() => setMode('mobile')} />
                            ) : (
                                <RegisterForm captchaUrl={isCaptchaEnabled ? captchaUrl : null} refreshCaptcha={refreshCaptcha} />
                            )}
                        </div>
                    </div>

                    {/* Footer Copyright */}
                    <div className="mt-6 pt-5 border-t border-slate-100/60 text-center">
                        <p className="text-[12px] font-medium text-slate-400" style={{ color: settings.login_copyright_color }}>
                            {settings.login_copyright || '© 2024 تمامی حقوق سامانه محفوظ است'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Custom Animations for Blob/Spring */}
            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 10s infinite alternate;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .ease-spring {
                    transition-timing-function: cubic-bezier(0.25, 1.5, 0.5, 1);
                }
                .perspective {
                    perspective: 1000px;
                }
            `}</style>
        </div>
    );
}
