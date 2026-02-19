import React from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import clsx from 'clsx';

export interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    className?: string;
    render?: (item: T) => React.ReactNode;
}

interface SortConfig {
    field: string;
    direction: 'asc' | 'desc';
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    sort?: SortConfig;
    onSort?: (field: string) => void;
    from?: number;
    showRowNumber?: boolean;
    emptyMessage?: string;
    rowClassName?: (item: T) => string;
    // New Props for Selection
    selectable?: boolean;
    selectedIds?: (number | string)[];
    onSelect?: (id: number | string) => void;
    onToggleAll?: (selectAll: boolean) => void;
}

export default function DataTable<T extends { id: number | string }>({ 
    data, 
    columns, 
    sort, 
    onSort, 
    from = 1,
    showRowNumber = true,
    emptyMessage = "داده‌ای یافت نشد.",
    rowClassName,
    selectable = false,
    selectedIds = [],
    onSelect,
    onToggleAll
}: DataTableProps<T>) {
    
    const handleSort = (field: string) => {
        if (onSort) onSort(field);
    };

    const isAllSelected = data.length > 0 && data.every(item => selectedIds.includes(item.id));
    const isIndeterminate = data.some(item => selectedIds.includes(item.id)) && !isAllSelected;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="bg-gray-50 text-gray-500 font-medium select-none">
                        <tr>
                            {/* Checkbox Column */}
                            {selectable && (
                                <th className="px-6 py-4 w-12 text-center">
                                    <div className="flex items-center justify-center">
                                        <div 
                                            className={clsx(
                                                "w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-all",
                                                isAllSelected ? "bg-primary-600 border-primary-600" : 
                                                isIndeterminate ? "bg-primary-600 border-primary-600" : "bg-white border-gray-300"
                                            )}
                                            onClick={() => onToggleAll && onToggleAll(!isAllSelected)}
                                        >
                                            {isAllSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                                            {isIndeterminate && <div className="w-2.5 h-0.5 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                </th>
                            )}

                            {showRowNumber && <th className="px-6 py-4 w-16 text-center">#</th>}
                            
                            {columns.map((col) => (
                                <th 
                                    key={col.key} 
                                    className={clsx(
                                        "px-6 py-4 transition-colors", 
                                        col.sortable ? "cursor-pointer hover:bg-gray-100 hover:text-gray-700" : "",
                                        col.className
                                    )}
                                    onClick={() => col.sortable && handleSort(col.key)}
                                >
                                    <div className={clsx("flex items-center gap-1", col.className?.includes('text-center') && "justify-center")}>
                                        {col.label}
                                        {col.sortable && sort && sort.field === col.key && (
                                            <span className="text-primary-600">
                                                {sort.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            </span>
                                        )}
                                        {col.sortable && (!sort || sort.field !== col.key) && (
                                            <span className="text-gray-300 opacity-50 flex flex-col -space-y-1">
                                                <ChevronUp size={10} />
                                                <ChevronDown size={10} />
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.length > 0 ? (
                            data.map((item, index) => {
                                const isSelected = selectedIds.includes(item.id);
                                return (
                                    <tr 
                                        key={item.id} 
                                        className={clsx(
                                            "transition-colors", 
                                            rowClassName ? rowClassName(item) : "",
                                            isSelected ? "bg-primary-50/60 hover:bg-primary-50" : "hover:bg-gray-50"
                                        )}
                                    >
                                        {/* Checkbox Cell */}
                                        {selectable && (
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center">
                                                    <div 
                                                        className={clsx(
                                                            "w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-all",
                                                            isSelected ? "bg-primary-600 border-primary-600" : "bg-white border-gray-300 hover:border-primary-400"
                                                        )}
                                                        onClick={() => onSelect && onSelect(item.id)}
                                                    >
                                                        {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                                                    </div>
                                                </div>
                                            </td>
                                        )}

                                        {showRowNumber && (
                                            <td className="px-6 py-4 text-center font-mono text-gray-400 text-xs">
                                                {from + index}
                                            </td>
                                        )}
                                        
                                        {columns.map((col) => (
                                            <td key={`${item.id}-${col.key}`} className={clsx("px-6 py-4", col.className)}>
                                                {col.render ? col.render(item) : (item as any)[col.key] || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (showRowNumber ? 1 : 0) + (selectable ? 1 : 0)} className="p-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center opacity-60">
                                        <span className="text-4xl mb-2">∅</span>
                                        <span>{emptyMessage}</span>
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