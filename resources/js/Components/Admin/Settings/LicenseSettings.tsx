import React from 'react';
import clsx from 'clsx';
import { usePage } from '@inertiajs/react';
import { Copy, ShieldCheck, ShieldAlert, KeyRound, Cpu, Calendar, User } from 'lucide-react';

function ToggleIndicator({ label, description, checked, onChange, disabled }: any) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <h4 className="font-bold text-gray-800 text-sm">{label}</h4>
                <p className="text-xs text-gray-500 mt-1">{description}</p>
            </div>
            <button
                type="button"
                onClick={() => !disabled && onChange(!checked)}
                disabled={disabled}
                className={clsx(
                    "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                    checked ? "bg-green-500" : "bg-gray-200 text-gray-400 opacity-70",
                    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                )}
            >
                <span className="sr-only">Toggle {label}</span>
                <span
                    className={clsx(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        checked ? "-translate-x-5" : "translate-x-0"
                    )}
                />
            </button>
        </div>
    );
}

interface LicenseSettingsProps {
    data: any;
    setData: (key: string, value: any) => void;
}

export default function LicenseSettings({ data, setData }: LicenseSettingsProps) {
    const { machine_id, license_info } = usePage<any>().props;

    const copyMachineId = () => {
        navigator.clipboard.writeText(machine_id || '');
        alert('شناسه سیستم کپی شد');
    };

    const isLicenseValid = license_info?.isValid;
    const isExpired = license_info?.isExpired;

    // Fallback to checking data object (if updating states optimistically)
    const getModuleState = (key: string) => {
        const isEnabledInDb = data[key] === '1' || data[key] === true;
        const isAllowedByLicense = !data.license_key || (isLicenseValid && license_info?.modules && license_info.modules[key] === true);

        return isEnabledInDb && isAllowedByLicense;
    };

    return (
        <div className="space-y-8 animate-in fade-in max-w-4xl">
            <div className="border-b pb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <KeyRound className="w-5 h-5" /> مدیریت لایسنس و ماژول‌ها
                </h3>
                <p className="text-sm text-gray-500 mt-1">فعال‌سازی ماژول‌های سیستم از طریق کد لایسنس. جهت دریافت لایسنس جدید، شناسه سیستم را به پشتیبانی ارسال کنید.</p>
            </div>

            {/* License Information Card */}
            <div className={clsx(
                "rounded-2xl border p-6",
                isLicenseValid ? "bg-green-50/50 border-green-200" : "bg-red-50/50 border-red-200"
            )}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className={clsx(
                            "w-12 h-12 rounded-full flex items-center justify-center",
                            isLicenseValid ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        )}>
                            {isLicenseValid ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                        </div>
                        <div>
                            <h4 className={clsx("font-bold text-lg", isLicenseValid ? "text-green-800" : "text-red-800")}>
                                {isLicenseValid ? 'لایسنس معتبر و فعال است' : (isExpired ? 'لایسنس منقضی شده یا نامعتبر است' : 'لایسنس وارد نشده است')}
                            </h4>
                            {isLicenseValid && license_info?.exp_formatted && (
                                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    معتبر تا: {license_info.exp_formatted}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Cpu className="w-3 h-3" /> شناسه سیستم (Machine ID)</p>
                            <p className="font-mono text-sm text-gray-800 font-bold truncate max-w-[200px]" dir="ltr">{machine_id}</p>
                        </div>
                        <button type="button" onClick={copyMachineId} className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>

                    {isLicenseValid && license_info?.client_name && (
                        <div className="bg-white p-4 rounded-xl border">
                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><User className="w-3 h-3" /> صادر شده برای</p>
                            <p className="text-sm text-gray-800 font-bold">{license_info.client_name}</p>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium mb-2 text-gray-700">ثبت یا تمدید لایسنس (کد JWT دریافت شده را اینجا وارد کنید)</label>
                    <textarea
                        dir="ltr"
                        placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI..."
                        className="w-full h-24 rounded-xl border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all font-mono text-xs shadow-sm bg-white p-3"
                        value={data.license_key || ''}
                        onChange={(e) => setData('license_key', e.target.value)}
                    ></textarea>
                     <p className="text-xs text-gray-500 mt-2">پس از قرار دادن کد لایسنس، روی دکمه ذخیره تنظیمات کلیک کنید.</p>
                </div>
            </div>

            <div>
                <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">وضعیت ماژول‌های سیستم</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    {!isLicenseValid && !!data.license_key && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex border-2 border-dashed border-gray-300 rounded-2xl items-center justify-center">
                             <div className="bg-white px-6 py-4 rounded-xl shadow-lg border text-center">
                                 <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                 <p className="text-red-600 font-bold">جهت فعال‌سازی ماژول‌ها نیازمند لایسنس معتبر هستید.</p>
                             </div>
                        </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <ToggleIndicator
                            label="ماژول باشگاه و سطوح کاربر"
                            description="فعال‌سازی سیستم باشگاه مشتریان (برنزی، نقره‌ای، طلایی...)"
                            checked={getModuleState('enable_clubs')}
                            onChange={(val: boolean) => setData('enable_clubs', val ? '1' : '0')}
                            disabled={!!data.license_key && !isLicenseValid}
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <ToggleIndicator
                            label="ماژول گیمیفیکیشن (گردونه شانس)"
                            description="فعال‌سازی ویژگی گردونه شانس و سیستم پاداش مبتنی بر شانس"
                            checked={getModuleState('enable_lucky_wheel')}
                            onChange={(val: boolean) => setData('enable_lucky_wheel', val ? '1' : '0')}
                            disabled={!!data.license_key && !isLicenseValid}
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <ToggleIndicator
                            label="ماژول ثبت محصول و سریال"
                            description="مدیریت بانک محصولات و امکان ثبت سریال کالا توسط مشتریان"
                            checked={getModuleState('enable_products')}
                            onChange={(val: boolean) => setData('enable_products', val ? '1' : '0')}
                            disabled={!!data.license_key && !isLicenseValid}
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <ToggleIndicator
                            label="ماژول فروشگاه جوایز"
                            description="فروشگاه هدایا با قابلیت تبدیل امتیاز کاربران به جوایز فیزیکی یا کدهای تخفیف"
                            checked={getModuleState('enable_rewards')}
                            onChange={(val: boolean) => setData('enable_rewards', val ? '1' : '0')}
                            disabled={!!data.license_key && !isLicenseValid}
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <ToggleIndicator
                            label="ماژول کیف پول اعتباری"
                            description="افزودن امکانات مالی، خرید، شارژ و برداشت وجه"
                            checked={getModuleState('enable_wallet')}
                            onChange={(val: boolean) => setData('enable_wallet', val ? '1' : '0')}
                            disabled={!!data.license_key && !isLicenseValid}
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <ToggleIndicator
                            label="ماژول معرفی دوستان (Referral)"
                            description="فعال‌سازی لینک دعوت و سیستم امتیازدهی بازاریابی شبکه‌ای"
                            checked={getModuleState('enable_referrals')}
                            onChange={(val: boolean) => setData('enable_referrals', val ? '1' : '0')}
                            disabled={!!data.license_key && !isLicenseValid}
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <ToggleIndicator
                            label="ماژول نظرسنجی و مسابقات"
                            description="امکان برگزاری کوئیز، مسابقه و نظرسنجی با تعیین پاداش مشارکت"
                            checked={getModuleState('enable_surveys')}
                            onChange={(val: boolean) => setData('enable_surveys', val ? '1' : '0')}
                            disabled={!!data.license_key && !isLicenseValid}
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <ToggleIndicator
                            label="ماژول تیکتینگ و پشتیبانی"
                            description="سیستم ارسال تیکت و مدیریت مشکلات مشتریان"
                            checked={getModuleState('enable_tickets')}
                            onChange={(val: boolean) => setData('enable_tickets', val ? '1' : '0')}
                            disabled={!!data.license_key && !isLicenseValid}
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <ToggleIndicator
                            label="ماژول گزارشات پیشرفته"
                            description="دسترسی به نمودارها، خروجی‌های تفصیلی و ساخت گزارشات پویا"
                            checked={getModuleState('enable_reports')}
                            onChange={(val: boolean) => setData('enable_reports', val ? '1' : '0')}
                            disabled={!!data.license_key && !isLicenseValid}
                        />
                    </div>
                </div>
            </div>

        </div>
    );
}
