import React, { useState, useRef, useEffect } from 'react';
import { X, RefreshCw, Loader2, StopCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { router } from '@inertiajs/react';

export default function WpCategorySyncModal({ isOpen, onClose }: any) {
    if (!isOpen) return null;

    const [loadingWpSchema, setLoadingWpSchema] = useState(false);
    const [wpFields, setWpFields] = useState<string[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);
    const [syncStats, setSyncStats] = useState({ created: 0, updated: 0, total: 0, current_page: 0 });
    const stopSyncRef = useRef(false);

    // اضافه کردن wp_id و parent_id به استیت پیش‌فرض
    const [mapping, setMapping] = useState({
        wp_id: 'id',
        title: 'name', 
        slug: 'slug',
        parent_id: 'parent',
        image: 'image.src'
    });

    // اضافه کردن فیلدها به لیست نمایش
    const clubinexFields = [
        { key: 'wp_id', label: 'شناسه وردپرس (WP ID)', required: true, description: 'شناسه یکتا در سیستم وردپرس' },
        { key: 'title', label: 'عنوان دسته‌بندی', required: true, description: 'نام نمایشی دسته' },
        { key: 'slug', label: 'نامک (Slug)', required: false, description: 'آدرس URL یکتا' },
        { key: 'parent_id', label: 'شناسه والد (Parent ID)', required: false, description: 'جهت ساختار درختی (زیرمجموعه)' },
        { key: 'image', label: 'آیکون/تصویر', required: false, description: 'تصویر شاخص دسته‌بندی' },
    ];

    useEffect(() => {
        const fetchSchema = async () => {
            setLoadingWpSchema(true);
            try {
                const res = await axios.post(route('admin.categories.wp_schema'));
                setWpFields(res.data.keys);
            } catch (err) {
                alert('خطا در اتصال به وردپرس.');
                onClose();
            } finally {
                setLoadingWpSchema(false);
            }
        };
        fetchSchema();
    }, []);

    const startSyncProcess = async () => {
        if (!mapping.title || !mapping.wp_id) {
            alert('انتخاب فیلد عنوان و شناسه وردپرس الزامی است.');
            return;
        }

        setIsSyncing(true);
        stopSyncRef.current = false;
        let page = 1;
        let finished = false;
        
        let currentStats = { created: 0, updated: 0, total: 0, current_page: 0 };
        setSyncStats(currentStats);
        setSyncProgress(5); 

        try {
            while (!finished && !stopSyncRef.current) {
                const response = await axios.post(route('admin.categories.wp_sync_mapped'), { 
                    mapping, 
                    page 
                });

                const resData = response.data;
                
                if (resData.success) {
                    currentStats.created += resData.processed_created;
                    currentStats.updated += resData.processed_updated;
                    currentStats.total = resData.total_remote;
                    currentStats.current_page = page;
                    
                    setSyncStats({...currentStats});
                    
                    const processedSoFar = page * 50; 
                    const percent = Math.min(Math.round((processedSoFar / Math.max(resData.total_remote, 1)) * 100), 95);
                    setSyncProgress(percent);

                    finished = resData.finished;
                    page = resData.next_page;
                } else {
                    alert('خطا در همگام‌سازی: ' + resData.message);
                    finished = true;
                }
            }
            
            if (!stopSyncRef.current) {
                setSyncProgress(100);
                setTimeout(() => {
                    alert('عملیات با موفقیت پایان یافت.');
                    router.reload(); 
                    onClose();
                }, 500);
            }

        } catch (error: any) {
            alert('خطا در ارتباط با سرور: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSyncing(false);
        }
    };

    const stopSync = () => {
        stopSyncRef.current = true;
        setIsSyncing(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <RefreshCw size={20} className="text-blue-600" />
                        همگام‌سازی دسته‌بندی‌های وردپرس
                    </h3>
                    {!isSyncing && (
                        <button onClick={onClose}><X className="text-gray-400 hover:text-gray-600" /></button>
                    )}
                </div>
                
                <div className="p-6 overflow-y-auto flex-1">
                    {loadingWpSchema ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
                            <p className="font-medium">در حال دریافت فیلدها از وردپرس...</p>
                        </div>
                    ) : isSyncing ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-6">
                            <div className="w-full max-w-md space-y-2">
                                <div className="flex justify-between text-sm font-bold text-gray-700">
                                    <span>پیشرفت عملیات</span>
                                    <span>{syncProgress}%</span>
                                </div>
                                <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all duration-500 ease-out" style={{ width: `${syncProgress}%` }}></div>
                                </div>
                                <p className="text-center text-xs text-gray-500 mt-2">لطفاً صفحه را نبندید.</p>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 w-full max-w-lg text-center">
                                <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                                    <div className="text-2xl font-bold text-green-600">{syncStats.created}</div>
                                    <div className="text-xs text-green-800">ایجاد شده</div>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                    <div className="text-2xl font-bold text-blue-600">{syncStats.updated}</div>
                                    <div className="text-xs text-blue-800">بروزرسانی شده</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="text-2xl font-bold text-gray-600">{syncStats.current_page}</div>
                                    <div className="text-xs text-gray-800">صفحه فعلی</div>
                                </div>
                            </div>

                            <button 
                                onClick={stopSync}
                                className="bg-red-50 text-red-600 px-6 py-2 rounded-xl hover:bg-red-100 flex items-center gap-2 border border-red-200 transition"
                            >
                                <StopCircle size={18} />
                                لغو عملیات
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                                <div className="bg-white p-2 rounded-lg text-blue-600 shadow-sm"><RefreshCw size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-blue-800 text-sm">راهنمای تطبیق فیلدها</h4>
                                    <p className="text-xs text-blue-600 mt-1 leading-relaxed">
                                        برای انتقال صحیح اطلاعات، مشخص کنید هر فیلد از <b>وردپرس (ستون راست)</b> باید در کدام فیلد <b>کلابینکس (ستون چپ)</b> قرار بگیرد.
                                    </p>
                                </div>
                            </div>

                            <div className="border rounded-xl overflow-hidden">
                                <div className="grid grid-cols-12 bg-gray-50 border-b p-3 text-sm font-bold text-gray-600">
                                    <div className="col-span-5 text-center">فیلد در وردپرس (منبع)</div>
                                    <div className="col-span-2 text-center"></div>
                                    <div className="col-span-5 text-center">فیلد در کلابینکس (مقصد)</div>
                                </div>

                                <div className="divide-y">
                                    {clubinexFields.map((field) => (
                                        <div key={field.key} className="grid grid-cols-12 p-4 items-center hover:bg-gray-50 transition">
                                            
                                            {/* WP Select (Source) */}
                                            <div className="col-span-5">
                                                <select 
                                                    value={(mapping as any)[field.key]}
                                                    onChange={(e) => setMapping({...mapping, [field.key]: e.target.value})}
                                                    className="w-full border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 bg-white dir-ltr text-left"
                                                >
                                                    <option value="">-- انتخاب فیلد --</option>
                                                    {wpFields.map(f => <option key={f} value={f}>{f}</option>)}
                                                </select>
                                            </div>

                                            {/* Arrow */}
                                            <div className="col-span-2 flex justify-center text-gray-400">
                                                <ArrowLeft size={20} />
                                            </div>

                                            {/* Clubinex Label (Dest) */}
                                            <div className="col-span-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800 text-sm flex items-center gap-1">
                                                        {field.label}
                                                        {field.required && <span className="text-red-500">*</span>}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500">{field.description}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {!isSyncing && !loadingWpSchema && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-white transition font-medium"
                        >
                            انصراف
                        </button>
                        <button 
                            onClick={startSyncProcess}
                            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center gap-2 transition font-bold"
                        >
                            <RefreshCw size={18} />
                            شروع عملیات همگام‌سازی
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}