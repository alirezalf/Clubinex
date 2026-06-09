import React, { useEffect, useMemo } from 'react';
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

const moduleNames: Record<string, string> = {
    users: 'کاربران',
    products: 'محصولات',
    categories: 'دسته‌بندی‌ها',
    rewards: 'جوایز',
    clubs: 'باشگاه‌ها',
    sliders: 'اسلایدرها',
    reports: 'گزارشات',
    settings: 'تنظیمات سیستم',
    tickets: 'پشتیبانی و تیکت',
    notifications: 'اعلان‌ها (پیامک/ایمیل)',
    gamification: 'گیمیفیکیشن و نظرسنجی',
    dashboard: 'داشبورد',
};

const actionNames: Record<string, string> = {
    view: 'مشاهده',
    create: 'ایجاد / ثبت',
    edit: 'ویرایش',
    delete: 'حذف',
    import: 'ایمپورت (ورود گروهی)',
    sync_wp: 'همگام‌سازی ووکامرس',
    approve: 'تایید',
};

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

    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {};
        allPermissions.forEach(p => {
            const moduleName = p.name.split('.')[0];
            if (!groups[moduleName]) {
                groups[moduleName] = [];
            }
            groups[moduleName].push(p);
        });
        return groups;
    }, [allPermissions]);

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

    const toggleGroup = (groupPermissions: Permission[]) => {
        const currentIds = data.permissions;
        const groupIds = groupPermissions.map(p => p.id);
        const allSelected = groupIds.every(id => currentIds.includes(id));

        if (allSelected) {
            setData('permissions', currentIds.filter(id => !groupIds.includes(id)));
        } else {
            setData('permissions', Array.from(new Set([...currentIds, ...groupIds])));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        <Shield size={20} className="text-primary-600" />
                        {role ? 'ویرایش نقش و دسترسی‌ها' : 'ایجاد نقش جدید'}
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
                                className="w-full sm:w-1/2 border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-left dir-ltr transition-shadow"
                                placeholder="e.g. manager, editor"
                                required
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                            <p className="text-xs text-gray-500 mt-1">نام سیستمی برای نقش. مثلا admin ، user یا writer. دقت کنید این نام باید به انگلیسی باشد.</p>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <label className="block text-base font-bold text-gray-800">تعیین سطح دسترسی (مجوزها)</label>
                                <button
                                    type="button"
                                    onClick={toggleAll}
                                    className="text-sm text-primary-600 hover:underline font-bold bg-primary-50 px-3 py-1.5 rounded-lg"
                                >
                                    {data.permissions.length === allPermissions.length ? 'لغو انتخاب تمامی مجوزها' : 'انتخاب تمامی مجوزها'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(groupedPermissions).map(([moduleName, perms]) => {
                                    const allSelected = perms.every(p => data.permissions.includes(p.id));
                                    const someSelected = perms.some(p => data.permissions.includes(p.id)) && !allSelected;

                                    return (
                                        <div key={moduleName} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                            <div className="bg-gray-50 p-3 border-b border-gray-200 flex justify-between items-center">
                                                <h4 className="font-bold text-gray-800 text-sm">{moduleNames[moduleName] || moduleName}</h4>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleGroup(perms)}
                                                    className="text-xs font-bold text-primary-600 hover:text-primary-800 flex items-center gap-1"
                                                >
                                                    <div className={clsx(
                                                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                                        allSelected ? "bg-primary-600 border-primary-600 text-white" :
                                                        someSelected ? "bg-primary-100 border-primary-600 text-primary-600" : "bg-white border-gray-400"
                                                    )}>
                                                        {allSelected ? <CheckSquare size={12} /> : someSelected ? <span className="w-2 h-2 rounded bg-primary-600"></span> : null}
                                                    </div>
                                                    انتخاب همه
                                                </button>
                                            </div>
                                            <div className="p-3 grid grid-cols-2 gap-3 bg-white">
                                                {perms.map(perm => {
                                                    const isSelected = data.permissions.includes(perm.id);
                                                    const actionPart = perm.name.split('.')[1] || perm.name;
                                                    const actionLabel = actionNames[actionPart] || actionPart;

                                                    return (
                                                        <label
                                                            key={perm.id}
                                                            className={clsx(
                                                                "flex items-center gap-2 cursor-pointer p-2 rounded-lg border transition-all select-none text-xs w-full",
                                                                isSelected
                                                                ? "bg-primary-50/50 border-primary-200 shadow-sm"
                                                                : "bg-white border-transparent hover:bg-gray-50"
                                                            )}
                                                        >
                                                            <div className={clsx(
                                                                "w-4 h-4 rounded shrink-0 flex items-center justify-center border transition-colors",
                                                                isSelected ? "bg-primary-600 border-primary-600" : "bg-white border-gray-300"
                                                            )}>
                                                                {isSelected && <CheckSquare size={10} className="text-white" />}
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => togglePermission(perm.id)}
                                                                className="hidden"
                                                            />
                                                            <span className={clsx("truncate mt-0.5", isSelected ? 'text-primary-800 font-bold' : 'text-gray-600')}>
                                                                {actionLabel}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-600 hover:bg-gray-200 rounded-xl transition border border-gray-300 font-medium bg-white"
                        >
                            انصراف
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-8 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/30 flex items-center gap-2 transition font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Save size={18} />
                            {processing ? 'در حال ذخیره...' : 'ذخیره سطح دسترسی'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
