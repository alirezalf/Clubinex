import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps } from '@/types';
import { FileText, Trophy, Clock, CheckCircle, ArrowLeft, Calendar, AlertTriangle } from 'lucide-react';
import QuizHistoryTable from '@/Components/QuizHistoryTable.tsx';

interface SurveyItem {
    id: number;
    title: string;
    slug: string;
    description: string;
    type: string;
    questions_count: number;
    total_points: number;
    is_participated: boolean;
    is_available: boolean;
    status_text: string;
    starts_at_jalali?: string;
    ends_at_jalali?: string;
}

interface HistoryItem {
    id: number;
    title: string;
    type: string;
    submitted_at: string;
    score: number;
    max_score: number;
    percentage: number;
    is_quiz: boolean;
}

interface Props extends PageProps {
    surveys: SurveyItem[];
    history: HistoryItem[];
}

export default function SurveysIndex({ surveys, history }: Props) {
    return (
        <DashboardLayout breadcrumbs={[{ label: 'مسابقات و نظرسنجی' }]}>
            <Head title="مسابقات و نظرسنجی" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {surveys.map((survey) => (
                    <div key={survey.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col h-full ${!survey.is_available && !survey.is_participated ? 'opacity-70' : ''}`}>
                        <div className={`h-2 ${survey.type === 'quiz' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${survey.type === 'quiz' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {survey.type === 'quiz' ? <Trophy size={24} /> : <FileText size={24} />}
                                </div>
                                {survey.is_participated ? (
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                                        <CheckCircle size={12} /> شرکت کرده‌اید
                                    </span>
                                ) : !survey.is_available ? (
                                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                                        <Clock size={12} /> {survey.status_text}
                                    </span>
                                ) : (
                                    <span className="bg-green-50 text-green-600 px-2 py-1 rounded text-xs flex items-center gap-1 animate-pulse">
                                        <Clock size={12} /> فعال
                                    </span>
                                )}
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-800 mb-2">{survey.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{survey.description}</p>
                            
                            <div className="flex flex-col gap-2 text-xs text-gray-400 mb-6">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1"><Clock size={12} /> {survey.questions_count} سوال</span>
                                    {survey.total_points > 0 && <span>• {survey.total_points} امتیاز</span>}
                                </div>
                                {(survey.starts_at_jalali || survey.ends_at_jalali) && (
                                    <div className="flex items-center gap-1 text-gray-500 bg-gray-50 px-2 py-1 rounded w-fit">
                                        <Calendar size={12} />
                                        {survey.ends_at_jalali ? `مهلت تا: ${survey.ends_at_jalali}` : `شروع از: ${survey.starts_at_jalali}`}
                                    </div>
                                )}
                            </div>

                            {survey.is_available || survey.is_participated ? (
                                <Link 
                                    href={route('surveys.show', survey.slug)}
                                    className={`w-full py-2.5 rounded-xl text-center font-bold text-sm transition flex items-center justify-center gap-2 ${
                                        survey.is_participated 
                                        ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' 
                                        : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/20'
                                    }`}
                                >
                                    {survey.is_participated ? 'مشاهده نتایج' : 'شرکت در مسابقه'}
                                    {!survey.is_participated && <ArrowLeft size={16} />}
                                </Link>
                            ) : (
                                <button disabled className="w-full py-2.5 rounded-xl text-center font-bold text-sm bg-gray-100 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2">
                                    <AlertTriangle size={16} />
                                    {survey.status_text}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {surveys.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-500">
                    <Trophy size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>در حال حاضر مسابقه یا نظرسنجی فعالی وجود ندارد.</p>
                </div>
            )}

            {/* History Section */}
            <QuizHistoryTable history={history} />
        </DashboardLayout>
    );
}