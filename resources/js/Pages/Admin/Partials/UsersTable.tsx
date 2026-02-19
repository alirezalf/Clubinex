import React from 'react';
import { Link } from '@inertiajs/react';
import { Edit, ShieldBan, CheckCircle, Eye } from 'lucide-react';
import SortableHeader from '@/Pages/Admin/Reports/Partials/SortableHeader'; 

interface Props {
    users: any[];
    filters: any;
    onSort: (field: string) => void;
    onEdit: (user: any) => void;
    onStatusToggle: (user: any) => void;
}

export default function UsersTable({ users, filters, onSort, onEdit, onStatusToggle }: Props) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                        <SortableHeader label="کاربر" field="first_name" onSort={onSort} currentSort={filters.sort_by} dir={filters.sort_dir} />
                        <SortableHeader label="موبایل" field="mobile" onSort={onSort} currentSort={filters.sort_by} dir={filters.sort_dir} />
                        <th className="px-6 py-4">باشگاه</th>
                        <SortableHeader label="امتیاز" field="current_points" onSort={onSort} currentSort={filters.sort_by} dir={filters.sort_dir} />
                        <SortableHeader label="آخرین ورود" field="last_login_at" onSort={onSort} currentSort={filters.sort_by} dir={filters.sort_dir} />
                        <th className="px-6 py-4">وضعیت</th>
                        <th className="px-6 py-4">عملیات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold overflow-hidden shrink-0">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            user.first_name?.[0] || 'U'
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-800">{user.first_name} {user.last_name}</span>
                                        <span className="text-xs text-gray-400">{user.email}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 ltr text-right">{user.mobile}</td>
                            <td className="px-6 py-4">
                                {user.club ? (
                                    <span 
                                        className="px-2 py-1 rounded text-xs text-white border"
                                        style={{ backgroundColor: user.club.color || '#666', borderColor: user.club.color }}
                                    >
                                        {user.club.name}
                                    </span>
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-700">
                                {(user.current_points || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-xs dir-ltr text-right">
                                {user.last_login_at_jalali}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status?.slug === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {user.status?.name || 'نامشخص'}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <Link 
                                        href={route('admin.rewards.user_history', { id: user.id, from: 'users' })}
                                        className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition border border-transparent hover:border-purple-100"
                                        title="سوابق جامع"
                                    >
                                        <Eye size={16} />
                                    </Link>
                                    <button 
                                        onClick={() => onEdit(user)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition border border-transparent hover:border-blue-100"
                                        title="ویرایش"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button 
                                        onClick={() => onStatusToggle(user)}
                                        className={`p-1.5 rounded-lg transition border border-transparent ${user.status?.slug === 'banned' ? 'text-green-600 hover:bg-green-50 hover:border-green-100' : 'text-red-600 hover:bg-red-50 hover:border-red-100'}`}
                                        title={user.status?.slug === 'banned' ? 'فعال‌سازی' : 'مسدود کردن'}
                                    >
                                        {user.status?.slug === 'banned' ? <CheckCircle size={16} /> : <ShieldBan size={16} />}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}