import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { CheckCircle, Trophy, ArrowRight, XCircle, Award } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    survey: {
        title: string;
        type: string;
    };
    result: {
        score: number;
        max_score: number;
        correct_count: number;
        total_questions: number;
        earned_points: number;
        percentage: number;
    };
}

export default function SurveyResult({ survey, result }: Props) {
    const isQuiz = survey.type === 'مسابقه' || survey.type === 'quiz';
    const isSuccess = result.percentage >= 70;

    return (
        <DashboardLayout breadcrumbs={[
            { label: 'مسابقات', href: route('surveys.index') },
            { label: 'نتیجه آزمون' }
        ]}>
            <Head title={`نتیجه: ${survey.title}`} />

            <div className="max-w-2xl mx-auto text-center">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 md:p-12 animate-in zoom-in-95 duration-500">
                    
                    <div className="mb-6 flex justify-center">
                        <div className={clsx(
                            "w-24 h-24 rounded-full flex items-center justify-center shadow-lg",
                            isQuiz 
                                ? (isSuccess ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600')
                                : 'bg-blue-100 text-blue-600'
                        )}>
                            {isQuiz 
                                ? (isSuccess ? <Trophy size={48} className="animate-bounce" /> : <Award size={48} />)
                                : <CheckCircle size={48} />
                            }
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-gray-800 mb-2">
                        {isQuiz 
                            ? (isSuccess ? 'تبریک! آزمون با موفقیت انجام شد' : 'آزمون به پایان رسید') 
                            : 'با تشکر از مشارکت شما'
                        }
                    </h1>
                    <p className="text-gray-500 mb-8">{survey.title}</p>

                    {isQuiz && (
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <div className="text-xs text-gray-500 mb-1">نمره شما</div>
                                <div className="text-xl font-bold text-gray-800">
                                    {result.score} <span className="text-xs text-gray-400">/ {result.max_score}</span>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <div className="text-xs text-gray-500 mb-1">پاسخ صحیح</div>
                                <div className="text-xl font-bold text-green-600">
                                    {result.correct_count} <span className="text-xs text-gray-400">/ {result.total_questions}</span>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <div className="text-xs text-gray-500 mb-1">امتیاز دریافتی</div>
                                <div className="text-xl font-bold text-amber-500 flex justify-center items-center gap-1">
                                    {result.earned_points}
                                    <span className="text-[10px] bg-amber-100 px-1.5 rounded text-amber-700">PT</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isQuiz && (
                        <div className="bg-green-50 text-green-800 p-4 rounded-xl mb-8 flex items-center justify-center gap-2">
                            <Award size={20} />
                            <span>{result.earned_points} امتیاز به حساب شما افزوده شد.</span>
                        </div>
                    )}

                    <Link 
                        href={route('surveys.index')} 
                        className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-500/20"
                    >
                        بازگشت به لیست مسابقات
                        <ArrowRight size={20} className="rtl:rotate-180" />
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
}