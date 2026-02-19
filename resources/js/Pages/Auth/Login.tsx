import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Smartphone, Mail } from 'lucide-react';
import OtpLoginForm from './Partials/OtpLoginForm';
import EmailLoginForm from './Partials/EmailLoginForm';
import clsx from 'clsx';

export default function Login() {
    const [mode, setMode] = useState<'mobile' | 'email'>('mobile');
    const [captchaUrl, setCaptchaUrl] = useState<string | null>(null);

    const refreshCaptcha = () => {
        setCaptchaUrl(`/captcha/flat?${Math.random()}`);
    };

    useEffect(() => {
        refreshCaptcha();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans" dir="rtl">
            <Head title="ورود به حساب کاربری" />
            
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary-600 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-black mb-4 shadow-lg shadow-primary-500/30">
                            C
                        </div>
                        <h1 className="text-2xl font-black text-gray-800">خوش آمدید</h1>
                        <p className="text-gray-500 mt-2 text-sm">باشگاه مشتریان هوشمند Clubinex</p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8 relative">
                        <div 
                            className={clsx(
                                "absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out",
                                mode === 'email' ? 'translate-x-0 right-[50%]' : 'translate-x-0 right-1.5'
                            )}
                        ></div>
                        <button
                            onClick={() => setMode('mobile')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors z-10",
                                mode === 'mobile' ? 'text-primary-700' : 'text-gray-500 hover:text-gray-700'
                            )}
                        >
                            <Smartphone size={18} />
                            ورود پیامکی
                        </button>
                        <button
                            onClick={() => setMode('email')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors z-10",
                                mode === 'email' ? 'text-primary-700' : 'text-gray-500 hover:text-gray-700'
                            )}
                        >
                            <Mail size={18} />
                            ورود ایمیلی
                        </button>
                    </div>

                    {/* Content Forms */}
                    <div className="relative min-h-[300px]">
                        {mode === 'mobile' ? (
                            <OtpLoginForm 
                                captchaUrl={captchaUrl} 
                                refreshCaptcha={refreshCaptcha} 
                                onSwitchMethod={() => setMode('email')}
                            />
                        ) : (
                            <EmailLoginForm 
                                captchaUrl={captchaUrl} 
                                refreshCaptcha={refreshCaptcha}
                                onSwitchMethod={() => setMode('mobile')}
                            />
                        )}
                    </div>
                </div>
                
                <div className="bg-gray-50 py-4 text-center text-xs text-gray-500 border-t border-gray-100">
                    &copy; 2024 تمامی حقوق برای Clubinex محفوظ است.
                </div>
            </div>
        </div>
    );
}