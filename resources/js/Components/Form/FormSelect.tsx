import React, { SelectHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    containerClass?: string;
    children: React.ReactNode;
}

const FormSelect = forwardRef<HTMLSelectElement, Props>(({ label, error, className, containerClass, children, ...props }, ref) => {
    return (
        <div className={containerClass}>
            {label && <label className="block text-sm font-medium mb-1.5 text-gray-700">{label}</label>}
            <select
                ref={ref}
                className={clsx(
                    "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white",
                    error && "border-red-300 focus:ring-red-200 focus:border-red-500",
                    className
                )}
                {...props}
            >
                {children}
            </select>
            {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
        </div>
    );
});

export default FormSelect;