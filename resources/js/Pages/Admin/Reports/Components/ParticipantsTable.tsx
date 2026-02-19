import React from 'react';
import { Users, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Props {
    participants: { data: any[], links: any[] };
    surveyId: number;
}

export default function ParticipantsTable({ participants, surveyId }: Props) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden font-sans">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <Users size={20} className="text-gray-500" />
                    لیست شرکت‌کنندگان
                </h3>
                <a 
                    href={route('admin.reports.export_survey_participants', surveyId)}
                    className="text-sm bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 flex items-center gap-2 transition shadow-sm no-print active:scale-95"
                >
                    <Download size={16} />
                    خروجی اکسل شرکت‌کنندگان
                </a>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-600 font-medium text-xs">
                        <tr>
                            <th className="px-6 py-4">شناسه</th>
                            <th className="px-6 py-4">نام و نام خانوادگی</th>
                            <th className="px-6 py-4">کد ملی</th>
                            <th className="px-6 py-4">شماره موبایل</th>
                            <th className="px-6 py-4">استان / شهر</th>
                            <th className="px-6 py-4">نمره/امتیاز</th>
                            <th className="px-6 py-4">تاریخ شرکت</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {participants.data.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{user.id}</td>
                                <td className="px-6 py-4 font-bold text-gray-800">{user.full_name}</td>
                                <td className="px-6 py-4 font-mono text-gray-600 text-xs">{user.national_code}</td>
                                <td className="px-6 py-4 font-mono text-gray-600 text-xs">{user.mobile}</td>
                                <td className="px-6 py-4 text-gray-600 text-xs max-w-[150px] truncate" title={user.address_summary}>
                                    {user.address_summary}
                                </td>
                                <td className="px-6 py-4 font-bold text-primary-600">{user.total_score}</td>
                                <td className="px-6 py-4 text-gray-500 text-xs dir-ltr text-right">{user.participation_date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {participants.links.length > 3 && (
                <div className="p-4 border-t border-gray-100 flex justify-center no-print bg-gray-50">
                    <div className="flex gap-1 flex-wrap justify-center">
                        {participants.links.map((link: any, i: number) => {
                            if (link.label.includes('Previous')) return null;
                            if (link.label.includes('Next')) return null;
                            return (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition ${
                                        link.active 
                                        ? 'bg-primary-600 text-white shadow shadow-primary-500/30' 
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    } ${!link.url && 'opacity-50 pointer-events-none'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
            
            {participants.data.length === 0 && (
                <div className="p-12 text-center text-gray-400 bg-white">
                    <Users size={48} className="mx-auto mb-3 opacity-20" />
                    <p>هیچ شرکت‌کننده‌ای یافت نشد.</p>
                </div>
            )}
        </div>
    );
}