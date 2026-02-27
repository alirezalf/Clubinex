import React from 'react';
import { useForm } from '@inertiajs/react';
import { Lock, Save, KeyRound, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import FormInput from '@/Components/Form/FormInput';

export default function PasswordForm() {
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [passwordStrength, setPasswordStrength] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');

    const submitPassword = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.password.update'), {
            onSuccess: () => {
                reset();
                setPasswordStrength(0);
                setSuccessMessage('رمز عبور با موفقیت تغییر کرد');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        });
    };

    // محاسبه قدرت رمز عبور
    const checkPasswordStrength = (pass: string) => {
        if (!pass) return 0;
        let strength = 0;
        if (pass.length >= 8) strength += 25;
        if (pass.match(/[a-z]/)) strength += 25;
        if (pass.match(/[A-Z]/)) strength += 25;
        if (pass.match(/[0-9]/)) strength += 15;
        if (pass.match(/[^a-zA-Z0-9]/)) strength += 10;
        return Math.min(strength, 100);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPass = e.target.value;
        setData('password', newPass);
        setPasswordStrength(checkPasswordStrength(newPass));
    };

    const getStrengthColor = () => {
        if (passwordStrength < 40) return 'bg-red-500';
        if (passwordStrength < 70) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    const getStrengthText = () => {
        if (passwordStrength < 40) return 'ضعیف';
        if (passwordStrength < 70) return 'متوسط';
        return 'قوی';
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* هدر با گرادینت */}
            <div className="relative p-6 border-b border-gray-100 bg-gradient-to-l from-amber-50 to-amber-50/30">
                <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-x-16 -translate-y-16" />
                <div className="relative flex items-center gap-3">
                    <div className="p-3 bg-amber-500 rounded-xl shadow-lg shadow-amber-500/20">
                        <Lock size={22} className="text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-gray-800">تغییر رمز عبور</h2>
                        <p className="text-sm text-gray-500 mt-0.5">برای امنیت بیشتر، رمز عبور قوی انتخاب کنید</p>
                    </div>
                </div>
            </div>

            {/* پیام موفقیت */}
            {successMessage && (
                <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
                    <CheckCircle size={18} className="text-emerald-500" />
                    {successMessage}
                </div>
            )}

            <form onSubmit={submitPassword} className="p-6 space-y-5">
                {/* رمز فعلی */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <KeyRound size={16} className="text-gray-400" />
                        رمز فعلی
                    </label>
                    <div className="relative">
                        <FormInput
                            type={showPasswords.current ? 'text' : 'password'}
                            value={data.current_password}
                            onChange={e => setData('current_password', e.target.value)}
                            error={errors.current_password}
                            className="text-left dir-ltr pl-10"
                            placeholder="رمز عبور فعلی خود را وارد کنید"
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* رمز جدید */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Lock size={16} className="text-gray-400" />
                        رمز جدید
                    </label>
                    <div className="relative">
                        <FormInput
                            type={showPasswords.new ? 'text' : 'password'}
                            value={data.password}
                            onChange={handlePasswordChange}
                            error={errors.password}
                            className="text-left dir-ltr pr-10"
                            placeholder="رمز عبور جدید را وارد کنید"
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* نوار قدرت رمز عبور */}
                    {data.password && (
                        <div className="mt-2 space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">قدرت رمز عبور:</span>
                                <span className={`text-xs font-medium ${
                                    passwordStrength < 40 ? 'text-red-500' :
                                    passwordStrength < 70 ? 'text-amber-500' : 'text-emerald-500'
                                }`}>
                                    {getStrengthText()}
                                </span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                                    style={{ width: `${passwordStrength}%` }}
                                />
                            </div>
                            {passwordStrength < 70 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    برای رمز قوی‌تر از حروف بزرگ، کوچک، اعداد و علائم استفاده کنید
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* تکرار رمز جدید */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Lock size={16} className="text-gray-400" />
                        تکرار رمز جدید
                    </label>
                    <div className="relative">
                        <FormInput
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={data.password_confirmation}
                            onChange={e => setData('password_confirmation', e.target.value)}
                            error={errors.password_confirmation}
                            className="text-left dir-ltr pr-10"
                            placeholder="رمز عبور جدید را دوباره وارد کنید"
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {data.password && data.password_confirmation && data.password !== data.password_confirmation && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <span>•</span> رمز عبور و تکرار آن مطابقت ندارند
                        </p>
                    )}
                </div>

                {/* دکمه ثبت */}
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    {processing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>در حال تغییر...</span>
                        </>
                    ) : (
                        <>
                            <Save size={18} className="group-hover:scale-110 transition-transform" />
                            <span>تغییر رمز عبور</span>
                        </>
                    )}
                </button>

                {/* نکات امنیتی */}
                <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-700 flex items-start gap-2">
                        <span className="text-blue-500 text-lg leading-4">•</span>
                        <span>رمز عبور باید حداقل ۸ کاراکتر داشته باشد و ترکیبی از حروف بزرگ، کوچک، اعداد و علائم باشد</span>
                    </p>
                </div>
            </form>
        </div>
    );
}
