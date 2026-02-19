import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Shield, X, Save, CheckSquare } from 'lucide-react';
import clsx from 'clsx';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    role: Role | null;
    allPermissions: Permission[];
}

export default function RoleModal({ isOpen, onClose, role, allPermissions }: Props) {
    const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
        name: '',
        permissions: [] as number[]
    });

    useEffect(() => {
        if (isOpen) {
            if (role) {
                setData({
                    name: role.name,
                    permissions: role.permissions.map(p => p.id)
                });
            } else {
                reset();
            }
            clearErrors();
        }
    }, [isOpen, role]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (role) {
            put(route('admin.roles.update', role.id), {
                onSuccess: () => onClose()
            });
        } else {
            post(route('admin.roles.store'), {
                onSuccess: () => onClose()
            });
        }
    };

    const togglePermission = (id: number) => {
        const current = [...data.permissions];
        if (current.includes(id)) {
            setData('permissions', current.filter(pId => pId !== id));
        } else {
            setData('permissions', [...current, id]);
        }
    };

    const toggleAll = () => {
        if (data.permissions.length === allPermissions.length) {
            setData('permissions', []);
        } else {
            setData('permissions', allPermissions.map(p => p.id));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        <Shield size={20} className="text-primary-600" />
                        {role ? 'ویرایش نقش' : 'ایجاد نقش جدید'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition hover:bg-gray-100 rounded-full p-1">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
                    <div className="p-6 space-y-6 overflow-y-auto">
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">نام نقش (انگلیسی)</label>
                            <input 
                                type="text" 
                                value={data.name} 
                                onChange={e => setData('name', e.target.value)} 
                                className="w-full border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-left dir-ltr transition-shadow" 
                                placeholder="e.g. manager, editor"
                                required 
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-bold text-gray-700">دسترسی‌ها</label>
                                <button 
                                    type="button" 
                                    onClick={toggleAll}
                                    className="text-xs text-primary-600 hover:underline font-medium"
                                >
                                    {data.permissions.length === allPermissions.length ? 'لغو انتخاب همه' : 'انتخاب همه'}
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                {allPermissions.map(perm => {
                                    const isSelected = data.permissions.includes(perm.id);
                                    return (
                                        <label 
                                            key={perm.id} 
                                            className={clsx(
                                                "flex items-center gap-2 cursor-pointer p-2 rounded-lg border transition-all select-none text-xs",
                                                isSelected 
                                                ? "bg-primary-50 border-primary-200 shadow-sm" 
                                                : "bg-white border-transparent hover:border-gray-200"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-4 h-4 rounded flex items-center justify-center border transition-colors",
                                                isSelected ? "bg-primary-500 border-primary-500" : "bg-white border-gray-300"
                                            )}>
                                                {isSelected && <CheckSquare size={10} className="text-white" />}
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected} 
                                                onChange={() => togglePermission(perm.id)}
                                                className="hidden"
                                            />
                                            <span className={clsx("truncate", isSelected ? 'text-primary-700 font-bold' : 'text-gray-600')}>
                                                {perm.name}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50 shrink-0">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition border border-gray-200 font-medium"
                        >
                            انصراف
                        </button>
                        <button 
                            type="submit" 
                            disabled={processing} 
                            className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/30 flex items-center gap-2 transition font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Save size={18} />
                            {processing ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}