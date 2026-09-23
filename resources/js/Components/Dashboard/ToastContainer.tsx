import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ToastType } from '@/Components/Toast';
import Toast from '@/Components/Toast';

interface Props {
    flash: { message: string | null; success?: string | null; error: string | null };
}

export default function ToastContainer({ flash }: Props) {
    const [toasts, setToasts] = useState<{ id: number; message: string; type: ToastType }[]>([]);
    const processedFlashRef = useRef<{ message?: string | null; success?: string | null; error?: string | null }>({});

    const addToast = useCallback((message: string, type: ToastType) => {
        setToasts(prev => {
            if (prev.some(t => t.message === message && t.type === type)) return prev;
            return [...prev, { id: Date.now() + Math.random(), message, type }];
        });
    }, []);

    useEffect(() => {
        if (flash.message && flash.message !== processedFlashRef.current.message) {
            addToast(flash.message, 'success');
            processedFlashRef.current.message = flash.message;
        }
        if (flash.success && flash.success !== processedFlashRef.current.success) {
            addToast(flash.success, 'success');
            processedFlashRef.current.success = flash.success;
        }
        if (flash.error && flash.error !== processedFlashRef.current.error) {
            addToast(flash.error, 'error');
            processedFlashRef.current.error = flash.error;
        }
    }, [flash, addToast]);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="pointer-events-none fixed right-4 bottom-4 left-4 z-[100] flex flex-col items-end gap-2 md:right-auto md:w-96">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}
