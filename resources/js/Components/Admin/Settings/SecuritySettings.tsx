import React from 'react';
import { Shield, Lock, Activity, Eye, AlertTriangle } from 'lucide-react';

export default function SecuritySettings({ data, setData }: { data: any, setData: any }) {
    return (
        <div className="space-y-6 animate-in fade-in">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                <Shield size={20} className="text-red-600" />
                تنظیمات امنیتی سیستم
            </h3>

            {/* General Security */}
            <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-red-800 font-bold mb-2">
                    <Lock size={16} /> محدودیت تلاش ورود
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">حداکثر تلاش ناموفق (Lockout)</label>
                        <input 
                            type="number" 
                            value={data.max_login_attempts} 
                            onChange={e => setData('max_login_attempts', e.target.value)} 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center" 
                            placeholder="5"
                        />
                        <p className="text-xs text-gray-500 mt-1">تعداد دفعاتی که کاربر می‌تواند رمز اشتباه وارد کند.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">مدت زمان قفل شدن (دقیقه)</label>
                        <input 
                            type="number" 
                            value={data.lockout_time} 
                            onChange={e => setData('lockout_time', e.target.value)} 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center" 
                            placeholder="60"
                        />
                        <p className="text-xs text-gray-500 mt-1">مدت زمانی که کاربر پس از تلاش‌های ناموفق مسدود می‌شود.</p>
                    </div>
                </div>
            </div>

            {/* Session Security */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-gray-800 font-bold mb-2">
                    <Activity size={16} /> نشست‌های کاربری (Session)
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تایم‌اوت قفل صفحه (دقیقه)</label>
                    <div className="flex items-center gap-3">
                        <input 
                            type="number" 
                            value={data.session_timeout} 
                            onChange={e => setData('session_timeout', e.target.value)} 
                            className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-center" 
                            placeholder="30"
                        />
                        <span className="text-sm text-gray-600">دقیقه عدم فعالیت</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        اگر کاربر بیش از این مدت غیرفعال باشد، صفحه قفل شده و رمز عبور خواسته می‌شود. (0 = غیرفعال)
                    </p>
                </div>
            </div>

            {/* CAPTCHA Toggle */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                 <div className="flex items-center justify-between">
                    <div>
                        <label className="font-bold text-gray-800 flex items-center gap-2">
                            <Eye size={16} className="text-blue-600" />
                            کپچا (CAPTCHA)
                        </label>
                        <p className="text-xs text-gray-500 mt-1">فعال‌سازی کد امنیتی در فرم‌های ورود و ثبت‌نام برای جلوگیری از ربات‌ها.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={data.captcha_enabled} 
                            onChange={(e) => setData('captcha_enabled', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                {data.captcha_enabled && (
                    <div className="mt-3 text-xs text-blue-700 bg-blue-100/50 p-2 rounded flex items-center gap-2">
                        <AlertTriangle size={14} />
                        مطمئن شوید پکیج <code>mews/captcha</code> نصب و کانفیگ شده باشد.
                    </div>
                )}
            </div>
        </div>
    );
}