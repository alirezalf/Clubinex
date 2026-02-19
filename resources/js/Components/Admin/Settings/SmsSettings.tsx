import React, { useState } from 'react';
import { Smartphone, RefreshCw, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { InputGroup } from './SharedInputs';
import axios from 'axios';

export default function SmsSettings({ data, setData }: { data: any, setData: any }) {
    const [smsTesting, setSmsTesting] = useState(false);
    const [smsTestResult, setSmsTestResult] = useState<{ success: boolean; message: string; info?: any } | null>(null);

    const handleSmsTest = async () => {
        setSmsTesting(true);
        setSmsTestResult(null);

        try {
            const response = await axios.post(route('admin.settings.test_sms'), {
                sms_provider: data.sms_provider,
                sms_api_key: data.sms_api_key,
                sms_username: data.sms_username,
                sms_password: data.sms_password
            });

            setSmsTestResult({
                success: response.data.success,
                message: response.data.message,
                info: response.data.info
            });
        } catch (error: any) {
            setSmsTestResult({
                success: false,
                message: error.response?.data?.message || 'خطا در برقراری ارتباط با درگاه پیامک.'
            });
        } finally {
            setSmsTesting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                <Smartphone size={20} className="text-primary-600" />
                تنظیمات پیامک
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup 
                    label="درگاه (Provider)" 
                    name="sms_provider" 
                    value={data.sms_provider} 
                    onChange={setData} 
                    placeholder="مثلا: kavenegar, ippanel" 
                />
                <InputGroup 
                    label="شماره فرستنده" 
                    name="sms_sender" 
                    value={data.sms_sender} 
                    onChange={setData} 
                    dir="ltr" 
                    placeholder="مثلا: 10002000" 
                />
            </div>
            <InputGroup 
                label="کلید API" 
                name="sms_api_key" 
                value={data.sms_api_key} 
                onChange={setData} 
                type="password" 
                dir="ltr" 
                placeholder="کلید اختصاصی پنل پیامک" 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup 
                    label="نام کاربری پنل" 
                    name="sms_username" 
                    value={data.sms_username} 
                    onChange={setData} 
                    dir="ltr" 
                />
                <InputGroup 
                    label="رمز عبور پنل" 
                    name="sms_password" 
                    value={data.sms_password} 
                    onChange={setData} 
                    type="password" 
                    dir="ltr" 
                />
            </div>

            {/* Test Connection Button */}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">برای تست اتصال، ابتدا اطلاعات بالا را وارد کنید (نیاز به ذخیره نیست).</span>
                    <button
                        type="button"
                        onClick={handleSmsTest}
                        disabled={smsTesting}
                        className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition flex items-center gap-2 text-sm font-bold disabled:opacity-70"
                    >
                        {smsTesting ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        تست اتصال
                    </button>
                </div>

                {smsTestResult && (
                    <div className={`p-3 rounded-xl border flex items-start gap-3 text-sm ${smsTestResult.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        {smsTestResult.success ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <XCircle size={18} className="shrink-0 mt-0.5" />}
                        <div>
                            <div className="font-bold mb-1">{smsTestResult.message}</div>
                            {smsTestResult.info && (
                                <div className="text-xs opacity-90 font-mono mt-1">
                                    {smsTestResult.info.details}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}