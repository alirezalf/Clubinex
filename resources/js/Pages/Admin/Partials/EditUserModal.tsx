import React, { useEffect, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { X, Key, Save, ShieldAlert, Loader2, Shield, User } from 'lucide-react';
import FormInput from '@/Components/Form/FormInput';
import FormSelect from '@/Components/Form/FormSelect';

interface Props {
    user: any;
    onClose: () => void;
    clubs: any[];
    roles: any[];
    allPermissions?: Record<string, any[]>; // Grouped permissions
}

export default function EditUserModal({ user, onClose, clubs, roles, allPermissions = {} }: Props) {
    const [activeTab, setActiveTab] = useState<'info' | 'permissions'>('info');

    const { data, setData, put, processing, reset, errors } = useForm({
        first_name: '',
        last_name: '',
        mobile: '',
        email: '',
        club_id: '',
        current_points: 0,
        role: '',
        permissions: [] as string[],
    });

    useEffect(() => {
        if (user) {
            setData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                mobile: user.mobile || '',
                email: user.email || '',
                club_id: user.club ? String(user.club.id) : '',
                current_points: user.current_points || 0,
                role: user.roles && user.roles.length > 0 ? user.roles[0].name : 'user',
                permissions: user.direct_permissions || [], // پرمیشن‌های مستقیم
            });
            setActiveTab('info');
        }
    }, [user]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        put(route('admin.users.update', user.id), {
            onSuccess: () => {
                onClose();
                reset();
            },
            preserveScroll: true
        });
    };

    const resetPassword = () => {
        if (!user) return;

        const newPass = prompt("رمز عبور جدید را وارد کنید (خالی بگذارید تا لغو شود):");
        if (newPass) {
            router.post(route('admin.users.reset-password', user.id), {
                password: newPass
            }, {
                onSuccess: () => alert('رمز عبور با موفقیت تغییر کرد.'),
                preserveScroll: true
            });
        }
    };

    const togglePermission = (permName: string) => {
        if (data.permissions.includes(permName)) {
            setData('permissions', data.permissions.filter(p => p !== permName));
        } else {
            setData('permissions', [...data.permissions, permName]);
        }
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                    <h3 className="font-bold text-base text-gray-800 truncate max-w-[200px]">ویرایش: {user.first_name} {user.last_name}</h3>
                    <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 bg-white px-4 pt-2">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'info' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        <User size={16} /> اطلاعات کاربری
                    </button>
                    <button
                        onClick={() => setActiveTab('permissions')}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'permissions' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        <Shield size={16} /> دسترسی‌ها
                    </button>
                </div>
                
                <form onSubmit={submit} className="flex-1 overflow-hidden flex flex-col">
                    <div className="p-5 overflow-y-auto flex-1">
                        {activeTab === 'info' && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-2 gap-3">
                                    <FormInput
                                        label="نام"
                                        value={data.first_name}
                                        onChange={e => setData('first_name', e.target.value)}
                                        error={errors.first_name}
                                        required
                                        className="py-2 text-sm"
                                        containerClass="mb-0"
                                    />
                                    <FormInput
                                        label="نام خانوادگی"
                                        value={data.last_name}
                                        onChange={e => setData('last_name', e.target.value)}
                                        error={errors.last_name}
                                        required
                                        className="py-2 text-sm"
                                        containerClass="mb-0"
                                    />
                                </div>
                                
                                <FormInput
                                    label="موبایل"
                                    value={data.mobile}
                                    onChange={e => setData('mobile', e.target.value)}
                                    error={errors.mobile}
                                    className="dir-ltr text-left font-mono py-2 text-sm"
                                    required
                                    containerClass="mb-0"
                                />

                                <FormInput
                                    label="ایمیل"
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    error={errors.email}
                                    className="dir-ltr text-left py-2 text-sm"
                                    containerClass="mb-0"
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <FormSelect
                                        label="باشگاه"
                                        value={data.club_id}
                                        onChange={e => setData('club_id', e.target.value)}
                                        error={errors.club_id}
                                        className="py-2 text-sm"
                                        containerClass="mb-0"
                                    >
                                        <option value="">انتخاب...</option>
                                        {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </FormSelect>
                                    
                                    <FormSelect
                                        label="نقش کاربری (Role)"
                                        value={data.role}
                                        onChange={e => setData('role', e.target.value)}
                                        error={errors.role}
                                        className="py-2 text-sm"
                                        containerClass="mb-0"
                                    >
                                        {roles.map(role => (
                                            <option key={role.id} value={role.name}>{role.name}</option>
                                        ))}
                                    </FormSelect>
                                </div>

                                <FormInput
                                    label="امتیاز فعلی"
                                    type="number"
                                    value={data.current_points}
                                    onChange={e => setData('current_points', parseInt(e.target.value) || 0)}
                                    error={errors.current_points}
                                    className="py-2 text-sm"
                                    containerClass="mb-0"
                                />

                                {/* Security Zone */}
                                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100 flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2 text-amber-800 text-xs">
                                        <ShieldAlert size={16} />
                                        <span>امنیت</span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={resetPassword} 
                                        className="bg-white border border-amber-200 text-amber-700 hover:bg-amber-100 px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                                    >
                                        <Key size={12} /> ریست رمز
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'permissions' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-xs text-blue-700 mb-4">
                                    توجه: این بخش برای اعطای دسترسی مستقیم (اضافه بر نقش) است. معمولاً مدیریت نقش‌ها کافیست.
                                </div>
                                
                                {Object.entries(allPermissions).map(([group, perms]: [string, any[]]) => (
                                    <div key={group} className="border border-gray-100 rounded-xl overflow-hidden">
                                        <div className="bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 uppercase border-b border-gray-100">
                                            {group}
                                        </div>
                                        <div className="p-3 grid grid-cols-2 gap-2">
                                            {perms.map(p => (
                                                <label key={p.id} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-gray-50 rounded transition">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={data.permissions.includes(p.name)} 
                                                        onChange={() => togglePermission(p.name)}
                                                        className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4" 
                                                    />
                                                    <span className="text-xs text-gray-600 font-mono">{p.name.split('.')[1] || p.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 p-4 border-t border-gray-100 bg-gray-50 shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition text-sm">انصراف</button>
                        <button type="submit" disabled={processing} className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow flex items-center gap-2 transition font-bold text-sm">
                            {processing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            ذخیره تغییرات
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
