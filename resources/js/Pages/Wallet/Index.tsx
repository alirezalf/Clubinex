import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import Pagination from '@/Components/Pagination';

interface Wallet {
    id: number;
    balance: string;
}

interface Transaction {
    id: number;
    amount: string;
    type: string;
    status: string;
    description: string;
    reference_id: string;
    created_at: string;
}

interface Props {
    wallet: Wallet;
    transactions: {
        data: Transaction[];
        links: any[];
    };
    points: number;
    config: {
        currency: string;
        rate: number;
        allow_p2w: boolean;
        allow_w2p: boolean;
    };
}

export default function WalletIndex({ wallet, transactions, points, config }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: ''
    });

    const { data: p2wData, setData: setP2wData, post: postP2w, processing: processingP2w, errors: p2wErrors, reset: p2wReset } = useForm({
        points: ''
    });

    const { data: w2pData, setData: setW2pData, post: postW2p, processing: processingW2p, errors: w2pErrors, reset: w2pReset } = useForm({
        points: ''
    });

    const { data: withdrawData, setData: setWithdrawData, post: postWithdraw, processing: processingWithdraw, errors: withdrawErrors, reset: withdrawReset } = useForm({
        amount: '',
        bank_name: '',
        iban_number: '',
        card_number: '',
        account_holder: ''
    });

    const submitCharge = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('wallet.charge'));
    };

    const submitP2w = (e: React.FormEvent) => {
        e.preventDefault();
        postP2w(route('wallet.points_to_wallet'), { onSuccess: () => p2wReset() });
    };

    const submitW2p = (e: React.FormEvent) => {
        e.preventDefault();
        postW2p(route('wallet.wallet_to_points'), { onSuccess: () => w2pReset() });
    };

    const submitWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        postWithdraw(route('wallet.withdraw'), { onSuccess: () => withdrawReset() });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return <CheckCircle size={16} className="text-green-500" />;
            case 'failed': return <XCircle size={16} className="text-red-500" />;
            default: return <Clock size={16} className="text-yellow-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'success': return 'موفق';
            case 'failed': return 'ناموفق';
            default: return 'در انتظار';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'deposit': return <span className="flex items-center gap-1 text-green-600"><ArrowDownLeft size={16}/> واریز (شارژ)</span>;
            case 'purchase': return <span className="flex items-center gap-1 text-blue-600"><ArrowUpRight size={16}/> خرید</span>;
            default: return <span className="flex items-center gap-1 text-red-600"><ArrowUpRight size={16}/> برداشت</span>;
        }
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'کیف پول' }]}>
            <Head title="کیف پول من" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Balance Cards */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-20 transform translate-x-4 -translate-y-4">
                            <WalletIcon size={120} />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-primary-100 mb-1">موجودی کیف پول شما</h2>
                            <div className="text-3xl font-black mt-2 mb-1 flex items-baseline gap-1">
                                {Number(wallet?.balance || 0).toLocaleString()} <span className="text-sm font-normal text-primary-200">{config?.currency || 'تومان'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-20 transform translate-x-4 -translate-y-4">
                            <ArrowUpRight size={120} />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-amber-100 mb-1">موجودی امتیاز (سکه)</h2>
                            <div className="text-3xl font-black mt-2 mb-1 flex items-baseline gap-1">
                                {points?.toLocaleString()} <span className="text-sm font-normal text-amber-200">امتیاز</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Forms Section */}
                <div className="md:col-span-2 space-y-6">
                    {/* Charge Form */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <WalletIcon size={20} className="text-primary-500"/> افزایش موجودی با کارت بانکی
                        </h3>
                        <form onSubmit={submitCharge} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                            <div className="flex-1 w-full relative">
                                <label className="block text-sm text-gray-500 mb-1">مبلغ شارژ ({config?.currency || 'تومان'})</label>
                                <input
                                    type="number"
                                    min="1000"
                                    value={data.amount}
                                    onChange={e => setData('amount', e.target.value)}
                                    className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-left font-mono dir-ltr focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:font-sans placeholder:text-right"
                                    placeholder={`مثلاً 50,000 ${config?.currency || 'تومان'}`}
                                />
                                {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto h-12 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-md transition disabled:opacity-50"
                            >
                                پرداخت
                            </button>
                        </form>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {[10000, 50000, 100000].map(amount => (
                                <button
                                    key={amount}
                                    type="button"
                                    onClick={() => setData('amount', amount.toString())}
                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-sm rounded-lg text-gray-700 transition"
                                >
                                    {amount.toLocaleString()} {config?.currency || 'تومان'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Point Conversion Form */}
                    {config?.allow_p2w && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <ArrowDownLeft size={20} className="text-indigo-500"/> تبدیل امتیاز به وجه نقد
                        </h3>
                        <form onSubmit={submitP2w} className="flex flex-col gap-4">
                            <p className="text-sm text-gray-500">
                                ارزش هر امتیاز: <strong>{config?.rate?.toLocaleString()} {config?.currency || 'تومان'}</strong>
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end w-full">
                                <div className="flex-1 w-full relative">
                                    <label className="block text-sm text-gray-500 mb-1">تعداد امتیازی که می‌خواهید تبدیل کنید</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={points}
                                        value={p2wData.points}
                                        onChange={e => setP2wData('points', e.target.value)}
                                        className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-left font-mono dir-ltr focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:font-sans placeholder:text-right"
                                        placeholder="تعداد امتیاز"
                                    />
                                    {p2wErrors.points && <p className="text-xs text-red-500 mt-1">{p2wErrors.points}</p>}
                                    {p2wData.points && !p2wErrors.points && Number(p2wData.points) > 0 && (
                                        <p className="text-xs text-green-600 mt-1">مبلغ دریافتی: {(Number(p2wData.points) * (config?.rate || 1)).toLocaleString()} {config?.currency || 'تومان'}</p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={processingP2w || Number(p2wData.points) > points}
                                    className="w-full sm:w-auto h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition disabled:opacity-50"
                                >
                                    تبدیل
                                </button>
                            </div>
                        </form>
                    </div>
                    )}

                    {/* Point Purchase */}
                    {config?.allow_w2p && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <ArrowUpRight size={20} className="text-teal-500"/> خرید امتیاز با اعتبار کیف پول
                        </h3>
                        <form onSubmit={submitW2p} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end w-full">
                            <div className="flex-1 w-full relative">
                                <label className="block text-sm text-gray-500 mb-1">تعداد امتیاز درخواستی</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={w2pData.points}
                                    onChange={e => setW2pData('points', e.target.value)}
                                    className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-left font-mono dir-ltr focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 placeholder:font-sans placeholder:text-right"
                                    placeholder="تعداد امتیاز"
                                />
                                {w2pErrors.points && <p className="text-xs text-red-500 mt-1">{w2pErrors.points}</p>}
                                {w2pData.points && !w2pErrors.points && Number(w2pData.points) > 0 && (
                                    <p className="text-xs text-blue-600 mt-1">
                                        مبلغ پرداختی از کیف: {(Number(w2pData.points) * (config?.rate || 1)).toLocaleString()} {config?.currency || 'تومان'}
                                    </p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={processingW2p || (Number(w2pData.points) * config?.rate) > Number(wallet?.balance || 0)}
                                className="w-full sm:w-auto h-12 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition disabled:opacity-50"
                            >
                                کسر از کیف پول و تبدیل
                            </button>
                        </form>
                    </div>
                    )}

                    {/* Withdrawal Form */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <WalletIcon size={20} className="text-rose-500"/> درخواست برداشت وجه
                        </h3>
                        <form onSubmit={submitWithdraw} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-sm text-gray-500 mb-1">مبلغ برداشتی ({config?.currency || 'تومان'})</label>
                                    <input
                                        type="number"
                                        min="1000"
                                        value={withdrawData.amount}
                                        onChange={e => setWithdrawData('amount', e.target.value)}
                                        className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-left font-mono dir-ltr focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 placeholder:font-sans placeholder:text-right"
                                        placeholder={`حداقل 1000 ${config?.currency || 'تومان'}`}
                                    />
                                    {withdrawErrors.amount && <p className="text-xs text-red-500 mt-1">{withdrawErrors.amount}</p>}
                                </div>
                                <div className="relative">
                                    <label className="block text-sm text-gray-500 mb-1">نام بانک</label>
                                    <input
                                        type="text"
                                        value={withdrawData.bank_name}
                                        onChange={e => setWithdrawData('bank_name', e.target.value)}
                                        className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                        placeholder="مانند: ملی، ملت..."
                                    />
                                    {withdrawErrors.bank_name && <p className="text-xs text-red-500 mt-1">{withdrawErrors.bank_name}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-sm text-gray-500 mb-1">شماره کارت (۱۶ رقم)</label>
                                    <input
                                        type="text"
                                        maxLength={16}
                                        value={withdrawData.card_number}
                                        onChange={e => setWithdrawData('card_number', e.target.value)}
                                        className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-left font-mono dir-ltr focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 placeholder:font-sans placeholder:text-right"
                                        placeholder="1234567812345678"
                                    />
                                    {withdrawErrors.card_number && <p className="text-xs text-red-500 mt-1">{withdrawErrors.card_number}</p>}
                                </div>
                                <div className="relative">
                                    <label className="block text-sm text-gray-500 mb-1">نام دارنده حساب</label>
                                    <input
                                        type="text"
                                        value={withdrawData.account_holder}
                                        onChange={e => setWithdrawData('account_holder', e.target.value)}
                                        className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                        placeholder="نام و نام خانوادگی..."
                                    />
                                    {withdrawErrors.account_holder && <p className="text-xs text-red-500 mt-1">{withdrawErrors.account_holder}</p>}
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-sm text-gray-500 mb-1">شماره شبا (اختیاری)</label>
                                <input
                                    type="text"
                                    value={withdrawData.iban_number}
                                    onChange={e => setWithdrawData('iban_number', e.target.value)}
                                    className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-left font-mono dir-ltr focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 placeholder:font-sans placeholder:text-right"
                                    placeholder="IR1234..."
                                />
                                {withdrawErrors.iban_number && <p className="text-xs text-red-500 mt-1">{withdrawErrors.iban_number}</p>}
                            </div>
                            <div className="text-left mt-2">
                                <button
                                    type="submit"
                                    disabled={processingWithdraw || Number(withdrawData.amount) > Number(wallet?.balance || 0)}
                                    className="w-full sm:w-auto h-12 px-8 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md transition disabled:opacity-50"
                                >
                                    ثبت درخواست برداشت
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                    <h3 className="font-bold text-gray-800">تاریخچه تراکنش‌ها</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">شرح تراکنش</th>
                                <th className="px-6 py-4 font-medium">مبلغ (تومان)</th>
                                <th className="px-6 py-4 font-medium">نوع</th>
                                <th className="px-6 py-4 font-medium">کد پیگیری</th>
                                <th className="px-6 py-4 font-medium">وضعیت</th>
                                <th className="px-6 py-4 font-medium">تاریخ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.data.length > 0 ? (
                                transactions.data.map((tx: any) => (
                                    <tr key={tx.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4 text-gray-800">{tx.description}</td>
                                        <td className="px-6 py-4 font-bold font-mono dir-ltr text-left">
                                            {Number(tx.amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getTypeIcon(tx.type)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{tx.reference_id || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1 text-xs">
                                                {getStatusIcon(tx.status)}
                                                {getStatusText(tx.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            {new Date(tx.created_at).toLocaleDateString('fa-IR')}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        هیچ تراکنشی یافت نشد.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {transactions.data.length > 0 && (
                <div className="mt-6 flex justify-center">
                    <Pagination links={transactions.links} />
                </div>
            )}
        </DashboardLayout>
    );
}
