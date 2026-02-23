import React from 'react';
import { Head } from '@inertiajs/react';
import { Smartphone, Mail, UserPlus } from 'lucide-react';
import OtpLoginForm from './Partials/OtpLoginForm';
import EmailLoginForm from './Partials/EmailLoginForm';
import RegisterForm from './Partials/RegisterForm';
import clsx from 'clsx';

interface ClassicLoginProps {
    mode: 'mobile' | 'email' | 'register';
    setMode: (mode: 'mobile' | 'email' | 'register') => void;
    captchaUrl: string | null;
    refreshCaptcha: () => void;
    settings: any;
}

export default function ClassicLogin({ mode, setMode, captchaUrl, refreshCaptcha, settings }: ClassicLoginProps) {
    const isReversed = settings.login_layout_reversed === '1' || settings.login_layout_reversed === true;

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
        // Random (only for left default)
        return {};
    };

    const leftBgStyle = getBgStyle('left');
    const rightBgStyle = getBgStyle('right');

    return (
        <div className={clsx("h-screen w-full flex overflow-hidden font-sans", isReversed ? "flex-row-reverse" : "flex-row")} dir="rtl">
            <Head title={mode === 'register' ? 'ثبت نام' : 'ورود به حساب کاربری'} />

            {/* Form Container */}
            <div
                className="w-full md:w-1/2 lg:w-[45%] flex flex-col justify-center items-center p-4 relative z-10 transition-all duration-500"
                style={rightBgStyle}
            >
                {/* Flat Card */}
                <div
                    className="w-full max-w-[380px] rounded-2xl border border-gray-100 p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] transition-all duration-300"
                    style={{ backgroundColor: settings.login_card_bg || '#ffffff' }}
                >
                    <div className="text-center mb-6">
                        {settings.login_logo ? (
                            <img src={settings.login_logo} alt="Logo" className="h-12 mx-auto mb-3" />
                        ) : (
                            <div className="w-10 h-10 bg-primary-600 rounded-xl mx-auto flex items-center justify-center text-white text-lg font-bold mb-3 shadow-lg shadow-primary-500/20">
                                C
                            </div>
                        )}

                        <h1 className="text-lg font-bold tracking-tight" style={{ color: settings.login_title_color }}>
                            {mode === 'register' ? 'ایجاد حساب کاربری' : (settings.login_title || 'خوش آمدید')}
                        </h1>
                        <p className="mt-1 text-[11px]" style={{ color: settings.login_subtitle_color }}>
                            {mode === 'register' ? 'به جمع مشتریان وفادار ما بپیوندید' : (settings.login_subtitle || 'به باشگاه مشتریان Clubinex وارد شوید')}
                        </p>
                    </div>

                    {/* Tab Switcher */}
                    <div
                        className="flex p-1 rounded-lg mb-5 relative border border-gray-100"
                        style={{ backgroundColor: settings.login_tab_container_bg || '#f9fafb' }}
                    >
                        <div
                            className={clsx(
                                "absolute top-1 bottom-1 w-[calc(33.33%-4px)] bg-white rounded-md shadow-sm border border-gray-100 transition-all duration-300 ease-out",
                                mode === 'mobile' ? 'translate-x-0 right-1' :
                                mode === 'email' ? 'translate-x-0 right-[33.33%]' : 'translate-x-0 right-[calc(66.66%-4px)]'
                            )}
                            style={{ backgroundColor: settings.login_tab_active_bg }}
                        ></div>
                        <button
                            onClick={() => setMode('mobile')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-colors z-10",
                                mode === 'mobile' ? 'text-primary-700' : 'text-gray-500 hover:text-gray-700'
                            )}
                            style={{ color: mode === 'mobile' ? settings.login_tab_active_text : settings.login_tab_inactive_text }}
                        >
                            <Smartphone size={14} />
                            پیامک
                        </button>
                        <button
                            onClick={() => setMode('email')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-colors z-10",
                                mode === 'email' ? 'text-primary-700' : 'text-gray-500 hover:text-gray-700'
                            )}
                            style={{ color: mode === 'email' ? settings.login_tab_active_text : settings.login_tab_inactive_text }}
                        >
                            <Mail size={14} />
                            ایمیل
                        </button>
                        <button
                            onClick={() => setMode('register')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-colors z-10",
                                mode === 'register' ? 'text-primary-700' : 'text-gray-500 hover:text-gray-700'
                            )}
                            style={{ color: mode === 'register' ? settings.login_tab_active_text : settings.login_tab_inactive_text }}
                        >
                            <UserPlus size={14} />
                            ثبت نام
                        </button>
                    </div>

                    {/* Content Forms */}
                    <div className="relative">
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

                <div className="mt-4 text-center text-[10px]" style={{ color: settings.login_copyright_color }}>
                    {settings.login_copyright || '© 2024 تمامی حقوق محفوظ است.'}
                </div>
            </div>

            {/* Image/Slogan Side */}
            <div
                className="hidden md:block md:w-1/2 lg:w-[55%] relative overflow-hidden bg-gray-100"
                style={leftBgStyle}
            >
                {(!settings.login_left_bg_type || settings.login_left_bg_type === 'random') && (
                    <img
                        src="https://picsum.photos/1200/1600?blur=1"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[30s] hover:scale-105"
                        alt="Login Cover"
                        referrerPolicy="no-referrer"
                    />
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/60 via-gray-900/20 to-transparent"></div>

                <div className="absolute bottom-12 right-12 text-white drop-shadow-lg max-w-md z-20">
                    <h2 className="text-3xl font-bold mb-4" style={{ color: settings.login_slogan_color }}>
                        {settings.login_slogan_title || 'تجربه ای متفاوت از وفاداری'}
                    </h2>
                    <p className="text-lg opacity-90 leading-relaxed" style={{ color: settings.login_slogan_color }}>
                        {settings.login_slogan_text || 'با پیوستن به باشگاه مشتریان، از تخفیف‌ها و جوایز ویژه بهره‌مند شوید.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
