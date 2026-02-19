import React, { useState, useRef, useEffect } from 'react';
import { Database, ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    entities: Record<string, { label: string }>;
    selectedTable: string;
    onChange: (table: string) => void;
}

export default function DataSourceSelector({ entities, selectedTable, onChange }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedLabel = entities[selectedTable]?.label || 'انتخاب منبع';

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full md:w-72" ref={containerRef}>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 mr-1">منبع داده</label>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200",
                    isOpen 
                        ? "border-primary-500 ring-4 ring-primary-500/10 bg-white" 
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                )}
            >
                <div className="flex items-center gap-3">
                    <div className="bg-primary-50 text-primary-600 p-1.5 rounded-lg">
                        <Database size={18} />
                    </div>
                    <span className="font-bold text-gray-700 text-sm">{selectedLabel}</span>
                </div>
                <ChevronDown size={16} className={clsx("text-gray-400 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-1.5 max-h-64 overflow-y-auto scrollbar-thin">
                        {Object.entries(entities).map(([key, entity]) => (
                            <button
                                key={key}
                                onClick={() => {
                                    onChange(key);
                                    setIsOpen(false);
                                }}
                                className={clsx(
                                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                                    selectedTable === key
                                        ? "bg-primary-50 text-primary-700 font-bold"
                                        : "text-gray-600 hover:bg-gray-50"
                                )}
                            >
                                <span>{entity.label}</span>
                                {selectedTable === key && <Check size={16} className="text-primary-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}