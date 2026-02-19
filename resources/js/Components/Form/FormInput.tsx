import React, { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import clsx from 'clsx';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    containerClass?: string;
    suffix?: ReactNode; // آیکون یا المنت انتهای اینپوت
    ltr?: boolean; // اجبار به چپ‌چین
}

const FormInput = forwardRef<HTMLInputElement, Props>(({ label, error, className, containerClass, suffix, ltr, ...props }, ref) => {
    return (
        <div className={containerClass}>
            {label && <label className="block text-sm font-medium mb-1.5 text-gray-700">{label}</label>}
            <div className="relative">
                <input
                    ref={ref}
                    className={clsx(
                        "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-500",
                        error && "border-red-300 focus:ring-red-200 focus:border-red-500",
                        (ltr || suffix) ? "pl-10 text-left dir-ltr" : "", // اگر سافیکس دارد یا ltr است، چپ چین شود
                        className
                    )}
                    {...props}
                />
                {suffix && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center justify-center">
                        {suffix}
                    </div>
                )}
            </div>
            {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
        </div>
    );
});

export default FormInput;