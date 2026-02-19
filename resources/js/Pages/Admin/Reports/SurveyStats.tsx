import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps } from '@/types';
import { ArrowLeft, Printer, Download, Settings } from 'lucide-react';
import clsx from 'clsx';

// Components
import SurveyCharts from './Components/SurveyCharts';
import QuestionAnalysis from './Components/QuestionAnalysis';
import ParticipantsTable from './Components/ParticipantsTable';
import PrintSettingsModal from './Components/PrintSettings';

interface Props extends PageProps {
    survey: any;
    questions: any[];
    demographics: any;
    participants: { data: any[], links: any[] };
}

export default function SurveyStats({ survey, questions, demographics, participants }: Props) {
    const [printSettingsOpen, setPrintSettingsOpen] = useState(false);
    const [printOptions, setPrintOptions] = useState({
        charts: true,
        questions: true,
        participants: true
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <DashboardLayout breadcrumbs={[
            { label: 'گزارشات', href: route('admin.reports.index') },
            { label: `آمار: ${survey.title}` }
        ]}>
            <Head title={`گزارش آماری: ${survey.title}`} />

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    header, aside { display: none !important; }
                    .page-break { page-break-before: always; }
                }
            `}</style>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 no-print">
                <div className="flex items-center gap-2">
                    <Link href={route('admin.reports.index', {tab: 'surveys'})} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">گزارش تحلیلی آزمون/نظرسنجی</h1>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setPrintSettingsOpen(true)}
                        className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-50 flex items-center gap-2 shadow-sm"
                        title="تنظیمات چاپ"
                    >
                        <Settings size={18} />
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 flex items-center gap-2 shadow-lg shadow-primary-500/20"
                    >
                        <Printer size={18} />
                        چاپ گزارش
                    </button>
                </div>
            </div>

            <div className="print-area space-y-8">
                
                {/* 1. Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                    
                    <h2 className="text-xl font-bold text-gray-800 mb-6 text-center border-b pb-4 relative z-10">{survey.title}</h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                        <StatCard label="تعداد شرکت‌کنندگان" value={survey.total_participants} color="blue" />
                        <StatCard label="نوع رویداد" value={survey.type} color="purple" />
                        <StatCard label="وضعیت" value={survey.is_active ? 'فعال' : 'بسته شده'} color={survey.is_active ? 'green' : 'gray'} />
                        <StatCard label="مدت زمان برگزاری" value={survey.duration} color="orange" />
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500 justify-center relative z-10">
                        <span>تاریخ شروع: {survey.starts_at || '---'}</span>
                        <span>تاریخ پایان: {survey.ends_at || '---'}</span>
                    </div>
                </div>

                {/* 2. Charts Section */}
                <div className={clsx(!printOptions.charts && "no-print")}>
                    <SurveyCharts demographics={demographics} total={survey.total_participants} type={survey.type} />
                </div>

                {/* 3. Questions Analysis (Grid + SlideDown) */}
                <div className={clsx(!printOptions.questions && "no-print", "page-break")}>
                    <QuestionAnalysis questions={questions} surveyType={survey.type} />
                </div>

                {/* 4. Participants List */}
                <div className={clsx(!printOptions.participants && "no-print", "page-break")}>
                    <ParticipantsTable participants={participants} surveyId={survey.id} />
                </div>
            </div>

            {/* Print Settings Modal */}
            <PrintSettingsModal 
                isOpen={printSettingsOpen} 
                onClose={() => setPrintSettingsOpen(false)} 
                options={printOptions} 
                setOptions={setPrintOptions} 
            />
        </DashboardLayout>
    );
}

const StatCard = ({ label, value, color }: { label: string, value: string | number, color: string }) => {
    const colorClasses: any = {
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        purple: 'bg-purple-50 text-purple-700 border-purple-100',
        green: 'bg-green-50 text-green-700 border-green-100',
        gray: 'bg-gray-100 text-gray-700 border-gray-200',
        orange: 'bg-orange-50 text-orange-700 border-orange-100',
    };

    return (
        <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${colorClasses[color] || colorClasses.gray}`}>
            <span className="text-xs opacity-70 mb-1">{label}</span>
            <span className="font-bold text-lg">{value}</span>
        </div>
    );
};