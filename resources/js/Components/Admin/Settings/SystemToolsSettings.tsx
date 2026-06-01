import React, { useRef } from 'react';
import { Database, Download, RefreshCw, AlertTriangle, UploadCloud } from 'lucide-react';
import { router, useForm } from '@inertiajs/react';

export default function SystemToolsSettings() {
    const backupDatabase = () => {
        window.location.href = route('admin.settings.backup_database');
    };

    const updateSystem = () => {
        if(confirm('آیا مطمئن هستید؟ این عملیات فایل‌های جدید را پردازش کرده و دیتابیس را ارتقا می‌دهد.')) {
            router.post(route('admin.settings.update_system'));
        }
    };

    const { data, setData, post, processing, errors, progress } = useForm({
        update_file: null as File | null,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpdateUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.update_file) return;

        if(confirm('آیا آماده آپدیت سیستم هستید؟ این عملیات فایل‌های جدید را پردازش می‌کند و سیستم بروزرسانی می‌شود. حتما قبل از این کار از دیتابیس پشتیبان بگیرید.')) {
            post(route('admin.settings.upload_update'), {
                onSuccess: () => {
                    setData('update_file', null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in max-w-4xl">
            <div className="border-b pb-4">
                <h3 className="text-xl font-bold text-gray-800">بروزرسانی و ابزارهای سیستم</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    در این بخش می‌توانید از دیتابیس پشتیبان بگیرید و یا فایل آپدیت (ZIP) دریافت شده از پشتیبانی را در اینجا آپلود کنید.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Backup Settings */}
                <div className="border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                            <Download size={24} />
                        </div>
                        <h4 className="font-bold text-gray-800 text-lg">پشتیبان‌گیری از دیتابیس</h4>
                        <p className="text-sm text-gray-500 mt-2 mb-6 leading-relaxed">
                            دریافت فایل پشتیبان (SQL یا SQLite). توصیه می‌شود قبل از هرگونه بروزرسانی، یک نسخه پشتیبان از اطلاعات خود تهیه کنید تا در صورت بروز مشکل اطلاعات شما از بین نرود.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={backupDatabase}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 transition-colors w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                        <Database size={18} />
                        دریافت نسخه پشتیبان (Backup)
                    </button>
                </div>

                {/* Upload Update ZIP */}
                <div className="border rounded-2xl p-6 bg-purple-50 shadow-sm border-purple-200 flex flex-col justify-between md:col-span-1">
                    <div>
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                            <UploadCloud size={24} />
                        </div>
                        <h4 className="font-bold text-gray-800 text-lg">آپلود و نصب بسته بروزرسانی</h4>
                        <p className="text-sm text-gray-600 mt-2 mb-4 leading-relaxed">
                            فایل بروزرسانی دریافت شده (پسوند .zip) را انتخاب کنید. با کلیک روی آپلود، نرم‌افزار به صورت خودکار فایل‌ها را جایگزین کرده و سیستم را ارتقا می‌دهد.
                        </p>
                        <div className="flex items-start gap-2 bg-purple-100 text-purple-800 p-3 rounded-lg mb-6 text-xs font-medium">
                            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                            <span>توجه: پس از پایان آپلود، دیتابیس نیز ارتقا یافته و کش‌های سیستم پاکسازی می‌شوند. لطفا تا پایان پردازش صفحه را نبندید.</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <input
                            type="file"
                            accept=".zip"
                            ref={fileInputRef}
                            onChange={(e) => setData('update_file', e.target.files ? e.target.files[0] : null)}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                        />
                        {errors.update_file && <span className="text-red-500 text-xs font-bold">{errors.update_file}</span>}
                        {progress && (
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={handleUpdateUpload}
                            disabled={!data.update_file || processing}
                            className="bg-purple-600 text-white hover:bg-purple-700 transition w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                        >
                            <UploadCloud size={18} />
                            {processing ? 'در حال پردازش...' : 'شروع آپلود و بروزرسانی'}
                        </button>
                    </div>
                </div>

                {/* System Update Setting (Legacy fallback) */}
                <div className="border rounded-2xl p-6 bg-yellow-50 shadow-sm border-yellow-200 flex flex-col justify-between md:col-span-2">
                    <div>
                        <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-4">
                            <RefreshCw size={24} />
                        </div>
                        <h4 className="font-bold text-gray-800 text-lg">بروزرسانی دستی سیستم (Migrations)</h4>
                        <p className="text-sm text-gray-600 mt-2 mb-4 leading-relaxed">
                            در صورتی که فایل‌های آپدیت را به صورت دستی روی هاست (مثلا با cPanel) آپلود کرده‌اید، برای اعمال نهایی و بروزرسانی جداول دیتابیس روی این گزینه کلیک کنید.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={updateSystem}
                        className="bg-yellow-600 text-white hover:bg-yellow-700 transition lg:w-1/2 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm"
                    >
                        <RefreshCw size={18} />
                        اجرای دستی فرآیند بروزرسانی
                    </button>
                </div>

            </div>
        </div>
    );
}
