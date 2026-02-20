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
                <form onSubmit={handleSendOtp} className="space-y-3 animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-1">
                        <label className="block text-[10px] font-medium text-gray-500">شماره موبایل</label>
                        <input
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="0912..."
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-left ltr transition-all text-xs placeholder:text-gray-300"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[10px] font-medium text-gray-500">کد امنیتی</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={captcha}
                                onChange={(e) => setCaptcha(e.target.value)}
                                className="w-24 px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dir-ltr text-center transition-all text-xs font-mono tracking-widest"
                                placeholder="Code"
                                required
                            />
                            <div className="relative group cursor-pointer flex-1" onClick={refreshCaptcha} title="تغییر کد">
                                {captchaUrl ? (
                                    <div className="h-[34px] w-full rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                                        <img src={captchaUrl} alt="captcha" className="h-full w-full object-contain" />
                                    </div>
                                ) : (
                                    <div className="h-[34px] w-full bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-[10px]">
                                        ...
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-lg">
                                    <RefreshCw size={14} className="text-gray-700" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {otpError && <p className="text-red-500 text-[10px] mt-1 bg-red-50 p-1.5 rounded-lg border border-red-100">{otpError}</p>}

                    <button
                        disabled={loading}
                        className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2 font-bold text-xs shadow-sm shadow-primary-500/20 active:scale-[0.98] mt-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={16} />}
                        دریافت کد تایید
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in slide-in-from-left-4">
                    <div className="text-center">
                        <p className="text-[10px] text-gray-500 mb-1">کد ۵ رقمی ارسال شده به</p>
                        <div className="flex items-center justify-center gap-2">
                            <span className="font-bold text-gray-800 dir-ltr text-xs">{mobile}</span>
                            <button type="button" onClick={() => setStep('input')} className="text-[10px] text-primary-600 bg-primary-50 px-2 py-0.5 rounded hover:bg-primary-100 transition border border-primary-100">
                                ویرایش
                            </button>
                        </div>
                    </div>

                    <div>
                        <input
                            type="text"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-center text-xl tracking-[0.5em] font-mono transition-all placeholder:text-gray-200"
                            maxLength={5}
                            autoFocus
                            placeholder="-----"
                            required
                        />
                         {otpError && <p className="text-red-500 text-[10px] mt-2 text-center">{otpError}</p>}
                    </div>

                    <div className="space-y-2">
                        <button
                            disabled={loading}
                            className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2 font-bold text-xs shadow-sm shadow-primary-500/20 active:scale-[0.98]"
                        >
                            {loading && <Loader2 className="animate-spin" size={16} />}
                            ورود به حساب
                        </button>

                        <button type="button" onClick={() => setStep('input')} className="w-full flex items-center justify-center gap-1 text-[10px] text-gray-500 hover:text-gray-700 transition-colors">
                            <ArrowLeft size={12} /> بازگشت
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
