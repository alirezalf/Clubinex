import React from 'react';
import { Database, Loader2 } from 'lucide-react';
import PrintableReport from '@/Components/PrintableReport';

interface Props {
    data: any[];
    loading: boolean;
    selectedFields: string[];
    fieldLabels: Record<string, string>;
    pagination: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    onPageChange: (page: number) => void;
    showRowNumber: boolean;
    printConfig?: {
        title: string;
        companyName: string;
        footerText: string;
        rowsPerPage: number;
        showDate: boolean;
        showPageNum: boolean;
        showLogo: boolean;
    };
}

export default function ReportTable({ 
    data, loading, selectedFields, fieldLabels, 
    pagination, onPageChange, showRowNumber, printConfig 
}: Props) {
    
    // Prepare columns object for PrintableReport
    const printColumns: Record<string, string> = {};
    selectedFields.forEach(field => {
        printColumns[field] = fieldLabels[field] || field;
    });

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-fit">
            
            {/* Header / Actions */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center no-print">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    <Database size={16} className="text-gray-500" />
                    پیش‌نمایش داده‌ها
                </h3>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        مجموع: {pagination.total.toLocaleString('fa-IR')}
                    </span>
                </div>
            </div>

            {/* Main Table (Screen View) */}
            <div className="flex-1 overflow-x-auto relative min-h-[200px] no-print">
                {loading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center text-primary-600">
                        <Loader2 className="animate-spin mb-2" size={32} />
                        <span className="text-sm font-medium">در حال دریافت اطلاعات...</span>
                    </div>
                )}

                {data.length > 0 ? (
                    <table className="w-full text-sm text-right whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                            <tr>
                                {showRowNumber && (
                                    <th className="px-4 py-3 w-16 text-center text-xs text-gray-400 font-light sticky right-0 bg-gray-50 z-10 border-l">#</th>
                                )}
                                {selectedFields.map(field => (
                                    <th key={field} className="px-6 py-3 font-bold text-xs text-gray-700">
                                        {fieldLabels[field]}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map((row, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                    {showRowNumber && (
                                        <td className="px-4 py-3 text-center text-gray-400 text-xs bg-gray-50/30 sticky right-0 border-l font-mono">
                                            {(pagination.current_page - 1) * pagination.per_page + idx + 1}
                                        </td>
                                    )}
                                    {selectedFields.map(field => (
                                        <td key={field} className="px-6 py-3 text-gray-700 max-w-xs truncate" title={String(row[field] ?? '')}>
                                            {row[field] !== null && row[field] !== undefined ? String(row[field]) : <span className="text-gray-300">-</span>}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <div className="bg-gray-50 p-4 rounded-full mb-3">
                            <Database size={32} className="opacity-40" />
                        </div>
                        <p className="text-sm">داده‌ای برای نمایش وجود ندارد</p>
                        <p className="text-xs mt-1 opacity-70">لطفاً فیلدها را انتخاب کرده و دکمه مشاهده گزارش را بزنید</p>
                    </div>
                )}
            </div>

            {/* Pagination Footer (Screen View) */}
            {pagination.last_page > 1 && (
                <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-center items-center gap-2 no-print">
                    <button 
                        onClick={() => onPageChange(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1 || loading}
                        className="px-3 py-1.5 rounded-lg border bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition"
                    >
                        قبلی
                    </button>
                    <span className="px-3 py-1.5 text-xs text-gray-600 bg-white border rounded-lg font-mono">
                        {pagination.current_page} / {pagination.last_page}
                    </span>
                    <button 
                        onClick={() => onPageChange(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page || loading}
                        className="px-3 py-1.5 rounded-lg border bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition"
                    >
                        بعدی
                    </button>
                </div>
            )}

            {/* Printable Component (Hidden on screen, Visible on print) */}
            <PrintableReport 
                data={data}
                columns={printColumns}
                config={printConfig}
                showRowNumber={showRowNumber}
            />
        </div>
    );
}