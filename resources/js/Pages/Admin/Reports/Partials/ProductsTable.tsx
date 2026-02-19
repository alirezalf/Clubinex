import React from 'react';
import SortableHeader from './SortableHeader';

interface Props {
    data: any[];
    sort: any;
    onSort: (field: string) => void;
    from: number;
    type: string; // 'inventory', 'serials', 'registrations'
}

export default function ProductsTable({ data, sort, onSort, from, type }: Props) {
    return (
        <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                    <th className="px-6 py-4 w-16 text-center">#</th>
                    
                    {type === 'inventory' && (
                        <>
                            <SortableHeader label="محصول" field="title" onSort={() => onSort('title')} currentSort={sort.sort_by} dir={sort.sort_dir} />
                            <th className="px-6 py-4">دسته‌بندی</th>
                            <SortableHeader label="امتیاز" field="points_value" onSort={() => onSort('points_value')} currentSort={sort.sort_by} dir={sort.sort_dir} />
                            <th className="px-6 py-4">سریال‌های تعریف شده</th>
                            <th className="px-6 py-4">سریال‌های مصرفی</th>
                            <th className="px-6 py-4">وضعیت</th>
                        </>
                    )}

                    {type === 'serials' && (
                        <>
                            <th className="px-6 py-4">کد سریال</th>
                            <th className="px-6 py-4">محصول مرتبط</th>
                            <SortableHeader label="وضعیت" field="is_used" onSort={() => onSort('is_used')} currentSort={sort.sort_by} dir={sort.sort_dir} />
                            <th className="px-6 py-4">مصرف کننده</th>
                            <SortableHeader label="تاریخ مصرف" field="used_at" onSort={() => onSort('used_at')} currentSort={sort.sort_by} dir={sort.sort_dir} />
                        </>
                    )}

                    {type === 'registrations' && (
                        <>
                            <th className="px-6 py-4">درخواست دهنده</th>
                            <th className="px-6 py-4">محصول (اظهار شده)</th>
                            <th className="px-6 py-4">کد سریال</th>
                            <SortableHeader label="وضعیت" field="status" onSort={() => onSort('status')} currentSort={sort.sort_by} dir={sort.sort_dir} />
                            <th className="px-6 py-4">یادداشت</th>
                            <SortableHeader label="تاریخ درخواست" field="created_at" onSort={() => onSort('created_at')} currentSort={sort.sort_by} dir={sort.sort_dir} />
                        </>
                    )}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {data.map((item: any, index: number) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-center font-mono text-gray-400">{from + index}</td>

                        {type === 'inventory' && (
                            <>
                                <td className="px-6 py-4 font-bold text-gray-800">
                                    {item.title}
                                    <div className="text-xs text-gray-400 font-normal">{item.model_name}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 text-xs">{item.category?.title || '-'}</td>
                                <td className="px-6 py-4 font-bold text-green-600">{item.points_value}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono">{item.serials_count}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-mono">{item.used_serials_count}</span>
                                </td>
                                <td className="px-6 py-4">
                                    {item.is_active ? <span className="text-green-600 text-xs">فعال</span> : <span className="text-red-500 text-xs">غیرفعال</span>}
                                </td>
                            </>
                        )}

                        {type === 'serials' && (
                            <>
                                <td className="px-6 py-4 font-mono text-gray-600">{item.serial_code}</td>
                                <td className="px-6 py-4 text-gray-700 text-xs">{item.product?.title}</td>
                                <td className="px-6 py-4">
                                    {item.is_used ? (
                                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">مصرف شده</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">آزاد</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-medium text-xs">
                                    {item.user ? `${item.user.first_name} ${item.user.last_name}` : '-'}
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-xs">{item.used_at_jalali}</td>
                            </>
                        )}

                        {type === 'registrations' && (
                            <>
                                <td className="px-6 py-4 font-medium text-xs">
                                    {item.user ? `${item.user.first_name} ${item.user.last_name}` : '-'}
                                    <div className="text-gray-400">{item.user?.mobile}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-700 text-xs">
                                    {item.product_name}
                                    <div className="text-gray-400">{item.product_model}</div>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">{item.serial_code}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                        item.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {item.status_farsi}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-xs max-w-xs truncate" title={item.admin_note}>
                                    {item.admin_note || '-'}
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-xs">{item.created_at_jalali}</td>
                            </>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}