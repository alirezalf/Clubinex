import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import axios from 'axios';
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react';

interface Props {
    captchaUrl: string | null;
    refreshCaptcha: () => void;
    onSwitchMethod: () => void;
}

export default function OtpLoginForm({ captchaUrl, refreshCaptcha, onSwitchMethod }: Props) {
    const [step, setStep] = useState<'input' | 'verify'>('input');
    const [loading, setLoading] = useState(false);
    const [mobile, setMobile] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [otpError, setOtpError] = useState('');
    const [captcha, setCaptcha] = useState('');

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setOtpError('');
        
        try {
            await axios.post(route('login.otp.send'), { mobile, captcha });
            setStep('verify');
        } catch (err: any) {
            setOtpError(err.response?.data?.message || err.response?.data?.errors?.captcha?.[0] || 'خطا در ارسال پیامک');
            refreshCaptcha();
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        // Use manual inertia post to handle redirect properly
        router.post(route('login.otp.verify'), { mobile, code: otpCode }, {
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
            onError: () => setOtpError('کد وارد شده صحیح نیست')
        });
    };

    return (
        <div>
            {step === 'input' ? (
                <form onSubmit={handleSendOtp} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">شماره موبایل</label>
                        <input
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="0912..."
                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-left ltr transition-all"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">کد امنیتی</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={captcha}
                                onChange={(e) => setCaptcha(e.target.value)}
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 dir-ltr text-center transition-all"
                                required
                            />
                            <div className="relative group cursor-pointer shrink-0" onClick={refreshCaptcha} title="تغییر کد">
                                {captchaUrl ? (
                                    <img src={captchaUrl} alt="captcha" className="h-[46px] rounded-xl border w-[120px] object-cover" />
                                ) : (
                                    <div className="h-[46px] w-[120px] bg-gray-100 rounded-xl border flex items-center justify-center text-gray-400 text-xs">
                                        ...
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-xl">
                                    <RefreshCw size={18} className="text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {otpError && <p className="text-red-500 text-xs mt-1 bg-red-50 p-2 rounded-lg">{otpError}</p>}
                    
                    <button
                        disabled={loading}
                        className="w-full bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary-500/30"
                    >
                        {loading && <Loader2 className="animate-spin" size={20} />}
                        دریافت کد تایید
                    </button>
                    
                    <button type="button" onClick={onSwitchMethod} className="w-full text-center text-sm text-gray-500 hover:text-primary-600 mt-2">
                        ورود با ایمیل و رمز عبور
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-left-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">کد ۵ رقمی ارسال شده به</p>
                        <div className="flex items-center justify-center gap-2">
                            <span className="font-bold text-gray-800 dir-ltr">{mobile}</span>
                            <button type="button" onClick={() => setStep('input')} className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded hover:bg-primary-100 transition">
                                ویرایش
                            </button>
                        </div>
                    </div>

                    <div>
                        <input
                            type="text"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-[0.5em] font-mono transition-all"
                            maxLength={5}
                            autoFocus
                            placeholder="- - - - -"
                            required
                        />
                         {otpError && <p className="text-red-500 text-xs mt-2 text-center">{otpError}</p>}
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary-500/30"
                    >
                        {loading && <Loader2 className="animate-spin" size={20} />}
                        ورود به حساب
                    </button>
                    
                    <button type="button" onClick={() => setStep('input')} className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                        <ArrowLeft size={14} /> بازگشت
                    </button>
                </form>
            )}
        </div>
    );
}