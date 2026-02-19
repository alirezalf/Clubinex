import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface Props<T> {
    title: string;
    icon: LucideIcon;
    iconColorClass?: string;
    headers: string[];
    data: T[];
    renderRow: (item: T, index: number) => ReactNode;
    emptyMessage?: string;
}

export default function SimpleHistoryTable<T extends { id: number | string }>({ 
    title, 
    icon: Icon, 
    iconColorClass = 'text-gray-600', 
    headers, 
    data, 
    renderRow,
    emptyMessage = 'داده‌ای یافت نشد.'
}: Props<T>) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2 shrink-0">
                <Icon size={18} className={iconColorClass} />
                <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
                <span className="mr-auto bg-white px-2 py-0.5 rounded text-xs text-gray-500 border border-gray-200">
                    {data.length} مورد
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                <table className="w-full text-sm text-right">
                    <thead className="bg-white text-gray-500 sticky top-0 z-10 border-b border-gray-100 shadow-sm">
                        <tr>
                            {headers.map((header, index) => (
                                <th key={index} className="px-4 py-3 text-xs font-medium bg-gray-50/90 backdrop-blur-sm">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.length > 0 ? (
                            data.map((item, index) => renderRow(item, index))
                        ) : (
                            <tr>
                                <td colSpan={headers.length} className="h-48 text-center align-middle text-gray-400 text-sm">
                                    <div className="flex flex-col items-center gap-2">
                                        <Icon size={32} className="opacity-20" />
                                        {emptyMessage}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}