import React from 'react';
import { Search, Filter, Download } from 'lucide-react';
import PersianDatePicker from '@/Components/PersianDatePicker';

interface Props {
    params: any;
    setParams: (params: any) => void;
    currentTab: string;
    onApply: () => void;
    onTypeChange?: (type: string) => void; // New prop for immediate change
}

export default function ReportFilters({ params, setParams, currentTab, onApply, onTypeChange }: Props) {
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') onApply();
    };

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2">
                <label className="text-xs font-bold text-gray-500 mb-1 block">جستجو</label>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="نام، موبایل، سریال، توضیحات..." 
                        value={params.search}
                        onChange={e => setParams({...params, search: e.target.value})}
                        onKeyDown={handleKeyDown}
                        className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                    <Search size={16} className="absolute right-3 top-3 text-gray-400" />
                </div>
            </div>

            <div>
                <PersianDatePicker 
                    label="از تاریخ"
                    value={params.date_from}
                    onChange={(date) => setParams({...params, date_from: date})}
                    placeholder="انتخاب تاریخ"
                />
            </div>

            <div>
                <PersianDatePicker 
                    label="تا تاریخ"
                    value={params.date_to}
                    onChange={(date) => setParams({...params, date_to: date})}
                    placeholder="انتخاب تاریخ"
                />
            </div>

            {currentTab === 'transactions' && (
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">نوع تراکنش</label>
                    <select 
                        value={params.type}
                        onChange={e => setParams({...params, type: e.target.value})}
                        className="w-full py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm"
                    >
                        <option value="all">همه</option>
                        <option value="earn">کسب امتیاز</option>
                        <option value="spend">خرج امتیاز</option>
                        <option value="adjust">تعدیل دستی</option>
                    </select>
                </div>
            )}

            {currentTab === 'redemptions' && (
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">وضعیت سفارش</label>
                    <select 
                        value={params.status}
                        onChange={e => setParams({...params, status: e.target.value})}
                        className="w-full py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm"
                    >
                        <option value="all">همه</option>
                        <option value="pending">در انتظار</option>
                        <option value="completed">تکمیل شده</option>
                        <option value="rejected">رد شده</option>
                    </select>
                </div>
            )}

            {currentTab === 'products' && (
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">نوع گزارش محصول</label>
                    <select 
                        value={params.type}
                        onChange={e => {
                            const val = e.target.value;
                            setParams({...params, type: val, search: ''});
                            if (onTypeChange) onTypeChange(val); // Trigger immediate reload
                        }} 
                        className="w-full py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm bg-blue-50 text-blue-900 font-bold"
                    >
                        <option value="inventory">موجودی کالا (آمار کلی)</option>
                        <option value="serials">سریال‌های سیستم (System)</option>
                        <option value="registrations">درخواست‌های ثبت (User)</option>
                    </select>
                </div>
            )}

            <div className="flex gap-2">
                <button 
                    onClick={onApply}
                    className="flex-1 bg-primary-600 text-white py-2 rounded-xl hover:bg-primary-700 transition flex justify-center items-center gap-2 text-sm font-bold shadow-lg shadow-primary-500/20 h-[42px]"
                >
                    <Filter size={16} />
                    اعمال
                </button>
                <a 
                    href={route('admin.reports.export', params)}
                    className="bg-gray-100 text-gray-600 p-2 rounded-xl hover:bg-gray-200 transition flex justify-center items-center border border-gray-200 h-[42px] w-[42px]"
                    title="دانلود خروجی اکسل"
                >
                    <Download size={18} />
                </a>
            </div>
        </div>
    );
}