import React from 'react';
import SortableHeader from './SortableHeader';

export default function RedemptionsTable({ data, sort, onSort, from }: any) {
    return (
        <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                    <th className="px-6 py-4 w-16 text-center">#</th>
                    <th className="px-6 py-4">کاربر</th>
                    <th className="px-6 py-4">جایزه</th>
                    <SortableHeader label="امتیاز پرداختی" field="points_spent" onSort={() => onSort('points_spent')} currentSort={sort.sort_by} dir={sort.sort_dir} />
                    <SortableHeader label="وضعیت" field="status" onSort={() => onSort('status')} currentSort={sort.sort_by} dir={sort.sort_dir} />
                    <SortableHeader label="تاریخ" field="created_at" onSort={() => onSort('created_at')} currentSort={sort.sort_by} dir={sort.sort_dir} />
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {data.map((item: any, index: number) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-center font-mono text-gray-400">{from + index}</td>
                        <td className="px-6 py-4 font-medium">{item.user?.first_name} {item.user?.last_name}</td>
                        <td className="px-6 py-4 text-gray-700">{item.reward?.title}</td>
                        <td className="px-6 py-4 font-bold">{item.points_spent}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                                item.status === 'completed' ? 'bg-green-100 text-green-700' :
                                item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                            }`}>
                                {item.status_farsi}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{item.created_at_jalali}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}