import React, { useState, useEffect, useRef } from 'react';
import { Head, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps } from '@/types';
import { Search, FileSpreadsheet, Printer } from 'lucide-react';
import PersianDatePicker from '@/Components/PersianDatePicker';
import axios from 'axios';
import clsx from 'clsx';

// Import Components
import DataSourceSelector from './Components/DataSourceSelector';
import FieldSelector from './Components/FieldSelector';
import ReportTable from './Components/ReportTable';
import ReportSettings from './Components/ReportSettings'; 
import AdvancedFilters from './Components/AdvancedFilters';

interface Entity {
    label: string;
}

interface Props extends PageProps {
    entities: Record<string, Entity>; 
}

interface SiteSettings {
    name: string;
    logo?: string;
}

interface AdvancedFilter {
    id: number;
    field: string;
    operator: string;
    value: string;
}

export default function DynamicReports({ entities }: Props) {
    // @ts-ignore
    const { site } = usePage<PageProps & { site: SiteSettings }>().props;

    const [selectedTable, setSelectedTable] = useState<string>('');
    const [availableFields, setAvailableFields] = useState<Record<string, string>>({}); // { col: label }
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    
    // Advanced Filters State
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilter[]>([]);

    // New States
    const [showRowNumber, setShowRowNumber] = useState(true);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    
    // Print Config
    const [printConfig, setPrintConfig] = useState({
        title: 'گزارش خروجی',
        companyName: site?.name || 'Clubinex',
        footerText: 'این گزارش سیستمی است.',
        rowsPerPage: 20,
        showDate: true,
        showPageNum: true,
        showLogo: true,
    });

    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fieldsLoading, setFieldsLoading] = useState(false);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 20 });

    const reportRef = useRef<HTMLDivElement>(null);

    // Initialize with first table if available
    useEffect(() => {
        const keys = Object.keys(entities);
        if (keys.length > 0 && !selectedTable) {
            handleTableChange(keys[0]);
        }
    }, [entities]);

    const handleTableChange = async (table: string) => {
        setSelectedTable(table);
        setSelectedFields([]); 
        setReportData([]);
        setAvailableFields({});
        setAdvancedFilters([]);
        
        setFieldsLoading(true);
        try {
            const response = await axios.get(route('admin.reports.dynamic.columns', table));
            setAvailableFields(response.data);
            const keys = Object.keys(response.data);
            setSelectedFields(keys.slice(0, 7));
        } catch (error) {
            console.error("Failed to fetch columns", error);
        } finally {
            setFieldsLoading(false);
        }
    };

    const toggleField = (field: string) => {
        if (selectedFields.includes(field)) {
            setSelectedFields(selectedFields.filter(f => f !== field));
        } else {
            setSelectedFields([...selectedFields, field]);
        }
    };

    const selectAllFields = () => {
        const allFields = Object.keys(availableFields);
        if (selectedFields.length === allFields.length) {
            setSelectedFields([]);
        } else {
            setSelectedFields(allFields);
        }
    };

    const fetchReport = async (page = 1) => {
        if (selectedFields.length === 0) {
            alert('لطفاً حداقل یک فیلد را انتخاب کنید.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(route('admin.reports.dynamic.fetch'), {
                params: {
                    table: selectedTable,
                    fields: selectedFields,
                    date_from: dateFrom,
                    date_to: dateTo,
                    page: page,
                    per_page: pagination.per_page,
                    sort_dir: sortDir,
                    advanced_filters: advancedFilters
                }
            });
            
            if (response.data.data) {
                setReportData(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total,
                    per_page: response.data.per_page
                });

                // Auto scroll to report section on success
                setTimeout(() => {
                    reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 200);

            } else {
                setReportData([]);
            }
        } catch (error) {
            console.error('Error fetching report:', error);
            alert('خطا در دریافت اطلاعات.');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (selectedFields.length === 0 || pagination.total === 0) return;
        
        const params = new URLSearchParams();
        params.append('table', selectedTable);
        selectedFields.forEach(f => params.append('fields[]', f));
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);
        params.append('sort_dir', sortDir);
        if (showRowNumber) params.append('show_row_number', '1');
        
        // Serialize advanced filters
        advancedFilters.forEach((f, i) => {
            params.append(`advanced_filters[${i}][field]`, f.field);
            params.append(`advanced_filters[${i}][operator]`, f.operator);
            params.append(`advanced_filters[${i}][value]`, f.value);
        });
        
        window.open(`${route('admin.reports.dynamic.export')}?${params.toString()}`, '_blank');
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <DashboardLayout breadcrumbs={[
            { label: 'گزارشات', href: route('admin.reports.index') },
            { label: 'گزارش‌ساز پیشرفته' }
        ]}>
            <Head title="گزارش‌ساز داینامیک" />

            <div className="space-y-6">
                
                {/* 1. Top Section: Data Source & Time Range & Actions */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm no-print">
                    <div className="flex flex-col xl:flex-row items-end gap-6">
                        
                        {/* Source Selector */}
                        <div className="w-full xl:w-1/3">
                            <DataSourceSelector 
                                entities={entities} 
                                selectedTable={selectedTable} 
                                onChange={handleTableChange} 
                            />
                        </div>

                        {/* Date Range */}
                        <div className="w-full xl:w-1/3">
                            <label className="block text-xs font-bold text-gray-500 mb-2 mr-1">محدوده زمانی (اختیاری)</label>
                            <div className="flex gap-2">
                                <PersianDatePicker 
                                    value={dateFrom} 
                                    onChange={setDateFrom} 
                                    placeholder="از تاریخ" 
                                />
                                <PersianDatePicker 
                                    value={dateTo} 
                                    onChange={setDateTo} 
                                    placeholder="تا تاریخ" 
                                />
                            </div>
                        </div>

                        {/* Actions (Icon Buttons) */}
                        <div className="w-full xl:w-auto flex gap-3 h-[42px]">
                            <button 
                                onClick={() => fetchReport(1)}
                                disabled={loading || selectedFields.length === 0}
                                className="h-full aspect-square bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed transition active:scale-95"
                                title="مشاهده گزارش"
                            >
                                {loading ? (
                                    <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                                ) : (
                                    <Search size={22} />
                                )}
                            </button>
                            
                            <button 
                                onClick={handlePrint}
                                disabled={pagination.total === 0}
                                className="h-full aspect-square bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                title="چاپ گزارش"
                            >
                                <Printer size={22} />
                            </button>

                            <button 
                                onClick={handleExport}
                                disabled={pagination.total === 0}
                                className="h-full aspect-square bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg shadow-green-500/20 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                title="خروجی اکسل"
                            >
                                <FileSpreadsheet size={22} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 no-print">
                    
                    {/* Field Selection (Left Side - Wider) */}
                    <div className="xl:col-span-3 h-full">
                        {fieldsLoading ? (
                            <div className="bg-white h-full min-h-[100px] rounded-2xl border flex items-center justify-center text-gray-400">
                                در حال بارگذاری ستون‌ها...
                            </div>
                        ) : (
                            <FieldSelector 
                                fields={availableFields}
                                selectedFields={selectedFields}
                                onToggle={toggleField}
                                onSelectAll={selectAllFields}
                            />
                        )}
                    </div>

                    {/* Settings & Filters (Right Side - Narrower) */}
                    <div className="xl:col-span-1 flex flex-col gap-4">
                        {/* Report Settings */}
                        <ReportSettings 
                            showRowNumber={showRowNumber}
                            setShowRowNumber={setShowRowNumber}
                            sortDir={sortDir}
                            setSortDir={setSortDir}
                            printConfig={printConfig}
                            setPrintConfig={setPrintConfig}
                        />

                        {/* Advanced Filters */}
                        <AdvancedFilters 
                            filters={advancedFilters}
                            setFilters={setAdvancedFilters}
                            availableFields={availableFields}
                            onApply={() => fetchReport(1)}
                        />
                    </div>
                </div>

                {/* 3. Result Table */}
                <div ref={reportRef} className="animate-in fade-in slide-in-from-bottom-4 duration-500 scroll-mt-24">
                    <ReportTable 
                        data={reportData}
                        loading={loading}
                        selectedFields={selectedFields}
                        fieldLabels={availableFields}
                        pagination={pagination}
                        onPageChange={fetchReport}
                        showRowNumber={showRowNumber}
                        printConfig={printConfig}
                    />
                </div>

            </div>
        </DashboardLayout>
    );
}