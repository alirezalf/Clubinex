import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface SortableHeaderProps {
    label: string;
    field: string;
    onSort: (field: string) => void;
    currentSort?: string;
    dir?: string;
}

export default function SortableHeader({ label, field, onSort, currentSort, dir }: SortableHeaderProps) {
    return (
        <th 
            className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition select-none group"
            onClick={() => onSort(field)}
        >
            <div className="flex items-center gap-1">
                {label}
                <div className="flex flex-col text-gray-300 group-hover:text-gray-400">
                    {currentSort === field ? (
                        dir === 'asc' ? <ArrowUp size={12} className="text-primary-600" /> : <ArrowDown size={12} className="text-primary-600" />
                    ) : (
                        <div className="flex flex-col -space-y-1">
                            <ArrowUp size={10} />
                            <ArrowDown size={10} />
                        </div>
                    )}
                </div>
            </div>
        </th>
    );
}