import React, { useState } from 'react';
import { Settings, ListOrdered, ArrowUpAZ, ArrowDownAZ, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

interface PrintConfig {
    title: string;
    companyName: string;
    footerText: string;
    rowsPerPage: number;
    showDate: boolean;
    showPageNum: boolean;
    showLogo: boolean;
}

interface Props {
    showRowNumber: boolean;
    setShowRowNumber: (val: boolean) => void;
    sortDir: 'asc' | 'desc';
    setSortDir: (val: 'asc' | 'desc') => void;
    printConfig: PrintConfig;
    setPrintConfig: (val: PrintConfig) => void;
}

export default function ReportSettings({ 
    showRowNumber, setShowRowNumber, 
    sortDir, setSortDir, 
    printConfig, setPrintConfig 
}: Props) {
    
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div 
                className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer select-none border-b border-gray-100"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Settings size={18} className="text-primary-500" />
                    <span>تنظیمات نمایش و چاپ</span>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </div>

            <div className={clsx(
                "transition-all duration-300 ease-in-out overflow-hidden bg-white",
                isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            )}>
                <div className="p-4 flex flex-col gap-4">
                    {/* Row Number Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div className={clsx(
                            "w-10 h-5 rounded-full relative transition-colors",
                            showRowNumber ? "bg-primary-500" : "bg-gray-200"
                        )}>
                            <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={showRowNumber} 
                                onChange={(e) => setShowRowNumber(e.target.checked)} 
                            />
                            <div className={clsx(
                                "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                                showRowNumber ? "left-0.5" : "right-0.5" // RTL Switch logic
                            )}></div>
                        </div>
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                            <ListOrdered size={14} /> نمایش شماره ردیف
                        </span>
                    </label>

                    {/* Sort Order */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setSortDir('desc')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition",
                                sortDir === 'desc' ? "bg-white text-primary-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                            title="جدیدترین به قدیمی‌ترین"
                        >
                            <ArrowDownAZ size={14} /> جدید
                        </button>
                        <button 
                            onClick={() => setSortDir('asc')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition",
                                sortDir === 'asc' ? "bg-white text-primary-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                            title="قدیمی‌ترین به جدیدترین"
                        >
                            <ArrowUpAZ size={14} /> قدیم
                        </button>
                    </div>

                    {/* Print Settings Section */}
                    <div className="space-y-3 pt-2 border-t">
                        <div className="text-xs font-bold text-gray-500 flex items-center gap-1 mb-1">
                            <Printer size={12} /> تنظیمات چاپ
                        </div>
                        
                        {/* Title */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">عنوان گزارش</label>
                            <input 
                                type="text" 
                                value={printConfig.title} 
                                onChange={(e) => setPrintConfig({...printConfig, title: e.target.value})}
                                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:border-primary-500 focus:ring-0 placeholder-gray-300"
                                placeholder="مثلاً: گزارش فروش ماهانه"
                            />
                        </div>

                        {/* Company Name */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">نام سازمان / شرکت</label>
                            <input 
                                type="text" 
                                value={printConfig.companyName} 
                                onChange={(e) => setPrintConfig({...printConfig, companyName: e.target.value})}
                                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:border-primary-500 focus:ring-0 placeholder-gray-300"
                                placeholder="نام شرکت..."
                            />
                        </div>

                        {/* Footer Text */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">متن فوتر (پایین صفحه)</label>
                            <input 
                                type="text" 
                                value={printConfig.footerText} 
                                onChange={(e) => setPrintConfig({...printConfig, footerText: e.target.value})}
                                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:border-primary-500 focus:ring-0 placeholder-gray-300"
                                placeholder="متنی برای نمایش در پایین تمام صفحات"
                            />
                        </div>

                        {/* Rows Per Page */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">تعداد ردیف در هر صفحه:</span>
                            <input 
                                type="number" 
                                min="1"
                                max="100"
                                value={printConfig.rowsPerPage} 
                                onChange={(e) => setPrintConfig({...printConfig, rowsPerPage: parseInt(e.target.value) || 20})}
                                className="w-16 text-xs border border-gray-200 rounded-lg px-2 py-1 focus:border-primary-500 focus:ring-0 text-center"
                            />
                        </div>

                        {/* Toggles */}
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <label className="flex items-center gap-1 cursor-pointer text-xs text-gray-600">
                                <input type="checkbox" checked={printConfig.showDate} onChange={e => setPrintConfig({...printConfig, showDate: e.target.checked})} className="rounded text-primary-500 focus:ring-0 w-3 h-3" />
                                نمایش تاریخ
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer text-xs text-gray-600">
                                <input type="checkbox" checked={printConfig.showPageNum} onChange={e => setPrintConfig({...printConfig, showPageNum: e.target.checked})} className="rounded text-primary-500 focus:ring-0 w-3 h-3" />
                                شماره صفحه
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer text-xs text-gray-600">
                                <input type="checkbox" checked={printConfig.showLogo} onChange={e => setPrintConfig({...printConfig, showLogo: e.target.checked})} className="rounded text-primary-500 focus:ring-0 w-3 h-3" />
                                نمایش لوگو
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}