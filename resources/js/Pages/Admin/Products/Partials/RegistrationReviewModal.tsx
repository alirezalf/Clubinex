import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { X, CheckCircle, XCircle, Loader2, ZoomIn, FileText, User } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    registration: any;
}

export default function RegistrationReviewModal({ isOpen, onClose, registration }: Props) {
    if (!isOpen || !registration) return null;

    const [isZoomed, setIsZoomed] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        status: '',
        admin_note: ''
    });

    const handleSubmit = (status: 'approved' | 'rejected') => {
        if (status === 'rejected' && !data.admin_note) {
            alert('لطفاً دلیل رد درخواست را در یادداشت بنویسید.');
            return;
        }

        if (confirm(status === 'approved' ? 'آیا از تایید این درخواست اطمینان دارید؟ امتیاز به کاربر داده می‌شود.' : 'آیا از رد این درخواست اطمینان دارید؟')) {
            data.status = status; 
            post(route('admin.products.registration_status', registration.id), {
                onSuccess: () => {
                    onClose();
                    reset();
                }
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                    <h3 className="font-bold text-lg text-gray-800">بررسی درخواست ثبت محصول #{registration.id}</h3>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-gray-600" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-0">
                    <div className="flex flex-col lg:flex-row h-full">
                        
                        {/* Left Column: Image Viewer */}
                        <div className="lg:w-1/2 bg-gray-100 p-6 flex flex-col justify-center border-r border-gray-200">
                            <div className="relative group rounded-xl overflow-hidden shadow-sm bg-white flex items-center justify-center h-full max-h-[500px]">
                                {registration.invoice_image ? (
                                    <div className="relative w-full h-full flex items-center justify-center p-2">
                                        <img 
                                            src={registration.invoice_image} 
                                            alt="Invoice" 
                                            className={`max-w-full max-h-full object-contain transition-transform duration-300 ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
                                            onClick={() => setIsZoomed(!isZoomed)}
                                        />
                                        {!isZoomed && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                                                    <ZoomIn size={14} /> کلیک برای بزرگنمایی
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-gray-400 text-sm flex flex-col items-center">
                                        <FileText size={48} className="mb-2 opacity-20" />
                                        تصویر فاکتور آپلود نشده است
                                    </div>
                                )}
                            </div>
                            
                            {registration.product_image && (
                                <div className="mt-4 flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm">
                                     <span className="text-xs font-bold text-gray-600 whitespace-nowrap">تصویر محصول:</span>
                                     <a href={registration.product_image} target="_blank" className="block w-16 h-16 rounded-lg border overflow-hidden hover:opacity-80 transition shrink-0">
                                         <img src={registration.product_image} className="w-full h-full object-cover" />
                                     </a>
                                     <span className="text-[10px] text-gray-400">برای مشاهده کلیک کنید</span>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Details & Action */}
                        <div className="lg:w-1/2 p-6 overflow-y-auto">
                            <div className="space-y-6">
                                {/* User Info */}
                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                    <h4 className="font-bold text-blue-800 text-sm mb-3 flex items-center gap-2 border-b border-blue-200/50 pb-2">
                                        <User size={16} /> اطلاعات کاربر
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex flex-col"><span className="text-[10px] text-gray-500">نام:</span> <span className="font-medium text-gray-800">{registration.user.first_name} {registration.user.last_name}</span></div>
                                        <div className="flex flex-col"><span className="text-[10px] text-gray-500">موبایل:</span> <span className="font-mono text-gray-800">{registration.user.mobile}</span></div>
                                        <div className="flex flex-col col-span-2"><span className="text-[10px] text-gray-500">نقش:</span> <span className="font-medium text-gray-800">{registration.customer_type === 'owner' ? 'مصرف کننده نهایی' : 'واسطه / دیگر'}</span></div>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="border border-gray-200 rounded-xl p-4">
                                    <h4 className="font-bold text-gray-800 text-sm mb-3 border-b border-gray-100 pb-2">اطلاعات محصول</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="text-gray-500">نام کالا:</span> <span className="font-medium">{registration.product_name}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">مدل:</span> <span className="font-medium">{registration.product_model}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">برند:</span> <span className="font-medium">{registration.product_brand || '-'}</span></div>
                                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-50">
                                            <span className="text-gray-500">سریال:</span> 
                                            <span className="font-mono bg-yellow-50 px-3 py-1 rounded text-yellow-800 font-bold border border-yellow-100 tracking-wider select-all">{registration.serial_code}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Form */}
                                {registration.status === 'pending' ? (
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">یادداشت مدیر</label>
                                        <textarea 
                                            value={data.admin_note}
                                            onChange={e => setData('admin_note', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 min-h-[80px]"
                                            placeholder="توضیحات تایید یا دلیل رد درخواست..."
                                        ></textarea>
                                        
                                        <div className="flex gap-3 mt-4">
                                            <button 
                                                onClick={() => handleSubmit('rejected')}
                                                disabled={processing}
                                                className="flex-1 bg-white text-red-600 border border-red-200 py-2.5 rounded-lg hover:bg-red-50 transition flex justify-center items-center gap-2 font-bold text-sm"
                                            >
                                                <XCircle size={18} />
                                                رد درخواست
                                            </button>
                                            <button 
                                                onClick={() => handleSubmit('approved')}
                                                disabled={processing}
                                                className="flex-[2] bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition flex justify-center items-center gap-2 font-bold text-sm shadow-lg shadow-green-500/20"
                                            >
                                                {processing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                                تایید و اعطای امتیاز
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`p-4 rounded-xl border text-center ${registration.status === 'approved' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                        <div className="font-bold text-lg mb-1">{registration.status_farsi}</div>
                                        <div className="text-xs opacity-80 mb-2">
                                            توسط {registration.admin?.first_name} {registration.admin?.last_name}
                                        </div>
                                        {registration.admin_note && (
                                            <div className="text-sm bg-white/60 p-3 rounded-lg border border-black/5 text-right text-gray-800">
                                                <span className="font-bold block text-xs mb-1 opacity-70">یادداشت:</span> 
                                                {registration.admin_note}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}