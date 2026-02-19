import React, { useState } from 'react';
import { Barcode, Search, CheckCircle, Package, AlertTriangle, Loader2 } from 'lucide-react';
import axios from 'axios';
import FormInput from '@/Components/Form/FormInput';

interface Props {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
}

export default function SimpleForm({ data, setData, errors }: Props) {
    const [loading, setLoading] = useState(false);
    const [checkResult, setCheckResult] = useState<{
        valid: boolean;
        message: string;
        product?: {
            title: string;
            model: string;
            image: string | null;
            points: number;
            category: string;
        }
    } | null>(null);

    const handleCheckSerial = async () => {
        if (!data.serial_code || data.serial_code.length < 3) {
            setCheckResult({ valid: false, message: 'لطفاً کد سریال معتبر وارد کنید.' });
            return;
        }

        setLoading(true);
        setCheckResult(null);

        try {
            const response = await axios.post(route('products.check_serial'), {
                serial_code: data.serial_code
            });
            setCheckResult(response.data);
        } catch (error: any) {
            setCheckResult({ 
                valid: false, 
                message: error.response?.data?.message || 'خطا در بررسی سریال.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-8 text-center py-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-4">
                <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm mb-2">
                    <Barcode size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">استعلام اصالت و ثبت آنی</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                    کد سریال درج شده روی بدنه محصول را وارد کنید تا سیستم به صورت خودکار محصول را شناسایی و امتیاز آن را برای شما ثبت کند.
                </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex gap-2 items-end">
                        <div className="flex-1">
                            <FormInput
                                label="کد سریال محصول"
                                value={data.serial_code}
                                onChange={e => {
                                    setData('serial_code', e.target.value);
                                    if (checkResult) setCheckResult(null); 
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCheckSerial())}
                                placeholder="SN-123456789"
                                ltr
                                className="font-mono uppercase tracking-widest text-lg"
                                error={errors.serial_code}
                            />
                        </div>
                        <button 
                            type="button"
                            onClick={handleCheckSerial}
                            disabled={loading || !data.serial_code}
                            className="bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition flex items-center justify-center shadow-lg disabled:opacity-70 disabled:cursor-not-allowed min-w-[60px] h-[46px] mb-1.5"
                            title="بررسی سریال"
                        >
                            {loading ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {checkResult && (
                <div className={`rounded-2xl p-5 border-2 animate-in zoom-in-95 duration-300 ${checkResult.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-100'}`}>
                    {checkResult.valid && checkResult.product ? (
                        <div className="flex flex-col items-center">
                            <div className="bg-white p-2 rounded-full mb-3 shadow-sm text-green-600">
                                <CheckCircle size={32} />
                            </div>
                            <h4 className="text-lg font-bold text-green-800 mb-1">محصول شناسایی شد!</h4>
                            <div className="bg-white rounded-xl p-4 w-full border border-green-100 shadow-sm flex items-center gap-4 text-right mt-3">
                                <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-gray-100">
                                    {checkResult.product.image ? (
                                        <img src={checkResult.product.image} alt={checkResult.product.title} className="w-full h-full object-contain" />
                                    ) : (
                                        <Package size={32} className="text-gray-300" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h5 className="font-bold text-gray-800 mb-1 text-sm">{checkResult.product.title}</h5>
                                    <div className="text-xs text-gray-500 font-mono mb-2">{checkResult.product.model}</div>
                                    <div className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-md">
                                        پاداش ثبت: {checkResult.product.points} امتیاز
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-4">برای دریافت امتیاز، دکمه "ثبت نهایی" را در پایین صفحه بزنید.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-red-700">
                            <AlertTriangle size={32} className="mb-2 opacity-80" />
                            <h4 className="font-bold mb-1">خطا در شناسایی</h4>
                            <p className="text-sm opacity-90">{checkResult.message}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}