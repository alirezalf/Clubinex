import React from 'react';
import { useForm } from '@inertiajs/react';
import { Lock, Save } from 'lucide-react';
import FormInput from '@/Components/Form/FormInput';

export default function PasswordForm() {
    const { data, setData, post, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitPassword = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.password.update'), {
            onSuccess: () => reset()
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <Lock size={20} className="text-amber-500" /> تغییر رمز عبور
                </h2>
            </div>
            <form onSubmit={submitPassword} className="p-6 space-y-4">
                <FormInput label="رمز فعلی" type="password" value={data.current_password} onChange={e => setData('current_password', e.target.value)} error={errors.current_password} className="text-left dir-ltr" />
                <FormInput label="رمز جدید" type="password" value={data.password} onChange={e => setData('password', e.target.value)} error={errors.password} className="text-left dir-ltr" />
                <FormInput label="تکرار رمز جدید" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className="text-left dir-ltr" />
                
                <button type="submit" disabled={processing} className="w-full bg-amber-500 text-white px-6 py-2.5 rounded-xl hover:bg-amber-600 transition flex items-center justify-center gap-2 shadow-lg">
                    <Save size={18} /> تغییر رمز
                </button>
            </form>
        </div>
    );
}