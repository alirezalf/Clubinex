import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { BellRing, Edit2 } from 'lucide-react';

interface Template {
    id: number;
    title_fa: string;
    sms_active: boolean;
    sms_pattern: string;
    database_active: boolean;
    database_message: string;
    email_active: boolean;
    email_subject: string;
    email_body: string;
    email_theme_id: number | null;
    variables: string;
}

interface EmailTheme {
    id: number;
    name: string;
}

export default function TemplateEditor({ template, emailThemes }: { template: Template, emailThemes: EmailTheme[] }) {
    const [editing, setEditing] = useState(false);
    const { data, setData, post, processing } = useForm({
        sms_active: Boolean(template.sms_active),
        sms_pattern: template.sms_pattern || '',
        database_active: Boolean(template.database_active),
        database_message: template.database_message || '',
        email_active: Boolean(template.email_active),
        email_subject: template.email_subject || '',
        email_body: template.email_body || '',
        email_theme_id: template.email_theme_id || '', 
    });

    const handleSave = () => {
        post(route('admin.notification-templates.update', template.id), {
            onSuccess: () => setEditing(false),
            preserveScroll: true
        });
    };

    if (!editing) {
        return (
            <div className="border border-gray-200 rounded-xl p-4 flex justify-between items-center hover:shadow-sm transition bg-white group">
                <div className="flex items-center gap-3">
                    <div className="bg-primary-50 text-primary-600 p-2 rounded-lg">
                        <BellRing size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800">{template.title_fa}</h4>
                        <div className="flex gap-2 mt-1.5 text-xs text-gray-500">
                            {template.sms_active && <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">پیامک</span>}
                            {template.database_active && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">پنل</span>}
                            {template.email_active && <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">ایمیل</span>}
                        </div>
                    </div>
                </div>
                <button onClick={() => setEditing(true)} className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg text-sm border border-transparent hover:border-primary-100 transition flex items-center gap-2">
                    <Edit2 size={16} />
                    ویرایش
                </button>
            </div>
        );
    }

    return (
        <div className="border border-primary-200 bg-primary-50/20 rounded-xl p-6 space-y-5 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-primary-100 pb-3">
                <h4 className="font-bold text-primary-800 text-lg">{template.title_fa}</h4>
                <div className="text-xs text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                    <span className="font-bold ml-1">متغیرها:</span> 
                    <span className="dir-ltr inline-block font-mono text-primary-600">{template.variables}</span>
                </div>
            </div>
            
            <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={data.sms_active} onChange={e => setData('sms_active', e.target.checked)} className="rounded text-primary-600 w-5 h-5 focus:ring-primary-500" />
                    <span className="font-bold text-gray-700">ارسال پیامک</span>
                </label>
                {data.sms_active && (
                    <textarea value={data.sms_pattern} onChange={e => setData('sms_pattern', e.target.value)} className="w-full text-sm border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary-500 px-4 py-3" rows={2} />
                )}
            </div>
            
            <div className="space-y-3 pt-3 border-t border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={data.email_active} onChange={e => setData('email_active', e.target.checked)} className="rounded text-primary-600 w-5 h-5" />
                    <span className="font-bold text-gray-700">ارسال ایمیل</span>
                </label>
                {data.email_active && (
                    <div className="space-y-3">
                        <input type="text" value={data.email_subject} onChange={e => setData('email_subject', e.target.value)} className="w-full text-sm border border-gray-300 rounded-xl px-4 py-2" placeholder="موضوع" />
                        <select value={data.email_theme_id || ''} onChange={e => setData('email_theme_id', e.target.value)} className="w-full text-sm border border-gray-300 rounded-xl px-4 py-2">
                            <option value="">قالب ساده</option>
                            {emailThemes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <textarea value={data.email_body} onChange={e => setData('email_body', e.target.value)} className="w-full text-sm border border-gray-300 rounded-xl px-4 py-3" rows={3} placeholder="متن ایمیل (HTML)" />
                    </div>
                )}
            </div>
            
            <div className="space-y-3 pt-3 border-t border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={data.database_active} onChange={e => setData('database_active', e.target.checked)} className="rounded text-primary-600 w-5 h-5" />
                    <span className="font-bold text-gray-700">اعلان داخلی</span>
                </label>
                {data.database_active && (
                    <textarea value={data.database_message} onChange={e => setData('database_message', e.target.value)} className="w-full text-sm border border-gray-300 rounded-xl px-4 py-3" rows={2} />
                )}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-primary-100">
                <button onClick={() => setEditing(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl text-sm">انصراف</button>
                <button onClick={handleSave} disabled={processing} className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-bold shadow-md">ذخیره</button>
            </div>
        </div>
    );
}