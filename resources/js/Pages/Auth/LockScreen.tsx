import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';

interface Props {
    user: {
        name: string;
        avatar: string;
        email: string;
    };
}

export default function LockScreen({ user }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('lock-screen.unlock'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4" dir="rtl">
            <Head title="صفحه قفل" />
            
            <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl overflow-hidden p-8 text-center relative">
                
                {/* User Avatar */}
                <div className="relative w-24 h-24 mx-auto mb-4">
                    <div className="w-full h-full rounded-full border-4 border-white/30 overflow-hidden bg-gray-800 flex items-center justify-center shadow-lg">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl font-bold text-white">{user.name.charAt(0)}</span>
                        )}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-amber-500 rounded-full p-1.5 border-2 border-gray-800">
                        <Lock size={14} className="text-white" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                <p className="text-gray-300 text-sm mb-8">{user.email}</p>

                <form onSubmit={submit} className="space-y-6">
                    <div className="relative">
                        <input
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center tracking-widest transition-all"
                            placeholder="رمز عبور را وارد کنید"
                            autoFocus
                        />
                        {errors.password && <p className="text-red-400 text-xs mt-2">{errors.password}</p>}
                    </div>

                    <button
                        disabled={processing}
                        className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30"
                    >
                        {processing ? <Loader2 size={20} className="animate-spin" /> : 'بازگشایی'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10">
                    <Link href={route('logout')} method="post" as="button" className="text-sm text-gray-400 hover:text-white transition flex items-center justify-center gap-1 mx-auto">
                        <ArrowRight size={14} /> خروج و ورود با حساب دیگر
                    </Link>
                </div>
            </div>
        </div>
    );
}