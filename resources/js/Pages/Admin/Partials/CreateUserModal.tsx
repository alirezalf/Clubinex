import React from 'react';
import { useForm } from '@inertiajs/react';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import FormInput from '@/Components/Form/FormInput';
import FormSelect from '@/Components/Form/FormSelect';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    clubs: any[];
    roles: any[];
}

export default function CreateUserModal({ isOpen, onClose, clubs, roles }: Props) {
    const { data, setData, post, processing, reset, errors } = useForm({
        first_name: '',
        last_name: '',
        mobile: '',
        password: '',
        club_id: '',
        current_points: 0,
        role: 'user',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => {
                onClose();
                reset();
            },
            preserveScroll: true
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            {/* Reduced max-width and adjusted padding */}
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                    <h3 className="font-bold text-base text-gray-800">تعریف کاربر جدید</h3>
                    <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
                </div>
                <form onSubmit={submit} className="p-5 space-y-3 overflow-y-auto">
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
                        label="شماره موبایل"
                        value={data.mobile}
                        onChange={e => setData('mobile', e.target.value)}
                        error={errors.mobile}
                        className="dir-ltr text-left font-mono py-2 text-sm"
                        placeholder="0912..."
                        required
                        containerClass="mb-0"
                    />
                    
                    <FormInput
                        label="رمز عبور"
                        type="text"
                        value={data.password}
                        onChange={e => setData('password', e.target.value)}
                        error={errors.password}
                        className="dir-ltr text-left py-2 text-sm"
                        placeholder="حداقل 6 کاراکتر"
                        required
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
                            label="نقش کاربری"
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
                        label="امتیاز اولیه"
                        type="number"
                        value={data.current_points}
                        onChange={e => setData('current_points', parseInt(e.target.value) || 0)}
                        error={errors.current_points}
                        className="py-2 text-sm"
                        containerClass="mb-0"
                    />

                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm">انصراف</button>
                        <button disabled={processing} className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-bold flex items-center gap-2 shadow text-sm">
                            {processing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                            ذخیره
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}