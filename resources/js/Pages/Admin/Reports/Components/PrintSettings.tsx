import React from 'react';
import { X, Check, Printer } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    options: {
        charts: boolean;
        questions: boolean;
        participants: boolean;
    };
    setOptions: (options: any) => void;
}

export default function PrintSettingsModal({ isOpen, onClose, options, setOptions }: Props) {
    if (!isOpen) return null;

    const toggle = (key: string) => {
        setOptions({ ...options, [key]: !options[key as keyof typeof options] });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 no-print">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Printer size={18} className="text-gray-500" />
                        تنظیمات چاپ گزارش
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-lg transition"><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
                </div>
                
                <div className="p-5 space-y-3">
                    <p className="text-sm text-gray-500 mb-4 bg-blue-50 p-3 rounded-lg text-blue-700 text-xs leading-relaxed">
                        بخش‌هایی که می‌خواهید در نسخه چاپی (یا PDF) نمایش داده شوند را انتخاب کنید:
                    </p>
                    
                    <label className="flex items-center justify-between p-3 rounded-xl border cursor-pointer hover:bg-gray-50 transition border-gray-200">
                        <span className="font-medium text-gray-700 text-sm">نمودارها و آمار کلی</span>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${options.charts ? 'bg-primary-600 border-primary-600' : 'border-gray-300 bg-white'}`}>
                            {options.charts && <Check size={14} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={options.charts} onChange={() => toggle('charts')} />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border cursor-pointer hover:bg-gray-50 transition border-gray-200">
                        <span className="font-medium text-gray-700 text-sm">تحلیل سوالات (همراه با جزئیات)</span>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${options.questions ? 'bg-primary-600 border-primary-600' : 'border-gray-300 bg-white'}`}>
                            {options.questions && <Check size={14} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={options.questions} onChange={() => toggle('questions')} />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border cursor-pointer hover:bg-gray-50 transition border-gray-200">
                        <span className="font-medium text-gray-700 text-sm">لیست شرکت‌کنندگان</span>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${options.participants ? 'bg-primary-600 border-primary-600' : 'border-gray-300 bg-white'}`}>
                            {options.participants && <Check size={14} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={options.participants} onChange={() => toggle('participants')} />
                    </label>
                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="bg-primary-600 text-white px-6 py-2.5 rounded-xl hover:bg-primary-700 font-bold shadow-md shadow-primary-500/20 transition text-sm">
                        تایید و ادامه
                    </button>
                </div>
            </div>
        </div>
    );
}