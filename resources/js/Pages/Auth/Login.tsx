import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Smartphone, Mail, UserPlus } from 'lucide-react';
import OtpLoginForm from './Partials/OtpLoginForm';
import EmailLoginForm from './Partials/EmailLoginForm';
import RegisterForm from './Partials/RegisterForm';
import clsx from 'clsx';

export default function Login() {
    const [mode, setMode] = useState<'mobile' | 'email' | 'register'>('mobile');
    const [captchaUrl, setCaptchaUrl] = useState<string | null>(null);

    const refreshCaptcha = () => {
        setCaptchaUrl(`/captcha/flat?${Math.random()}`);
    };

    useEffect(() => {
        refreshCaptcha();
    }, []);

    return (
        <div className="h-screen w-full flex overflow-hidden bg-gray-50/50 font-sans" dir="rtl">
            <Head title={mode === 'register' ? 'ثبت نام' : 'ورود به حساب کاربری'} />

            {/* Right Side - Form Container */}
            <div className="w-full md:w-1/2 lg:w-[45%] flex flex-col justify-center items-center p-4 relative z-10">

                {/* Flat Card */}
                <div className="w-full max-w-[380px] bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
                    <div className="text-center mb-6">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl mx-auto flex items-center justify-center text-white text-lg font-bold mb-3 shadow-lg shadow-primary-500/20">
                            C
                        </div>
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                            {mode === 'register' ? 'ایجاد حساب کاربری' : 'خوش آمدید'}
                        </h1>
                        <p className="text-gray-500 mt-1 text-[11px]">
                            {mode === 'register' ? 'به جمع مشتریان وفادار ما بپیوندید' : 'به باشگاه مشتریان Clubinex وارد شوید'}
                        </p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex bg-gray-50 p-1 rounded-lg mb-5 relative border border-gray-100">
                        <div
                            className={clsx(
                                "absolute top-1 bottom-1 w-[calc(33.33%-4px)] bg-white rounded-md shadow-sm border border-gray-100 transition-all duration-300 ease-out",
                                mode === 'mobile' ? 'translate-x-0 right-1' :
                                mode === 'email' ? 'translate-x-0 right-[33.33%]' : 'translate-x-0 right-[calc(66.66%-4px)]'
                            )}
                        ></div>
                        <button
                            onClick={() => setMode('mobile')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-colors z-10",
                                mode === 'mobile' ? 'text-primary-700' : 'text-gray-500 hover:text-gray-700'
                            )}
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

                <div className="mt-4 text-center text-[10px] text-gray-400">
                    &copy; 2024 تمامی حقوق محفوظ است.
                </div>
            </div>

            {/* Left Side - Image */}
            <div className="hidden md:block md:w-1/2 lg:w-[55%] relative bg-gray-100 overflow-hidden">
                <img
                    src="https://picsum.photos/1200/1600?blur=1"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[30s] hover:scale-105"
                    alt="Login Cover"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50/90 via-gray-50/20 to-transparent"></div>
                <div className="absolute bottom-12 right-12 text-white drop-shadow-lg max-w-md">
                    <h2 className="text-3xl font-bold mb-4">تجربه ای متفاوت از وفاداری</h2>
                    <p className="text-lg opacity-90 leading-relaxed">
                        با پیوستن به باشگاه مشتریان، از تخفیف‌ها و جوایز ویژه بهره‌مند شوید.
                    </p>
                </div>
            </div>
        </div>
    );
}
