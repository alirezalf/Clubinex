import React, { useState } from 'react';
import { ShoppingBag, RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { InputGroup } from './SharedInputs';
import axios from 'axios';
import { router } from '@inertiajs/react';

interface WpData {
    wp_url: string;
    wp_consumer_key: string;
    wp_consumer_secret: string;
}

interface Props {
    data: WpData;
    setData: (key: string, value: any) => void;
}

export default function WordPressSettings({ data, setData }: Props) {
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string; info?: any } | null>(null);

    const handleTestConnection = async () => {
        if (!data.wp_url || !data.wp_consumer_key || !data.wp_consumer_secret) {
            setTestResult({ success: false, message: 'لطفاً تمام فیلدها را پر کنید.' });
            return;
        }

        setTesting(true);
        setTestResult(null);

        try {
            const response = await axios.post(route('admin.settings.test_wp'), {
                url: data.wp_url,
                key: data.wp_consumer_key,
                secret: data.wp_consumer_secret
            });

            if (response.data.success) {
                setTestResult({
                    success: true,
                    message: 'اتصال موفقیت‌آمیز بود!',
                    info: response.data.info
                });
            }
        } catch (error: any) {
            setTestResult({
                success: false,
                message: error.response?.data?.message || 'خطا در برقراری ارتباط. لطفاً آدرس و کلیدها را بررسی کنید.'
            });
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <ShoppingBag size={20} className="text-primary-600" />
                    اتصال به فروشگاه وردپرس (WooCommerce)
                </h3>
                <button 
                    type="button" 
                    onClick={() => { if(confirm('آیا از شروع همگام‌سازی اطمینان دارید؟')) router.post(route('admin.products.wp_sync_mapped'), { mapping: { title: 'name', slug: 'slug' } }) }} 
                    className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1 transition"
                    title="همگام‌سازی سریع محصولات"
                >
                    <RefreshCw size={14} /> همگام‌سازی سریع
                </button>
            </div>

            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-sm text-orange-800 mb-4 leading-relaxed">
                <p>برای دریافت کلیدها، در پنل وردپرس به مسیر <b>ووکامرس &gt; پیکربندی &gt; پیشرفته &gt; REST API</b> بروید و یک کلید جدید با دسترسی <b>خواندن/نوشتن</b> ایجاد کنید.</p>
                <p className="mt-1 font-bold">نکته: آدرس سایت باید با https:// شروع شود.</p>
            </div>

            <div className="space-y-4">
                <InputGroup 
                    label="آدرس سایت وردپرس" 
                    name="wp_url" 
                    value={data.wp_url} 
                    onChange={setData} 
                    dir="ltr" 
                    placeholder="https://example.com" 
                />
                <InputGroup 
                    label="Consumer Key" 
                    name="wp_consumer_key" 
                    value={data.wp_consumer_key} 
                    onChange={setData} 
                    dir="ltr" 
                    placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
                />
                <InputGroup 
                    label="Consumer Secret" 
                    name="wp_consumer_secret" 
                    value={data.wp_consumer_secret} 
                    onChange={setData} 
                    dir="ltr" 
                    type="password" 
                    placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
                />
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="bg-gray-800 text-white px-6 py-2.5 rounded-xl hover:bg-gray-900 transition shadow-md flex items-center gap-2 text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {testing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                    تست اتصال
                </button>

                {testResult && (
                    <div className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg ${testResult.success ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {testResult.success ? <CheckCircle size={18} /> : <XCircle size={18} />}
                        <span>{testResult.message}</span>
                        {testResult.success && testResult.info && (
                            <span className="text-xs opacity-80 mr-2">
                                (WordPress: {testResult.info.wp_version}, WC: {testResult.info.wc_version})
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}