import React, { useState } from 'react';
import { List, CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    fields: Record<string, string>;
    selectedFields: string[];
    onToggle: (field: string) => void;
    onSelectAll: () => void;
}

export default function FieldSelector({ fields, selectedFields, onToggle, onSelectAll }: Props) {
    const [isExpanded, setIsExpanded] = useState(true);
    const fieldKeys = Object.keys(fields);
    const isAllSelected = selectedFields.length === fieldKeys.length && fieldKeys.length > 0;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div 
                className="bg-gray-50 px-4 py-3 flex items-center justify-between cursor-pointer select-none border-b border-gray-100"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <List size={18} className="text-gray-500" />
                    <span className="font-bold text-gray-700 text-sm">انتخاب ستون‌های گزارش</span>
                    <span className="bg-primary-100 text-primary-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                        {selectedFields.length} انتخاب شده
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onSelectAll(); }}
                        className="text-xs text-primary-600 hover:text-primary-800 font-medium hover:underline px-2"
                    >
                        {isAllSelected ? 'لغو همه' : 'انتخاب همه'}
                    </button>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
            </div>

            {isExpanded && (
                <div className="p-4 bg-white animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {Object.entries(fields).map(([key, label]) => {
                            const isSelected = selectedFields.includes(key);
                            return (
                                <label 
                                    key={key} 
                                    className={clsx(
                                        "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all select-none text-xs",
                                        isSelected 
                                            ? "bg-primary-50 border-primary-200 text-primary-700 shadow-sm" 
                                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                    )}
                                >
                                    <div className={clsx(
                                        "w-4 h-4 rounded flex items-center justify-center border transition-colors",
                                        isSelected ? "bg-primary-500 border-primary-500" : "bg-white border-gray-300"
                                    )}>
                                        {isSelected && <CheckSquare size={12} className="text-white" />}
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="hidden" 
                                        checked={isSelected} 
                                        onChange={() => onToggle(key)} 
                                    />
                                    <span className="truncate" title={label}>{label}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}