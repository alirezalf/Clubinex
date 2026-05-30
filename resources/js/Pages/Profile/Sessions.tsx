import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Monitor, Smartphone, Tablet, ShieldAlert } from 'lucide-react';

interface Session {
    id: string;
    ip_address: string;
    is_current_device: boolean;
    device: string;
    browser: string;
    platform: string;
    last_active: string;
}

interface Props {
    sessions: Session[];
}

export default function Sessions({ sessions }: Props) {
    const { delete: destroy } = useForm();
    const otherForm = useForm({
        password: '',
    });

    const logoutSession = (id: string) => {
        if (confirm('آیا از خروج از این دستگاه اطمینان دارید؟')) {
            destroy(route('profile.sessions.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const logoutOtherSessions = (e: React.FormEvent) => {
        e.preventDefault();

        otherForm.delete(route('profile.sessions.destroy_other'), {
            preserveScroll: true,
            onSuccess: () => {
                otherForm.reset('password');
            }
        });
    };

    const getDeviceIcon = (device: string) => {
        if (device === 'موبایل') return <Smartphone className="text-gray-400" size={24} />;
        if (device === 'تبلت') return <Tablet className="text-gray-400" size={24} />;
        return <Monitor className="text-gray-400" size={24} />;
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'پروفایل', href: route('profile') }, { label: 'دستگاه‌های فعال' }]}>
            <Head title="دستگاه‌های فعال" />

            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-800">نشست‌های فعال</h2>
                            <p className="text-sm text-gray-500 mt-1">مشاهده و مدیریت دستگاه‌هایی که در آن‌ها وارد سیستم شده‌اید.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {sessions.map((session, i) => (
                            <div key={session.id || i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center border border-gray-100 shrink-0">
                                        {getDeviceIcon(session.device)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-800 text-sm">
                                                {session.platform} - {session.browser}
                                            </span>
                                            {session.is_current_device && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">دستگاه فعلی</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-3">
                                            <span className="font-mono dir-ltr">{session.ip_address}</span>
                                            <span className="opacity-40">•</span>
                                            <span>{session.is_current_device ? 'هم‌اکنون فعال' : `آخرین بازدید: ${session.last_active}`}</span>
                                        </div>
                                    </div>
                                </div>

                                {!session.is_current_device && (
                                    <button
                                        onClick={() => logoutSession(session.id)}
                                        className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition whitespace-nowrap"
                                    >
                                        خروج
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Logout Other Devices Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">خروج از تمامی دستگاه‌های دیگر</h3>
                    <p className="text-sm text-gray-500 mb-6">
                        در صورت نیاز، می‌توانید با وارد کردن رمز عبور فعلی، از تمام حساب‌های دیگر خود به صورت یکجا خارج شوید.
                    </p>

                    <form onSubmit={logoutOtherSessions} className="flex flex-col sm:flex-row sm:items-end gap-3 max-w-lg">
                        <div className="flex-1">
                            <label className="block text-[11px] font-bold text-gray-400 mb-1">رمز عبور فعلی</label>
                            <input
                                type="password"
                                className="w-full h-11 bg-gray-50 border border-gray-100 rounded-xl px-4 text-left font-mono dir-ltr focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition shadow-inner"
                                value={otherForm.data.password}
                                onChange={e => otherForm.setData('password', e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            {otherForm.errors.password && (
                                <p className="text-xs text-red-500 mt-1 font-medium">{otherForm.errors.password}</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={otherForm.processing}
                            className="h-11 px-6 rounded-xl bg-gray-800 text-white font-bold text-sm shadow-md hover:bg-gray-700 transition disabled:opacity-50"
                        >
                            خروج از سایر دستگاه‌ها
                        </button>
                    </form>
                </div>

            </div>
        </DashboardLayout>
    );
}
