import React, { useState } from 'react';
import { Mail, RefreshCw, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { InputGroup } from './SharedInputs';
import axios from 'axios';

export default function EmailSettings({ data, setData, emailThemes = [] }: { data: any, setData: any, emailThemes?: any[] }) {
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [testEmail, setTestEmail] = useState('');
    const [testThemeId, setTestThemeId] = useState<string>('');

    const handleTest = async () => {
        if (!testEmail) return;
        setTesting(true);
        setTestResult(null);

        try {
            const response = await axios.post(route('admin.settings.test_email'), {
                email: testEmail,
                theme_id: testThemeId
            });
            setTestResult({
                success: response.data.success,
                message: response.data.message
            });
        } catch (error: any) {
            setTestResult({
                success: false,
                message: error.response?.data?.message || 'خطا در ارسال ایمیل تست.'
            });
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                <Mail size={20} className="text-primary-600" />
                تنظیمات ایمیل (SMTP)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup
                    label="SMTP Host"
                    name="mail_host"
                    value={data.mail_host}
                    onChange={setData}
                    dir="ltr"
                    placeholder="smtp.example.com"
                />
                <InputGroup
                    label="SMTP Port"
                    name="mail_port"
                    value={data.mail_port}
                    onChange={setData}
                    dir="ltr"
                    placeholder="587"
                />
                <InputGroup
                    label="Username"
                    name="mail_username"
                    value={data.mail_username}
                    onChange={setData}
                    dir="ltr"
                    placeholder="user@example.com"
                />
                <InputGroup
                    label="Password"
                    name="mail_password"
                    value={data.mail_password}
                    onChange={setData}
                    type="password"
                    dir="ltr"
                    placeholder="******"
                />
                <InputGroup
                    label="آدرس فرستنده"
                    name="mail_from_address"
                    value={data.mail_from_address}
                    onChange={setData}
                    dir="ltr"
                    placeholder="noreply@example.com"
                />
                <InputGroup
                    label="نام فرستنده"
                    name="mail_from_name"
                    value={data.mail_from_name}
                    onChange={setData}
                    placeholder="Clubinex Support"
                />
            </div>

            {/* Test Email Section */}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-gray-500 mb-1">ایمیل گیرنده تست</label>
                        <input
                            type="email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm ltr"
                            placeholder="your-email@example.com"
                        />
                    </div>
                    <div className="w-full md:w-1/3">
                        <label className="block text-xs font-medium text-gray-500 mb-1">قالب تست (اختیاری)</label>
                        <select
                            value={testThemeId}
                            onChange={(e) => setTestThemeId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                        >
                            <option value="">بدون قالب (متن ساده)</option>
                            {emailThemes.map((theme) => (
                                <option key={theme.id} value={theme.id}>{theme.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="button"
                        onClick={handleTest}
                        disabled={testing || !testEmail}
                        className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition flex items-center gap-2 text-sm font-bold disabled:opacity-70 h-[42px]"
                    >
                        {testing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        ارسال تست
                    </button>
                </div>

                {testResult && (
                    <div className={`p-3 rounded-xl border flex items-start gap-3 text-sm ${testResult.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        {testResult.success ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <XCircle size={18} className="shrink-0 mt-0.5" />}
                        <div>
                            <div className="font-bold mb-1">{testResult.message}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
