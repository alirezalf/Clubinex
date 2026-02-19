import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import clsx from 'clsx';

export type ToastType = 'success' | 'error';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
    const [progress, setProgress] = useState(100);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const interval = 100; // Update every 100ms
        const step = 100 / (duration / interval);

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    handleClose();
                    return 0;
                }
                return prev - step;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [duration]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300); // Wait for exit animation
    };

    const isSuccess = type === 'success';

    return (
        <div 
            className={clsx(
                "relative overflow-hidden w-full max-w-sm bg-white rounded-xl shadow-2xl border-r-4 transition-all duration-300 transform mb-3 pointer-events-auto",
                isSuccess ? "border-green-500" : "border-red-500",
                isClosing ? "opacity-0 translate-y-4 scale-95" : "opacity-100 translate-y-0 scale-100 animate-in slide-in-from-bottom-4 fade-in"
            )}
            role="alert"
        >
            <div className="p-4 flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                    {isSuccess ? (
                        <CheckCircle className="text-green-500" size={24} />
                    ) : (
                        <XCircle className="text-red-500" size={24} />
                    )}
                </div>
                <div className="flex-1 pt-0.5">
                    <h4 className="font-bold text-gray-800 text-sm mb-1">
                        {isSuccess ? 'عملیات موفق' : 'خطا'}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {message}
                    </p>
                </div>
                <button 
                    onClick={handleClose} 
                    className="text-gray-400 hover:text-gray-600 transition p-1"
                >
                    <X size={16} />
                </button>
            </div>
            
            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100" dir="ltr">
                <div 
                    className={clsx("h-full transition-all ease-linear", isSuccess ? "bg-green-500" : "bg-red-500")} 
                    style={{ width: `${progress}%`, transitionDuration: '100ms' }}
                />
            </div>
        </div>
    );
}