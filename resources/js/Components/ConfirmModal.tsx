import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    processing?: boolean;
}

export default function ConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = 'بله، اطمینان دارم', 
    cancelText = 'انصراف',
    type = 'danger',
    processing = false
}: Props) {
    if (!isOpen) return null;

    const colors = {
        danger: { bg: 'bg-red-50', icon: 'text-red-600', btn: 'bg-red-600 hover:bg-red-700' },
        warning: { bg: 'bg-amber-50', icon: 'text-amber-600', btn: 'bg-amber-600 hover:bg-amber-700' },
        info: { bg: 'bg-blue-50', icon: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700' },
    };

    const currentStyle = colors[type];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className={`w-16 h-16 ${currentStyle.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <AlertTriangle size={32} className={currentStyle.icon} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button 
                        onClick={onClose}
                        disabled={processing}
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold text-sm transition disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={onConfirm}
                        disabled={processing}
                        className={`flex-1 px-4 py-2.5 text-white rounded-xl font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-70 ${currentStyle.btn}`}
                    >
                        {processing ? <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></span> : null}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}