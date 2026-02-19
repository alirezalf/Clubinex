import React from 'react';
import SortableHeader from './SortableHeader';

export default function TransactionsTable({ data, sort, onSort, from }: any) {
    return (
        <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                    <th className="px-6 py-4 w-16 text-center">#</th>
                    <SortableHeader label="کاربر" field="user_id" onSort={() => {}} />
                    <SortableHeader label="نوع" field="type" onSort={() => onSort('type')} currentSort={sort.sort_by} dir={sort.sort_dir} />
                    <th className="px-6 py-4">منبع</th>
                    <SortableHeader label="مقدار" field="amount" onSort={() => onSort('amount')} currentSort={sort.sort_by} dir={sort.sort_dir} />
                    <th className="px-6 py-4">توضیحات</th>
                    <SortableHeader label="تاریخ" field="created_at" onSort={() => onSort('created_at')} currentSort={sort.sort_by} dir={sort.sort_dir} />
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {data.map((item: any, index: number) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-center font-mono text-gray-400">{from + index}</td>
                        <td className="px-6 py-4 font-medium">{item.user?.first_name} {item.user?.last_name}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs ${item.amount && item.amount > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {item.type_farsi}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">{item.reference_label}</td>
                        <td className="px-6 py-4 font-bold dir-ltr text-right">{item.amount_with_sign}</td>
                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={item.description}>{item.description}</td>
                        <td className="px-6 py-4 text-gray-500">{item.created_at_jalali}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}