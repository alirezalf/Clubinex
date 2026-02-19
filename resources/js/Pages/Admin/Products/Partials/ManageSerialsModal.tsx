import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, RefreshCw, Loader2, Sparkles, Copy, Settings } from 'lucide-react';
import axios from 'axios';
import { useForm } from '@inertiajs/react';

export default function ManageSerialsModal({ isOpen, onClose, productId, productTitle, modelName }: any) {
    if (!isOpen) return null;

    const [activeTab, setActiveTab] = useState<'manual' | 'generate'>('manual');
    const [serials, setSerials] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    // فرم افزودن تکی
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        serial_code: ''
    });

    // فرم تولید انبوه
    const { data: genData, setData: setGenData, post: postGen, processing: genProcessing, reset: resetGen, errors: genErrors } = useForm({
        count: 10
    });

    const fetchSerials = async (pageNum = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(route('admin.products.serials.index', productId), {
                params: { page: pageNum }
            });
            setSerials(response.data.data);
            setPage(response.data.current_page);
            setLastPage(response.data.last_page);
        } catch (error) {
            console.error("Error fetching serials:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) {
            fetchSerials(1);
            reset();
            resetGen();
            clearErrors();
        }
    }, [productId, isOpen]);

    // پیشنهاد کد تصادفی سمت کلاینت
    const generateSuggestion = () => {
        const prefix = modelName ? modelName.replace(/[^A-Za-z0-9]/g, '').toUpperCase().substring(0, 8) : 'PROD';
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        const random2 = Math.random().toString(36).substring(2, 8).toUpperCase();
        setData('serial_code', `${prefix}-${random}-${random2}`);
    };

    const handleAddSerial = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.products.serials.store', productId), {
            onSuccess: () => {
                reset();
                fetchSerials(1); // رفرش لیست
            },
            preserveScroll: true
        });
    };

    // تولید انبوه سریال بدون پرسش تایید
    const handleGenerateSerials = (e: React.FormEvent) => {
        e.preventDefault();
        
        postGen(route('admin.products.serials.generate', productId), {
            onSuccess: () => {
                resetGen();
                fetchSerials(1); // دریافت لیست جدید
                setActiveTab('manual'); // بازگشت خودکار به تب لیست
            },
            preserveScroll: true
        });
    };

    const handleDeleteSerial = (id: number) => {
        if(confirm('آیا از حذف این سریال اطمینان دارید؟')) {
            axios.delete(route('admin.products.serials.destroy', id))
                .then(() => {
                    fetchSerials(page);
                })
                .catch(err => {
                    alert(err.response?.data?.message || 'خطا در حذف');
                });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
                
                {/* هدر مودال */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">مدیریت سریال‌ها</h3>
                        <p className="text-xs text-gray-500 mt-1">{productTitle}</p>
                    </div>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-gray-600" /></button>
                </div>

                {/* تب‌ها */}
                <div className="flex border-b border-gray-100 px-5 pt-2">
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === 'manual' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        لیست سریال‌ها / افزودن دستی
                    </button>
                    <button
                        onClick={() => setActiveTab('generate')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 ${activeTab === 'generate' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Sparkles size={16} />
                        تولید خودکار (Bulk)
                    </button>
                </div>

                {/* محتوا */}
                <div className="flex-1 overflow-y-auto">
                    
                    {activeTab === 'manual' && (
                        <>
                            {/* فرم افزودن دستی */}
                            <div className="p-5 bg-gray-50/50 border-b border-gray-100">
                                <form onSubmit={handleAddSerial} className="flex gap-3 items-start">
                                    <div className="flex-1 relative">
                                        <input 
                                            type="text" 
                                            value={data.serial_code}
                                            onChange={e => setData('serial_code', e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 pr-10"
                                            placeholder="کد سریال را وارد کنید..."
                                        />
                                        <button 
                                            type="button"
                                            onClick={generateSuggestion}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 p-1"
                                            title="پیشنهاد کد تصادفی"
                                        >
                                            <RefreshCw size={14} />
                                        </button>
                                        {errors.serial_code && <p className="text-red-500 text-xs mt-1">{errors.serial_code}</p>}
                                    </div>
                                    <button 
                                        disabled={processing}
                                        className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 flex items-center gap-2 shadow-sm"
                                    >
                                        {processing ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                        افزودن
                                    </button>
                                </form>
                            </div>

                            {/* جدول لیست سریال‌ها */}
                            <table className="w-full text-sm text-right">
                                <thead className="bg-gray-50 text-gray-500 sticky top-0">
                                    <tr>
                                        <th className="px-5 py-3">کد سریال</th>
                                        <th className="px-5 py-3">وضعیت</th>
                                        <th className="px-5 py-3">استفاده کننده</th>
                                        <th className="px-5 py-3">تاریخ استفاده</th>
                                        <th className="px-5 py-3">عملیات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-8 text-gray-400">
                                                <Loader2 className="animate-spin mx-auto mb-2" />
                                                در حال بارگذاری...
                                            </td>
                                        </tr>
                                    ) : serials.length > 0 ? (
                                        serials.map((serial) => (
                                            <tr key={serial.id} className="hover:bg-gray-50 transition">
                                                <td className="px-5 py-3 font-mono text-gray-700 select-all">{serial.serial_code}</td>
                                                <td className="px-5 py-3">
                                                    {serial.is_used ? (
                                                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">استفاده شده</span>
                                                    ) : (
                                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">آزاد</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3 text-xs">
                                                    {serial.user ? `${serial.user.first_name} ${serial.user.last_name} (${serial.user.mobile})` : '-'}
                                                </td>
                                                <td className="px-5 py-3 text-xs text-gray-500 dir-ltr text-right">
                                                    {serial.used_at_jalali || '-'}
                                                </td>
                                                <td className="px-5 py-3">
                                                    {!serial.is_used && (
                                                        <button 
                                                            onClick={() => handleDeleteSerial(serial.id)}
                                                            className="text-red-500 hover:bg-red-50 p-1.5 rounded transition"
                                                            title="حذف"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-8 text-gray-400">هیچ سریالی یافت نشد.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}

                    {activeTab === 'generate' && (
                        <div className="p-8">
                            <div className="max-w-sm mx-auto bg-purple-50 rounded-2xl p-6 border border-purple-100 text-center">
                                <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-purple-600">
                                    <Settings size={28} />
                                </div>
                                <h4 className="font-bold text-lg text-purple-900 mb-2">تولید انبوه سریال</h4>
                                <p className="text-sm text-purple-700 mb-6 leading-relaxed">
                                    این ابزار سریال‌های یکتا و غیرقابل حدس را بر اساس نام مدل "<b>{modelName}</b>" تولید می‌کند.
                                </p>
                                
                                <form onSubmit={handleGenerateSerials} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">تعداد سریال</label>
                                        <input 
                                            type="number" 
                                            value={genData.count} 
                                            onChange={e => setGenData('count', parseInt(e.target.value))}
                                            min={1} 
                                            max={1000}
                                            className="w-full text-center border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 text-lg font-bold"
                                        />
                                        {genErrors.count && <p className="text-red-500 text-xs mt-1">{genErrors.count}</p>}
                                    </div>
                                    
                                    <div className="bg-white p-3 rounded-lg border border-purple-100 text-xs text-gray-500 font-mono">
                                        فرمت نمونه: {modelName ? modelName.substring(0,4).toUpperCase() : 'PROD'}-X7B9-K2M1-9L0P
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={genProcessing}
                                        className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-500/20 transition flex items-center justify-center gap-2"
                                    >
                                        {genProcessing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                        تولید کن
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

                {/* صفحه‌بندی (فقط برای تب دستی/لیست) */}
                {activeTab === 'manual' && lastPage > 1 && (
                    <div className="p-3 border-t border-gray-100 flex justify-center gap-2 bg-gray-50">
                        <button 
                            onClick={() => fetchSerials(page - 1)}
                            disabled={page === 1 || loading}
                            className="px-3 py-1 bg-white border rounded disabled:opacity-50 text-xs"
                        >
                            قبلی
                        </button>
                        <span className="text-xs self-center">صفحه {page} از {lastPage}</span>
                        <button 
                            onClick={() => fetchSerials(page + 1)}
                            disabled={page === lastPage || loading}
                            className="px-3 py-1 bg-white border rounded disabled:opacity-50 text-xs"
                        >
                            بعدی
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}