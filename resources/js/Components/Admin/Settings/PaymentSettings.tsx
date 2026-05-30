import React from 'react';
import { CreditCard } from 'lucide-react';
import { InputGroup } from './SharedInputs';

interface PaymentData {
    payment_gateway: string;
    payment_merchant_id: string;
    payment_username?: string;
    payment_password?: string;
    payment_api_key?: string;
    payment_sandbox: boolean | string;
    currency: string;
    point_to_currency_rate: string | number;
    allow_points_to_wallet: boolean | string;
    allow_wallet_to_points: boolean | string;
}

interface Props {
    data: PaymentData;
    setData: (key: string, value: any) => void;
}

export default function PaymentSettings({ data, setData }: Props) {
    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="border-b pb-2">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <CreditCard size={20} className="text-primary-600" />
                    تنظیمات درگاه پرداخت
                </h3>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800 mb-4 leading-relaxed">
                <p>در این بخش می‌توانید اطلاعات درگاه پرداخت خود را ثبت کنید. بسته به نوع درگاه، فیلدهای متفاوتی برای اتصال نیاز است.</p>
            </div>

            <div className="space-y-4 max-w-xl">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">انتخاب درگاه پرداخت</label>
                    <select
                        className="form-select border-gray-300 rounded-xl shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        value={data.payment_gateway || 'zarinpal'}
                        onChange={(e) => setData('payment_gateway', e.target.value)}
                    >
                        <option value="zarinpal">زرین‌پال</option>
                        <option value="nextpay">نکست‌پی (NextPay)</option>
                        <option value="saman">سامان کیش</option>
                        <option value="mellat">به‌پرداخت ملت</option>
                        <option value="pasargad">پاسارگاد</option>
                        <option value="sadad">سداد (ملی)</option>
                    </select>
                </div>

                <InputGroup
                    label="مرچنت کد (Merchant ID) / ترمینال آی‌دی"
                    name="payment_merchant_id"
                    value={data.payment_merchant_id || ''}
                    onChange={setData}
                    dir="ltr"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />

                <InputGroup
                    label="نام کاربری درگاه (Username)"
                    name="payment_username"
                    value={data.payment_username || ''}
                    onChange={setData}
                    dir="ltr"
                    placeholder="در صورت نیاز درگاه وارد کنید"
                />

                <InputGroup
                    label="رمز عبور درگاه (Password)"
                    name="payment_password"
                    value={data.payment_password || ''}
                    onChange={setData}
                    dir="ltr"
                    placeholder="در صورت نیاز درگاه وارد کنید"
                />

                <InputGroup
                    label="کلید API (API Key)"
                    name="payment_api_key"
                    value={data.payment_api_key || ''}
                    onChange={setData}
                    dir="ltr"
                    placeholder="در صورت نیاز درگاه وارد کنید"
                />

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">محیط سندباکس (آزمایشی)</label>
                    <select
                        className="form-select border-gray-300 rounded-xl shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        value={data.payment_sandbox === true || data.payment_sandbox === '1' ? '1' : '0'}
                        onChange={(e) => setData('payment_sandbox', e.target.value)}
                    >
                        <option value="1">فعال (محیط تست)</option>
                        <option value="0">غیرفعال (محیط عملیاتی و واقعی)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">با فعال بودن این گزینه، تراکنش‌ها در محیط سندباکس زرین‌پال و به صورت تستی انجام می‌شوند.</p>
                </div>
            </div>

            <div className="border-b pb-2 pt-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    تنظیمات مالی و تبدیل امتیاز به کیف پول
                </h3>
            </div>

            <div className="space-y-4 max-w-xl">
                <InputGroup
                    label="واحد پول"
                    name="currency"
                    value={data.currency || 'تومان'}
                    onChange={setData}
                    placeholder="تومان، ریال و..."
                />

                <InputGroup
                    label="ارزش هر امتیاز (به واحد پول)"
                    name="point_to_currency_rate"
                    value={data.point_to_currency_rate || 100}
                    onChange={setData}
                    type="number"
                    dir="ltr"
                    placeholder="مثلاً 100"
                />
                <p className="text-xs text-gray-500 mt-1">
                    مثلاً هر سکه یا امتیاز برابر ۱۰۰ تومان است. وقتی کاربر می‌خواهد امتیاز خود را به وجه تبدیل کند این نرخ اعمال می‌شود.
                </p>

                <div className="flex flex-col gap-2 mt-4">
                     <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            checked={data.allow_points_to_wallet === true || data.allow_points_to_wallet === '1'}
                            onChange={(e) => setData('allow_points_to_wallet', e.target.checked ? '1' : '0')}
                        />
                        تبدیل امتیاز به اعتبار کیف پول مجاز است
                    </label>

                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            checked={data.allow_wallet_to_points === true || data.allow_wallet_to_points === '1'}
                            onChange={(e) => setData('allow_wallet_to_points', e.target.checked ? '1' : '0')}
                        />
                        خرید امتیاز (شارژ حساب با پرداخت) مجاز است
                    </label>
                </div>
            </div>
        </div>
    );
}
