import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

export interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

interface Props<T> {
    data: T[];
    columns: Column<T>[];
    sort?: { field: string; dir: 'asc' | 'desc' };
    onSort?: (field: string) => void;
    from?: number; // For row numbering
    showRowNumber?: boolean;
    emptyMessage?: string;
}

export default function DataTable<T extends { id: number | string }>({ 
    data, 
    columns, 
    sort, 
    onSort, 
    from = 1,
    showRowNumber = true,
    emptyMessage = "داده‌ای یافت نشد."
}: Props<T>) {
    
    const handleSort = (field: string) => {
        if (onSort) onSort(field);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="bg-gray-50 text-gray-500 font-medium select-none">
                        <tr>
                            {showRowNumber && <th className="px-6 py-4 w-16 text-center">#</th>}
                            {columns.map((col) => (
                                <th 
                                    key={col.key} 
                                    className={clsx(
                                        "px-6 py-4", 
                                        col.sortable && "cursor-pointer hover:bg-gray-100 transition",
                                        col.className
                                    )}
                                    onClick={() => col.sortable && handleSort(col.key)}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {col.sortable && sort && sort.field === col.key && (
                                            sort.dir === 'asc' ? <ChevronUp size={14} className="text-primary-600" /> : <ChevronDown size={14} className="text-primary-600" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.length > 0 ? (
                            data.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    {showRowNumber && (
                                        <td className="px-6 py-4 text-center font-mono text-gray-400">{from + index}</td>
                                    )}
                                    {columns.map((col) => (
                                        <td key={`${item.id}-${col.key}`} className={clsx("px-6 py-4", col.className)}>
                                            {col.render ? col.render(item) : (item as any)[col.key] || '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (showRowNumber ? 1 : 0)} className="p-8 text-center text-gray-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}