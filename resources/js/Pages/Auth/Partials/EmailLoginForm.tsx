import React from 'react';
import { useForm } from '@inertiajs/react';
import { Mail, Lock, RefreshCw, Loader2 } from 'lucide-react';

interface Props {
    captchaUrl: string | null;
    refreshCaptcha: () => void;
    onSwitchMethod: () => void;
}

export default function EmailLoginForm({ captchaUrl, refreshCaptcha, onSwitchMethod }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        captcha: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('login'), {
            onError: () => refreshCaptcha()
        });
    };

    return (
        <form onSubmit={submit} className="space-y-3 animate-in fade-in slide-in-from-left-4">
            <div className="space-y-1">
                <label className="block text-[10px] font-medium text-gray-500">ایمیل</label>
                <div className="relative group">
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full pl-4 pr-9 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-left ltr transition-all text-xs placeholder:text-gray-300"
                        placeholder="example@domain.com"
                        required
                    />
                    <Mail className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={14} />
                </div>
                {errors.email && <p className="text-red-500 text-[10px]">{errors.email}</p>}
            </div>

            <div className="space-y-1">
                <label className="block text-[10px] font-medium text-gray-500">رمز عبور</label>
                <div className="relative group">
                    <input
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="w-full pl-4 pr-9 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-left ltr transition-all text-xs placeholder:text-gray-300"
                        placeholder="••••••••"
                        required
                    />
                    <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={14} />
                </div>
            </div>

            <div className="space-y-1">
                <label className="block text-[10px] font-medium text-gray-500">کد امنیتی</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={data.captcha}
                        onChange={(e) => setData('captcha', e.target.value)}
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
                {errors.captcha && <p className="text-red-500 text-[10px]">{errors.captcha}</p>}
            </div>

            <button
                disabled={processing}
                className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2 font-bold text-xs shadow-sm shadow-primary-500/20 active:scale-[0.98] mt-2"
            >
                {processing && <Loader2 className="animate-spin" size={16} />}
                ورود
            </button>
        </form>
    );
}
