import React, { useEffect, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Smartphone, Mail, UserPlus, ArrowRight, Sparkles } from 'lucide-react';
import OtpLoginForm from './Partials/OtpLoginForm';
import EmailLoginForm from './Partials/EmailLoginForm';
import RegisterForm from './Partials/RegisterForm';
import clsx from 'clsx';
import { useThemeSystem } from '@/Hooks/useThemeSystem';

interface ModernLoginProps {
    mode: 'mobile' | 'email' | 'register';
    setMode: (mode: 'mobile' | 'email' | 'register') => void;
    captchaUrl: string | null;
    refreshCaptcha: () => void;
    settings: any;
}

export default function ModernLogin({ mode, setMode, captchaUrl, refreshCaptcha, settings }: ModernLoginProps) {
    const { pageSlider, themeSettings } = usePage<any>().props;

    // Apply Theme
    useThemeSystem(themeSettings);

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
    const rightBgStyle = getBgStyle('right');

    // Colors
    const tabActiveText = settings.login_tab_active_text || '#ffffff';
    const tabActiveBg = settings.login_tab_active_bg || '#0284c7';
    const tabInactiveText = settings.login_tab_inactive_text || '#9ca3af';
    const tabContainerBg = settings.login_tab_container_bg || 'rgba(31, 41, 55, 0.5)';
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

    return (
        <div className={clsx("min-h-screen w-full flex overflow-hidden font-sans bg-gray-900 text-white selection:bg-primary-500 selection:text-white", isReversed ? "flex-row-reverse" : "flex-row")} dir="rtl">
            <Head title={mode === 'register' ? 'ثبت نام' : 'ورود به حساب کاربری'} />

            {/* Animated Background Elements (Global) */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/20 blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[100px] animate-pulse delay-1000"></div>
            </div>

            {/* Form Side */}
            <div
                className={clsx(
                    "w-full md:w-[480px] lg:w-[550px] flex flex-col justify-center items-center p-8 relative z-10 shadow-2xl transition-all duration-500",
                    isGlass ? "bg-white/10 backdrop-blur-xl border-l border-white/10" : "bg-white/5 border-l border-white/5"
                )}
                style={!isGlass ? { ...rightBgStyle } : {}}
            >
                <div className={clsx("w-full max-w-sm transition-all duration-700 transform", mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0")}>

                    {/* Header */}
                    <div className="mb-10 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 shadow-lg shadow-primary-500/30 mb-6 transform hover:scale-110 transition-transform duration-300">
                            {settings.login_logo ? (
                                <img src={settings.login_logo} alt="Logo" className="w-10 h-10 object-contain" />
                            ) : (
                                <Sparkles className="text-white w-8 h-8" />
                            )}
                        </div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                            {mode === 'register' ? 'شروع ماجراجویی' : (settings.login_title || 'خوش آمدید')}
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {mode === 'register' ? 'اطلاعات خود را وارد کنید تا عضو شوید' : (settings.login_subtitle || 'به حساب کاربری خود وارد شوید')}
                        </p>
                    </div>

                    {/* Modern Tabs */}
                    <div
                        className="flex p-1 rounded-xl mb-8 border border-white/5 relative overflow-hidden"
                        style={{ backgroundColor: tabContainerBg }}
                    >
                        <div
                            className={clsx(
                                "absolute top-1 bottom-1 rounded-lg shadow-lg transition-all duration-500 ease-out",
                                mode === 'mobile' ? 'w-[32%] right-1' :
                                mode === 'email' ? 'w-[32%] right-[34%]' : 'w-[32%] right-[67%]'
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
                                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors relative z-10"
                                )}
                                style={{ color: mode === tab.id ? tabActiveText : tabInactiveText }}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Forms */}
                    <div className={clsx(
                        "rounded-2xl p-6 shadow-inner relative overflow-hidden group transition-all",
                        isGlass ? "bg-white/10 border border-white/10" : "bg-white/5 border border-white/5"
                    )}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10">
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
                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-500">
                            {settings.login_copyright || '© 2024 تمامی حقوق محفوظ است.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Visual Side */}
            <div className="hidden md:flex flex-1 relative overflow-hidden items-center justify-center bg-black">
                {/* Background Image/Color/Slider */}
                <div className="absolute inset-0 z-0" style={leftBgStyle}>
                    {hasSlider ? (
                        <div className="relative w-full h-full">
                            {pageSlider.active_slides.map((slide: any, index: number) => (
                                <div
                                    key={slide.id}
                                    className={clsx(
                                        "absolute inset-0 w-full h-full transition-opacity duration-1000",
                                        index === currentSlide ? "opacity-100" : "opacity-0"
                                    )}
                                >
                                    {slide.image_path ? (
                                        <img
                                            src={slide.image_path}
                                            className="w-full h-full object-cover"
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
                                    {/* Slide Content Overlay */}
                                    {(slide.title || slide.description) && (
                                        <div className="absolute bottom-20 left-0 right-0 text-center z-20 px-12">
                                            {slide.title && (
                                                <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-700">
                                                    {slide.title}
                                                </h2>
                                            )}
                                            {slide.description && (
                                                <p className="text-lg text-white/90 max-w-lg mx-auto drop-shadow-md animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200">
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
                            src="https://picsum.photos/1920/1080?blur=2"
                            className="w-full h-full object-cover opacity-60 scale-110 animate-pulse-slow"
                            alt="Background"
                        />
                    )}
                </div>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 z-10"></div>

                {/* Static Content (Only if no slider content is shown or as fallback) */}
                {!hasSlider && (
                    <div className="relative z-20 max-w-2xl px-12 text-center">
                        <div className={clsx("transition-all duration-1000 delay-300 transform", mounted ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0")}>
                            <h2 className="text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 mb-8 drop-shadow-2xl tracking-tight">
                                {settings.login_slogan_title || 'آینده وفاداری'}
                            </h2>
                            <p className="text-xl text-gray-300 leading-relaxed font-light max-w-lg mx-auto">
                                {settings.login_slogan_text || 'با پیوستن به باشگاه مشتریان ما، دنیایی از امکانات و جوایز را تجربه کنید.'}
                            </p>

                            <div className="mt-12 flex justify-center gap-4">
                                <div className="w-16 h-1 bg-primary-500 rounded-full animate-pulse"></div>
                                <div className="w-4 h-1 bg-gray-600 rounded-full"></div>
                                <div className="w-4 h-1 bg-gray-600 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
