import React from 'react';
import { Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import SortableHeader from './SortableHeader';

export default function SurveysTable({ data, sort, onSort, from }: any) {
    return (
        <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                    <th className="px-6 py-4 w-16 text-center">#</th>
                    <th className="px-6 py-4">عنوان</th>
                    <th className="px-6 py-4">نوع</th>
                    <SortableHeader label="شرکت‌کنندگان" field="answers_count" onSort={() => {}} />
                    <th className="px-6 py-4">بازه زمانی</th>
                    <th className="px-6 py-4">وضعیت</th>
                    <th className="px-6 py-4">گزارش</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {data.map((item: any, index: number) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-center font-mono text-gray-400">{from + index}</td>
                        <td className="px-6 py-4 font-bold text-gray-800 max-w-xs truncate">{item.title}</td>
                        <td className="px-6 py-4 text-xs text-gray-600">
                            {item.type === 'quiz' ? 'مسابقه' : 'نظرسنجی'}
                        </td>
                        <td className="px-6 py-4">
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                {item.total_participants_count} نفر
                            </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                            <div className="flex flex-col gap-1">
                                <span>{item.starts_at_jalali || '-'}</span>
                                <span className="text-gray-400">تا</span>
                                <span>{item.ends_at_jalali || '-'}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {item.is_active ? 'فعال' : 'غیرفعال'}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <Link 
                                href={route('admin.reports.survey_stats', item.id)}
                                className="text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition inline-block" 
                                title="مشاهده آمار کامل"
                            >
                                <Eye size={18} />
                            </Link>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}