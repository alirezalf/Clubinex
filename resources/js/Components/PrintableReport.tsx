import React from 'react';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

interface PrintConfig {
    title: string;
    companyName: string;
    footerText: string;
    rowsPerPage: number;
    showDate: boolean;
    showPageNum: boolean;
    showLogo: boolean;
}

interface PrintableReportProps {
    columns: Record<string, string>;
    data: any[];
    config?: PrintConfig;
    showRowNumber: boolean;
}

interface SiteSettings {
    name: string;
    logo?: string;
}

export default function PrintableReport({ columns, data, config, showRowNumber }: PrintableReportProps) {
    const { site } = usePage<PageProps & { site: SiteSettings }>().props;

    // Default Configuration
    const defaultConfig = {
        title: 'گزارش خروجی',
        companyName: site?.name || 'Clubinex',
        footerText: 'این گزارش به صورت سیستمی تولید شده است.',
        rowsPerPage: 20,
        showDate: true,
        showPageNum: true,
        showLogo: true,
    };

    const finalConfig = { ...defaultConfig, ...config };

    const currentDate = new Date().toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Chunk data for pagination
    const chunkData = (array: any[], size: number) => {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    };

    const pages = chunkData(data, finalConfig.rowsPerPage);

    return (
        <div className="hidden print-only bg-white w-full text-black font-sans text-right" dir="rtl">
            <style>{`
                @media print {
                    @page { 
                        size: A4; 
                        margin: 0; /* حذف حاشیه‌های پیش‌فرض مرورگر */
                    }
                    body, html { 
                        background-color: white !important; 
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100%;
                        height: 100%;
                    }
                    .print-only { 
                        display: block !important; 
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        background: white;
                        z-index: 9999;
                    }
                    /* کانتینر اصلی هر صفحه دقیقا اندازه A4 */
                    .report-page {
                        width: 210mm;
                        height: 297mm;
                        padding: 15mm; /* حاشیه امن چاپ */
                        position: relative;
                        display: flex;
                        flex-direction: column;
                        page-break-after: always;
                        box-sizing: border-box; /* محاسبه پدینگ داخل ابعاد */
                        overflow: hidden; /* جلوگیری از اسکرول ناخواسته */
                    }
                    .report-page:last-child {
                        page-break-after: auto;
                    }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #000; padding: 4px 8px; font-size: 10px; }
                    tr { background-color: white !important; }
                }
            `}</style>

            {pages.length > 0 ? (
                pages.map((pageData, pageIndex) => (
                    <div key={pageIndex} className="report-page bg-white">
                        
                        {/* Header */}
                        <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-center shrink-0">
                            <div>
                                <h1 className="text-xl font-bold text-black mb-1">{finalConfig.title}</h1>
                                {finalConfig.showDate && (
                                    <div className="text-[10px] text-gray-600">تاریخ: {currentDate}</div>
                                )}
                            </div>
                            <div className="text-left flex flex-col items-end">
                                <div className="flex items-center gap-3">
                                    <div className="font-bold text-lg">{finalConfig.companyName}</div>
                                    {finalConfig.showLogo && site?.logo && (
                                        <img src={site.logo} alt="Logo" className="h-8 w-auto object-contain" />
                                    )}
                                </div>
                                <div className="text-[10px] mt-1">
                                    {finalConfig.showPageNum && <span>صفحه {pageIndex + 1} از {pages.length}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Content (Table) - flex-1 allows it to take available space but not push footer out */}
                        <div className="flex-1 w-full">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        {showRowNumber && (
                                            <th className="w-10 text-center">#</th>
                                        )}
                                        {Object.values(columns).map((label, index) => (
                                            <th key={index} className="font-bold text-black text-center">
                                                {label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageData.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {showRowNumber && (
                                                <td className="text-center font-bold">
                                                    {(pageIndex * finalConfig.rowsPerPage) + rowIndex + 1}
                                                </td>
                                            )}
                                            {Object.keys(columns).map((colKey, colIndex) => (
                                                <td key={colIndex} className="align-middle">
                                                    <div className="max-h-[60px] overflow-hidden text-ellipsis">
                                                        {row[colKey] !== null && row[colKey] !== undefined ? String(row[colKey]) : '-'}
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer - mt-auto pushes it to the bottom of the flex container (page) */}
                        <div className="mt-auto pt-4 border-t border-black text-center text-[9px] text-gray-600 shrink-0">
                            {finalConfig.footerText}
                        </div>
                    </div>
                ))
            ) : (
                <div className="p-10 text-center">داده‌ای برای چاپ وجود ندارد.</div>
            )}
        </div>
    );
}