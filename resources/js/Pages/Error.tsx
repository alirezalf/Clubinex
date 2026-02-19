import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, Home } from 'lucide-react';

interface Props {
    status: number;
}

export default function ErrorPage({ status }: Props) {
    const title = {
        503: 'سرویس در دسترس نیست',
        500: 'خطای سرور',
        404: 'صفحه پیدا نشد',
        403: 'دسترسی غیرمجاز',
    }[status] || 'خطای ناشناخته';

    const description = {
        503: 'سرویس موقتاً برای تعمیرات در دسترس نیست. لطفاً بعداً تلاش کنید.',
        500: 'مشکلی در سمت سرور رخ داده است.',
        404: 'متاسفانه صفحه‌ای که دنبال آن بودید پیدا نشد.',
        403: 'شما اجازه دسترسی به این صفحه را ندارید.',
    }[status] || 'یک خطای پیش‌بینی نشده رخ داده است.';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-sans" dir="rtl">
            <Head title={title} />
            <div className="text-center max-w-lg">
                <div className="mb-6 flex justify-center">
                    <div className="bg-red-50 p-4 rounded-full">
                        <AlertTriangle size={64} className="text-red-500" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{status}: {title}</h1>
                <p className="text-gray-500 mb-8">{description}</p>
                <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition"
                >
                    <Home size={20} /> صفحه اصلی
                </Link>
            </div>
        </div>
    );
}