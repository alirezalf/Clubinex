import React from 'react';
import { FileSpreadsheet, Edit2, Trash2, List } from 'lucide-react';

export default function ProductTable({ products, onImportSerial, onEdit, onDelete, onManageSerials }: any) {
    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-6 py-4">شناسه</th>
                            <th className="px-6 py-4">نام محصول</th>
                            <th className="px-6 py-4">دسته‌بندی</th>
                            <th className="px-6 py-4">امتیاز</th>
                            <th className="px-6 py-4">وضعیت</th>
                            <th className="px-6 py-4">سریال‌ها</th>
                            <th className="px-6 py-4">عملیات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.data.map((product: any) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 text-gray-500">#{product.id}</td>
                                <td className="px-6 py-4 font-bold">
                                    {product.title}
                                    <div className="text-xs text-gray-400 font-normal">{product.model_name}</div>
                                </td>
                                <td className="px-6 py-4">{product.category?.title || '-'}</td>
                                <td className="px-6 py-4">{product.points_value}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {product.is_active ? 'فعال' : 'غیرفعال'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="bg-gray-100 px-2 py-1 rounded">{product.serials_count} کل</span>
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">{product.used_serials_count} مصرفی</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => onManageSerials(product)}
                                            className="text-purple-600 hover:bg-purple-50 p-1.5 rounded-lg transition"
                                            title="مدیریت سریال‌ها"
                                        >
                                            <List size={16} />
                                        </button>
                                        <button 
                                            onClick={() => onImportSerial(product)}
                                            className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg transition"
                                            title="ایمپورت اکسل سریال"
                                        >
                                            <FileSpreadsheet size={16} />
                                        </button>
                                        <button 
                                            onClick={() => onEdit(product)}
                                            className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition"
                                            title="ویرایش محصول"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => onDelete(product.id)}
                                            className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition"
                                            title="حذف محصول"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
