import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus, Edit2, Trash2, X, Code } from 'lucide-react';
import { InputGroup } from './SharedInputs';

interface EmailTheme {
    id: number;
    name: string;
    content: string;
    styles: string | null;
}

export default function EmailThemesManager({ themes = [] }: { themes?: EmailTheme[] }) {
    const [editingTheme, setEditingTheme] = useState<EmailTheme | null>(null);
    const [creating, setCreating] = useState(false);
    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        name: '',
        content: '<!DOCTYPE html><html><body><div style="padding: 20px;">{content}</div></body></html>',
        styles: ''
    });

    const handleCancel = () => { setEditingTheme(null); setCreating(false); reset(); };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTheme) put(route('admin.email-themes.update', editingTheme.id), { onSuccess: handleCancel });
        else post(route('admin.email-themes.store'), { onSuccess: handleCancel });
    };

    if (editingTheme || creating) {
        return (
            <div className="animate-in fade-in space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                    <h3 className="text-lg font-bold text-gray-800">{creating ? 'قالب جدید' : `ویرایش: ${editingTheme?.name}`}</h3>
                    <button onClick={handleCancel}><X size={20} className="text-gray-500" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputGroup label="نام قالب" name="name" value={data.name} onChange={setData} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">HTML</label>
                        <textarea value={data.content} onChange={e => setData('content', e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 font-mono text-xs dir-ltr" rows={10} />
                    </div>
                    <div className="flex justify-end gap-3"><button type="button" onClick={handleCancel} className="px-4 py-2 border rounded-xl">انصراف</button><button disabled={processing} className="px-6 py-2 bg-primary-600 text-white rounded-xl">ذخیره</button></div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-lg font-bold text-gray-800">قالب‌های ایمیل</h3>
                <button onClick={() => { setCreating(true); reset(); }} className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2"><Plus size={16} /> جدید</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {themes.map(theme => (
                    <div key={theme.id} className="border border-gray-200 rounded-xl p-4 bg-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg"><Code size={20} /></div>
                            <span className="font-bold text-gray-800">{theme.name}</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setEditingTheme(theme); setData({name: theme.name, content: theme.content, styles: theme.styles || ''}); }} className="p-2 text-primary-600 bg-primary-50 rounded-lg"><Edit2 size={16} /></button>
                            <button onClick={() => { if(confirm('حذف؟')) destroy(route('admin.email-themes.destroy', theme.id)); }} className="p-2 text-red-600 bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};