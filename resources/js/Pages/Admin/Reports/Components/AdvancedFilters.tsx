import React, { useState } from 'react';
import { Filter, Plus, Trash2, ChevronDown, ChevronUp, Check, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

interface AdvancedFilterItem {
    id: number;
    field: string;
    operator: string;
    value: string;
}

interface Props {
    filters: AdvancedFilterItem[];
    setFilters: (filters: AdvancedFilterItem[]) => void;
    availableFields: Record<string, string>;
    onApply: () => void;
}

export default function AdvancedFilters({ filters, setFilters, availableFields, onApply }: Props) {
    const [isOpen, setIsOpen] = useState(false); // Default closed

    const addFilter = () => {
        const firstField = Object.keys(availableFields)[0] || '';
        setFilters([...filters, { id: Date.now(), field: firstField, operator: 'contains', value: '' }]);
        if (!isOpen) setIsOpen(true);
    };

    const removeFilter = (id: number) => {
        setFilters(filters.filter(f => f.id !== id));
    };

    const updateFilter = (id: number, key: keyof AdvancedFilterItem, val: string) => {
        setFilters(filters.map(f => f.id === id ? { ...f, [key]: val } : f));
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div 
                className="bg-gray-50 px-4 py-4 flex items-center justify-between cursor-pointer select-none border-b border-gray-100"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Filter size={18} className="text-primary-500" />
                    <span>فیلترهای پیشرفته</span>
                    {filters.length > 0 && (
                        <span className="bg-primary-100 text-primary-700 text-[10px] px-2 py-0.5 rounded-full">
                            {filters.length}
                        </span>
                    )}
                </div>
                {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </div>

            <div className={clsx(
                "transition-all duration-300 ease-in-out overflow-hidden bg-white",
                isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
            )}>
                <div className="p-4 space-y-4">
                    {filters.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-2">هیچ فیلتری تعریف نشده است.</p>
                    )}

                    {filters.map((filter, index) => (
                        <div key={filter.id} className="bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-sm space-y-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-gray-500">شرط شماره {index + 1}</span>
                                <button 
                                    onClick={() => removeFilter(filter.id)} 
                                    className="text-red-400 hover:text-red-600 transition"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            
                            <div>
                                <label className="block text-[10px] text-gray-600 mb-1 font-medium">ستون</label>
                                <select 
                                    value={filter.field} 
                                    onChange={(e) => updateFilter(filter.id, 'field', e.target.value)}
                                    className="w-full text-xs bg-white border border-gray-300 rounded-lg py-1.5 px-2 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    {Object.entries(availableFields).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <div className="w-1/2">
                                    <label className="block text-[10px] text-gray-600 mb-1 font-medium">عملگر</label>
                                    <select 
                                        value={filter.operator}
                                        onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                                        className="w-full text-xs bg-white border border-gray-300 rounded-lg py-1.5 px-2 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="contains">شامل (Like)</option>
                                        <option value="equals">برابر (=)</option>
                                        <option value="not_equals">مخالف (!=)</option>
                                        <option value="starts_with">شروع با</option>
                                        <option value="ends_with">پایان با</option>
                                        <option value="greater_than">بزرگتر (&gt;)</option>
                                        <option value="less_than">کوچکتر (&lt;)</option>
                                        <option value="not_contains">شامل نباشد</option>
                                    </select>
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-[10px] text-gray-600 mb-1 font-medium">مقدار</label>
                                    <input 
                                        type="text" 
                                        value={filter.value} 
                                        onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                                        className="w-full text-xs bg-white border border-gray-300 rounded-lg py-1.5 px-2 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="مقدار..."
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <button 
                            onClick={addFilter}
                            className="flex-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 py-2 rounded-lg transition font-medium flex items-center justify-center gap-1"
                        >
                            <Plus size={14} />
                            افزودن شرط
                        </button>
                        
                        {filters.length > 0 && (
                            <button 
                                onClick={onApply}
                                className="flex-1 text-xs bg-primary-600 text-white hover:bg-primary-700 py-2 rounded-lg transition font-bold flex items-center justify-center gap-1 shadow-md shadow-primary-500/20"
                            >
                                <RefreshCw size={14} />
                                اعمال فیلترها
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}