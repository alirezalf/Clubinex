import React, { useState } from 'react';
import { BarChart2, CheckCircle2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    questions: any[];
    surveyType: string;
}

export default function QuestionAnalysis({ questions, surveyType }: Props) {
    const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

    const toggleQuestion = (id: number) => {
        if (activeQuestion === id) {
            setActiveQuestion(null);
        } else {
            setActiveQuestion(id);
        }
    };

    return (
        <div className="space-y-6 font-sans">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
                    <BarChart2 className="text-primary-600" />
                    تحلیل سوالات
                </div>
                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                    برای مشاهده جزئیات روی شماره سوال کلیک کنید
                </span>
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                {questions.map((q, idx) => {
                    const isActive = activeQuestion === q.id;
                    let bgClass = "bg-white border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600";
                    
                    if (isActive) {
                        bgClass = "bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/30 scale-110 z-10";
                    } else if (surveyType === 'quiz' && q.correct_percent !== undefined) {
                        if (q.correct_percent > 70) bgClass = "bg-green-50 border-green-200 text-green-700 hover:bg-green-100";
                        else if (q.correct_percent < 40) bgClass = "bg-red-50 border-red-200 text-red-700 hover:bg-red-100";
                        else bgClass = "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100";
                    }

                    return (
                        <button
                            key={q.id}
                            onClick={() => toggleQuestion(q.id)}
                            className={clsx(
                                "aspect-square rounded-xl border flex flex-col items-center justify-center transition-all duration-200 cursor-pointer relative",
                                bgClass
                            )}
                        >
                            <span className="font-bold text-lg">{idx + 1}</span>
                            {surveyType === 'quiz' && !isActive && (
                                <span className="text-[9px] opacity-80 mt-1">%{q.correct_percent}</span>
                            )}
                            {isActive && <div className="absolute -bottom-1 w-2 h-2 bg-primary-600 rotate-45"></div>}
                        </button>
                    );
                })}
            </div>

            {/* Details SlideDown Area */}
            <div className={clsx(
                "transition-all duration-500 ease-in-out overflow-hidden",
                activeQuestion !== null ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
            )}>
                {activeQuestion !== null && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative mt-2 ring-4 ring-gray-50">
                        {questions.filter(q => q.id === activeQuestion).map(q => (
                            <div key={q.id} className="p-6 md:p-8 animate-in slide-in-from-top-4 fade-in duration-300">
                                <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-xs font-bold text-white bg-primary-600 px-2.5 py-1 rounded-lg shadow-sm">
                                                سوال {questions.findIndex(x => x.id === q.id) + 1}
                                            </span>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {q.type === 'multiple_choice' ? 'چند گزینه‌ای' : (q.type === 'text' ? 'متنی' : 'عددی')}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-800 text-xl leading-relaxed">{q.text}</h3>
                                    </div>
                                    <div className="text-left shrink-0 ml-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div className="text-lg font-bold text-gray-700">{q.total_answers} <span className="text-xs font-normal text-gray-500">پاسخ</span></div>
                                        <div className="text-xs text-gray-400 mt-1">{q.no_answer_count} بدون پاسخ</div>
                                    </div>
                                </div>

                                {/* Analysis Content */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2">
                                        {/* Correct Answer Display */}
                                        {q.correct_answer_display && (
                                            <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded-xl text-sm text-green-800 flex items-start gap-3 shadow-sm">
                                                <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-green-600" />
                                                <div>
                                                    <span className="font-bold block mb-1">پاسخ صحیح:</span>
                                                    <span className="font-medium bg-white px-2 py-0.5 rounded border border-green-100 inline-block mt-1">
                                                        {q.correct_answer_display}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {q.type === 'multiple_choice' && (
                                            <div className="space-y-4">
                                                {q.options.map((opt: any, i: number) => (
                                                    <div key={i} className="relative group">
                                                        <div className="flex justify-between items-end text-sm mb-1.5 z-10 relative px-1">
                                                            <span className={clsx(
                                                                "font-medium flex items-center gap-2",
                                                                opt.is_correct ? 'text-green-700 font-bold' : 'text-gray-700'
                                                            )}>
                                                                <span className="w-5 h-5 rounded flex items-center justify-center bg-gray-100 text-xs border text-gray-500">{i+1}</span>
                                                                {opt.label} 
                                                                {opt.is_correct && <CheckCircle2 size={14} className="text-green-600" />}
                                                            </span>
                                                            <div className="text-gray-600 flex items-center gap-2 text-xs">
                                                                <span className="font-bold">{opt.count}</span>
                                                                <span className="bg-gray-100 px-1.5 rounded border border-gray-200 w-10 text-center">%{opt.percent}</span>
                                                            </div>
                                                        </div>
                                                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className={clsx(
                                                                    "h-full transition-all duration-1000 ease-out rounded-full",
                                                                    opt.is_correct ? 'bg-green-500' : 'bg-primary-400 opacity-70'
                                                                )}
                                                                style={{ width: `${opt.percent}%` }}
                                                            >
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {(q.type === 'number' || q.type === 'rating') && (
                                            <div className="flex flex-col items-center justify-center py-10 bg-blue-50/30 rounded-2xl border border-blue-100">
                                                <span className="text-5xl font-black text-primary-600 mb-2 font-mono tracking-tight">{q.average}</span>
                                                <span className="text-sm text-primary-800 font-bold bg-primary-100 px-3 py-1 rounded-full">میانگین پاسخ‌های عددی</span>
                                            </div>
                                        )}

                                        {q.type === 'text' && (
                                            <div className="text-center py-12 text-gray-400 text-sm italic bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                                <FileText className="mx-auto mb-3 opacity-30" size={40} />
                                                <p>پاسخ‌های متنی در این بخش نمایش داده نمی‌شوند.</p>
                                                <p className="text-xs mt-1 opacity-70">لطفاً از خروجی اکسل برای مطالعه پاسخ‌های تشریحی استفاده کنید.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Circular Chart for Quiz Success */}
                                    {surveyType === 'quiz' && q.correct_percent !== undefined && (
                                        <div className="flex flex-col justify-center items-center gap-6 border-t lg:border-t-0 lg:border-r border-gray-100 pt-8 lg:pt-0 lg:pr-8">
                                            <div className="text-center w-full">
                                                <div className="text-sm font-bold text-gray-600 mb-4">نرخ پاسخ صحیح</div>
                                                <div className="relative w-40 h-40 mx-auto">
                                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                        <path
                                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                            fill="none"
                                                            stroke="#f3f4f6"
                                                            strokeWidth="3"
                                                        />
                                                        <path
                                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                            fill="none"
                                                            stroke={q.correct_percent > 70 ? '#10b981' : q.correct_percent > 40 ? '#f59e0b' : '#ef4444'}
                                                            strokeWidth="3"
                                                            strokeDasharray={`${q.correct_percent}, 100`}
                                                            strokeLinecap="round"
                                                            className="transition-all duration-1000 ease-out"
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className="text-3xl font-bold text-gray-800 font-sans">%{q.correct_percent}</span>
                                                        <span className="text-[10px] text-gray-400">موفق</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-gray-50 p-4 rounded-2xl text-center w-full border border-gray-100">
                                                <div className="flex justify-around items-center">
                                                    <div>
                                                        <span className="block text-xl font-bold text-green-600">{q.correct_count}</span>
                                                        <span className="text-[10px] text-gray-500">پاسخ صحیح</span>
                                                    </div>
                                                    <div className="w-px h-8 bg-gray-200"></div>
                                                    <div>
                                                        <span className="block text-xl font-bold text-red-500">{q.total_answers - q.correct_count}</span>
                                                        <span className="text-[10px] text-gray-500">پاسخ غلط</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}