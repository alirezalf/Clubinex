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
        <form onSubmit={submit} className="space-y-4 animate-in fade-in slide-in-from-left-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل</label>
                <div className="relative">
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full pl-4 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 text-left ltr transition-all"
                        required
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
                <div className="relative">
                    <input
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="w-full pl-4 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 text-left ltr transition-all"
                        required
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">کد امنیتی</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={data.captcha}
                        onChange={(e) => setData('captcha', e.target.value)}
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
                {errors.captcha && <p className="text-red-500 text-xs mt-1">{errors.captcha}</p>}
            </div>

            <button
                disabled={processing}
                className="w-full bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary-500/30"
            >
                {processing && <Loader2 className="animate-spin" size={20} />}
                ورود
            </button>

            <button type="button" onClick={onSwitchMethod} className="w-full text-center text-sm text-gray-500 hover:text-primary-600 mt-2">
                ورود سریع با شماره موبایل
            </button>
        </form>
    );
}