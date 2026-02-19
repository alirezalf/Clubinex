import { Head, router } from '@inertiajs/react';
import { CheckCircle, Clock, FileText, Hash, Award, AlertTriangle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import type { PageProps } from '@/types';

interface Question {
    id: number;
    question: string;
    type: 'multiple_choice' | 'text' | 'number';
    options?: string[];
    is_required: boolean;
    points: number;
}

interface SurveyProps extends PageProps {
    survey: {
        id: number;
        title: string;
        description: string;
        type: string;
        questions: Question[];
        max_attempts: number;
        duration_minutes: number | null;
        total_points: number;
    };
}

export default function SurveyShow({ survey }: SurveyProps) {
    const [answers, setAnswers] = useState<Record<number, string | number>>({});
    const [processing, setProcessing] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(
        survey.duration_minutes ? survey.duration_minutes * 60 : null
    );

    // Timer Logic
    useEffect(() => {
        if (timeLeft === null) return;

        if (timeLeft <= 0) {
            handleSubmit(); // Auto submit when time runs out
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Format Time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleOptionChange = (questionId: number, index: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: index }));
    };

    const handleTextChange = (questionId: number, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        // Prevent double submission
        if (processing) return;

        setProcessing(true);

        // تبدیل آبجکت پاسخ‌ها به آرایه مورد انتظار کنترلر
        const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
            question_id: parseInt(qId),
            value: val
        }));

        // بررسی سوالات اجباری (فقط اگر دستی سابمیت شده باشد و زمان باقی مانده باشد)
        if (e && timeLeft !== 0 && timeLeft !== null) {
            const missingRequired = survey.questions.some(q => q.is_required && answers[q.id] === undefined);
            if (missingRequired) {
                alert('لطفاً به تمام سوالات اجباری پاسخ دهید.');
                setProcessing(false);
                return;
            }
        }

        router.post(route('surveys.submit', survey.id), {
            answers: formattedAnswers
        }, {
            onFinish: () => setProcessing(false),
            // Ensure we handle errors if any
            onError: () => setProcessing(false)
        });
    };

    return (
        <DashboardLayout breadcrumbs={[
            { label: 'مسابقات و نظرسنجی' },
            { label: survey.title }
        ]}>
            <Head title={survey.title} />

            <div className="max-w-3xl mx-auto relative">
                {/* Timer Sticky Header */}
                {timeLeft !== null && (
                    <div className="sticky top-20 z-40 mb-4 flex justify-center animate-in slide-in-from-top-4 pointer-events-none">
                        <div className={`bg-white shadow-lg border px-6 py-2 rounded-full flex items-center gap-3 font-mono font-bold text-lg ${
                            timeLeft < 60 ? 'text-red-600 border-red-200 animate-pulse' : 'text-gray-700 border-gray-200'
                        }`}>
                            <Clock size={20} />
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                )}

                {/* Info Header */}
                <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 md:p-8 text-white mb-8 shadow-lg">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
                                <FileText className="text-primary-200" />
                                {survey.title}
                            </h1>
                            <p className="text-primary-100 text-sm leading-relaxed opacity-90 max-w-xl">{survey.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 md:flex-col md:items-end md:gap-3 shrink-0">
                            {survey.type === 'quiz' && (
                                <>
                                    <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/20 text-xs md:text-sm">
                                        <Hash size={16} />
                                        <span>{survey.questions.length} سوال</span>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/20 text-xs md:text-sm font-bold text-yellow-300">
                                        <Award size={16} />
                                        <span>{survey.total_points} امتیاز کل</span>
                                    </div>
                                </>
                            )}
                            {timeLeft !== null && (
                                <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/20 text-xs md:text-sm">
                                    <Clock size={16} />
                                    <span>{survey.duration_minutes} دقیقه زمان</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Questions Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {survey.questions.map((q, index) => (
                        <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 50}ms` }}>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-gray-800 flex gap-3 text-base">
                                    <span className="bg-primary-50 text-primary-600 w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 font-mono mt-0.5">
                                        {index + 1}
                                    </span>
                                    <span className="pt-0.5">
                                        {q.question}
                                        {q.is_required && <span className="text-red-500 mr-1">*</span>}
                                    </span>
                                </h3>
                                {survey.type === 'quiz' && (
                                    <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded border border-yellow-100 whitespace-nowrap shrink-0">
                                        {q.points} امتیاز
                                    </span>
                                )}
                            </div>

                            <div className="mr-10">
                                {q.type === 'multiple_choice' && q.options && (
                                    <div className="space-y-3">
                                        {q.options.map((opt, i) => (
                                            <label 
                                                key={i} 
                                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                                    answers[q.id] === i 
                                                    ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500 shadow-sm' 
                                                    : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers[q.id] === i ? 'border-primary-500 bg-primary-500' : 'border-gray-300'}`}>
                                                    {answers[q.id] === i && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name={`q_${q.id}`}
                                                    value={i}
                                                    checked={answers[q.id] === i}
                                                    onChange={() => handleOptionChange(q.id, i)}
                                                    className="hidden"
                                                />
                                                <span className="text-gray-700 text-sm">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'text' && (
                                    <textarea
                                        rows={3}
                                        className="w-full border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 p-3 text-sm"
                                        placeholder="پاسخ خود را بنویسید..."
                                        onChange={(e) => handleTextChange(q.id, e.target.value)}
                                        value={answers[q.id] || ''}
                                    ></textarea>
                                )}

                                {q.type === 'number' && (
                                    <input
                                        type="number"
                                        className="w-full border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 p-3 text-sm"
                                        placeholder="عدد وارد کنید"
                                        onChange={(e) => handleTextChange(q.id, e.target.value)}
                                        value={answers[q.id] || ''}
                                    />
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="flex flex-col items-center justify-center pt-4 pb-8 gap-4">
                        {timeLeft !== null && timeLeft < 60 && timeLeft > 0 && (
                            <div className="text-red-500 text-sm font-bold animate-pulse flex items-center gap-1">
                                <AlertTriangle size={16} />
                                زمان رو به اتمام است!
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={processing || (timeLeft !== null && timeLeft <= 0)}
                            className="w-full md:w-auto bg-green-600 text-white px-10 py-3.5 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 transition transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'در حال ثبت...' : 'ثبت نهایی پاسخ‌ها'}
                            <CheckCircle size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}