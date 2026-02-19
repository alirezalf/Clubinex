import React from 'react';
import SortableHeader from './SortableHeader';

export default function UsersTable({ data, sort, onSort, from, onShowStats }: any) {
    return (
        <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                    <th className="px-6 py-4 w-16 text-center">#</th>
                    <th className="px-6 py-4">نام کاربر</th>
                    <th className="px-6 py-4">موبایل</th>
                    <th className="px-6 py-4">باشگاه</th>
                    <SortableHeader label="موجودی امتیاز" field="current_points" onSort={() => onSort('current_points')} currentSort={sort.sort_by} dir={sort.sort_dir} />
                    <th className="px-6 py-4">مسابقات</th>
                    <SortableHeader label="تاریخ عضویت" field="created_at" onSort={() => onSort('created_at')} currentSort={sort.sort_by} dir={sort.sort_dir} />
                    <th className="px-6 py-4">جزئیات</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {data.map((item: any, index: number) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-center font-mono text-gray-400">{from + index}</td>
                        <td className="px-6 py-4 font-medium">{item.first_name} {item.last_name}</td>
                        <td className="px-6 py-4 text-gray-600">{item.mobile}</td>
                        <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                {item.club?.name || '---'}
                            </span>
                        </td>
                        <td className="px-6 py-4 font-bold">{item.current_points?.toLocaleString()}</td>
                        <td className="px-6 py-4">
                            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs">
                                {item.surveys_count} مورد
                            </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{item.created_at_jalali}</td>
                        <td className="px-6 py-4">
                            <button onClick={() => onShowStats(item.id)} className="text-primary-600 hover:text-primary-800 text-xs font-bold bg-primary-50 px-2 py-1 rounded">
                                سوابق
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}