import React from 'react';
import { History, Trophy, CheckCircle, XCircle, FileText } from 'lucide-react';

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

interface Props {
    history: HistoryItem[];
}

export default function QuizHistoryTable({ history }: Props) {
    if (!history || history.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <History size={20} className="text-gray-500" />
                    تاریخچه فعالیت‌ها
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-6 py-4">عنوان</th>
                            <th className="px-6 py-4">نوع</th>
                            <th className="px-6 py-4">تاریخ شرکت</th>
                            <th className="px-6 py-4">نتیجه</th>
                            <th className="px-6 py-4">وضعیت</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {history.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 font-medium text-gray-800">{item.title}</td>
                                <td className="px-6 py-4 text-gray-500 text-xs">{item.type}</td>
                                <td className="px-6 py-4 text-gray-500">{item.submitted_at}</td>
                                <td className="px-6 py-4 font-bold">
                                    {item.is_quiz ? (
                                        <span className={item.percentage >= 70 ? 'text-green-600' : 'text-orange-500'}>
                                            {item.score} <span className="text-gray-400 text-[10px] font-normal">/ {item.max_score}</span>
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {item.is_quiz ? (
                                        item.percentage >= 70 ? (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs flex items-center gap-1 w-fit">
                                                <Trophy size={12} /> قبول
                                            </span>
                                        ) : (
                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs flex items-center gap-1 w-fit">
                                                <XCircle size={12} /> مردود
                                            </span>
                                        )
                                    ) : (
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1 w-fit">
                                            <CheckCircle size={12} /> ثبت شده
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}