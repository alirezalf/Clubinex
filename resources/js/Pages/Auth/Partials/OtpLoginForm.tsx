
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

    const [resendInterval, setResendInterval] = useState(0);
    const [countdown, setCountdown] = useState(0);

    // Timer effect
    React.useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setOtpError('');

        try {
            const response = await axios.post(route('login.otp.send'), { mobile, captcha });
            setStep('verify');
            const interval = response.data.resend_interval || 120;
            setResendInterval(interval);
            setCountdown(interval);
        } catch (err: any) {
            setOtpError(err.response?.data?.message || err.response?.data?.errors?.captcha?.[0] || 'خطا در ارسال پیامک');
            if (err.response?.data?.remaining) {
                 // If throttled, maybe show timer?
                 // For now just show error
            }
            refreshCaptcha();
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (countdown > 0) return;
        setLoading(true);
        setOtpError('');
        try {
            const response = await axios.post(route('login.otp.send'), { mobile, captcha }); // Note: Captcha might be needed again if enabled?
            // Usually resend doesn't require captcha if session is valid, but here it's a stateless API call.
            // If captcha is enabled, we might need to go back to step 1 or handle captcha refresh here.
            // For simplicity, if captcha is required, we might force user to go back.
            // But let's assume for resend we might need a way to handle captcha.
            // Actually, if captcha is enabled, the user MUST solve it again.
            // So if captchaUrl is present, we probably can't just "Resend" without input.
            // Let's check if we should redirect to input step if captcha is required.

            if (captchaUrl) {
                setStep('input');
                refreshCaptcha();
                setOtpError('لطفا کد امنیتی جدید را وارد کنید.');
                return;
            }

            const interval = response.data.resend_interval || 120;
            setResendInterval(interval);
            setCountdown(interval);

        } catch (err: any) {
             setOtpError(err.response?.data?.message || 'خطا در ارسال مجدد');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        // Use manual inertia post to handle redirect properly
        router.post(route('login.otp.verify'), { mobile, code: otpCode }, {
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
            onError: () => setOtpError('کد وارد شده صحیح نیست')
        });
    };

    // Auto-submit when OTP is 5 digits
    React.useEffect(() => {
        if (otpCode.length === 5 && step === 'verify') {
            handleVerifyOtp();
        }
    }, [otpCode]);

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
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-left ltr transition-all text-xs placeholder:text-gray-300 text-gray-900 bg-white"
                            required
                        />
                    </div>

                    {captchaUrl && (
                        <div className="space-y-1">
                            <label className="block text-[10px] font-medium text-gray-500">کد امنیتی</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={captcha}
                                    onChange={(e) => setCaptcha(e.target.value)}
                                    className="w-24 px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dir-ltr text-center transition-all text-xs font-mono tracking-widest text-gray-900 bg-white"
                                    placeholder="Code"
                                    required
                                />
                                <div className="relative group cursor-pointer flex-1" onClick={refreshCaptcha} title="تغییر کد">
                                    <div className="h-[34px] w-full rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                                        <img src={captchaUrl} alt="captcha" className="h-full w-full object-contain" />
                                    </div>
                                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-lg">
                                        <RefreshCw size={14} className="text-gray-700" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-center text-xl tracking-[0.5em] font-mono transition-all placeholder:text-gray-200 text-gray-900 bg-white"
                            maxLength={5}
                            autoFocus
                            placeholder="-----"
                            autoComplete="one-time-code"
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

                        <div className="text-center mt-2">
                            {countdown > 0 ? (
                                <span className="text-xs text-gray-400">
                                    ارسال مجدد کد تا {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')} دیگر
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={loading}
                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                                >
                                    ارسال مجدد کد تایید
                                </button>
                            )}
                        </div>

                        <button type="button" onClick={() => setStep('input')} className="w-full flex items-center justify-center gap-1 text-[10px] text-gray-500 hover:text-gray-700 transition-colors">
                            <ArrowLeft size={12} /> بازگشت
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
