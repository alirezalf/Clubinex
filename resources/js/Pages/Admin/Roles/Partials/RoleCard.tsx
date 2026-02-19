import React from 'react';
import { Shield, Edit2, Trash2 } from 'lucide-react';

interface Role {
    id: number;
    name: string;
    permissions: { id: number; name: string }[];
}

interface Props {
    role: Role;
    onEdit: (role: Role) => void;
    onDelete: (id: number) => void;
}

export default function RoleCard({ role, onEdit, onDelete }: Props) {
    const isSuperAdmin = role.name === 'super-admin';

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl transition ${isSuperAdmin ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'}`}>
                        <Shield size={22} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">{role.name}</h3>
                        <span className="text-[10px] text-gray-400">{isSuperAdmin ? 'دسترسی کامل سیستم' : `${role.permissions.length} دسترسی`}</span>
                    </div>
                </div>
                
                {!isSuperAdmin && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => onEdit(role)} 
                            className="text-gray-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition" 
                            title="ویرایش"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button 
                            onClick={() => onDelete(role.id)} 
                            className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition" 
                            title="حذف"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-auto pt-2">
                {role.permissions.slice(0, 5).map(p => (
                    <span key={p.id} className="bg-gray-50 text-gray-600 px-2 py-1 rounded-lg text-[10px] border border-gray-100">
                        {p.name}
                    </span>
                ))}
                {role.permissions.length > 5 && (
                    <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-lg text-[10px] border border-gray-200 font-medium">
                        +{role.permissions.length - 5} دیگر
                    </span>
                )}
                {role.permissions.length === 0 && !isSuperAdmin && (
                    <span className="text-xs text-gray-400 italic">بدون دسترسی تعریف شده</span>
                )}
                {isSuperAdmin && (
                    <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-lg w-full text-center">
                        دارای تمام دسترسی‌ها
                    </span>
                )}
            </div>
        </div>
    );
}