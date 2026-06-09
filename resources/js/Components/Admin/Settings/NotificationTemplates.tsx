
import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { BellRing, Edit2, Plus, X, Trash2 } from 'lucide-react';

interface Template {
    id: number;
    event_name?: string;
    title_fa: string;
    sms_active: boolean;
    sms_pattern: string;
    sms_template_id: number | null;
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

interface SmsTemplate {
    id: number;
    name: string;
    content: string;
    provider_template_id: string | null;
}

export default function NotificationTemplatesManager({ templates, emailThemes, smsTemplates = [] }: { templates: Template[], emailThemes: EmailTheme[], smsTemplates?: SmsTemplate[] }) {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { data: newData, setData: setNewData, post: postNew, processing: processingNew, reset: resetNew, errors: errorsNew } = useForm({
        event_name: '',
        title_fa: '',
        variables: '',
        sms_active: false,
        email_active: false,
        database_active: false,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        postNew(route('admin.notification-templates.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                resetNew();
            },
            preserveScroll: true
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="border-b pb-4 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">مدیریت رویدادها و اعلان‌ها</h3>
                    <p className="text-sm text-gray-500 mt-1">تنظیم سیستم اطلاع‌رسانی برای هر رویداد (ایمیل، پیامک، اعلان سایت)</p>
                </div>
                <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-bold flex gap-2 items-center">
                    <Plus size={16} />
                    افزودن رویداد اعلان
                </button>
            </div>

            <div className="space-y-4">
                {templates.map((template) => (
                    <TemplateEditor key={template.id} template={template} emailThemes={emailThemes} smsTemplates={smsTemplates} />
                ))}
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">ثبت رویداد جدید</h3>
                            <button onClick={() => setShowCreateModal(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">عنوان فارسی رویداد</label>
                                <input type="text" value={newData.title_fa} onChange={e => setNewData('title_fa', e.target.value)} className="w-full border rounded-lg px-3 py-2" required placeholder="مثال: تکمیل عضویت" />
                                {errorsNew.title_fa && <p className="text-red-500 text-xs mt-1">{errorsNew.title_fa}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 flex justify-between">
                                    <span>شناسه سیستمی (Event Name)</span>
                                    <span className="text-xs text-blue-500">فقط انگلیسی</span>
                                </label>
                                <input type="text" value={newData.event_name} onChange={e => setNewData('event_name', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} className="w-full border rounded-lg px-3 py-2 dir-ltr text-left" required placeholder="مثال: custom_event" list="notification-events" />
                                {errorsNew.event_name && <p className="text-red-500 text-xs mt-1">{errorsNew.event_name}</p>}
                                <p className="text-[10px] text-gray-500 mt-1">توابع سیستمی را دقیقاً مطابق نام برنامه‌نویسی وارد کنید. رویدادهای مرسوم: otp_login, welcome_user, reward_redemption, product_registered, ticket_reply, birthday_congratulation</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">متغیرهای قابل استفاده (راهنما)</label>
                                <input type="text" value={newData.variables} onChange={e => setNewData('variables', e.target.value)} className="w-full border rounded-lg px-3 py-2 dir-ltr text-left" placeholder="{name}, {code}" />
                            </div>

                            <div>
                                <p className="block text-sm font-bold mb-2">فعال‌سازی کانال‌های پیش‌فرض:</p>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer border p-2 rounded hover:bg-gray-50">
                                        <input type="checkbox" checked={newData.sms_active} onChange={e => setNewData('sms_active', e.target.checked)} className="rounded" /> پیامک
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer border p-2 rounded hover:bg-gray-50">
                                        <input type="checkbox" checked={newData.email_active} onChange={e => setNewData('email_active', e.target.checked)} className="rounded" /> ایمیل
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer border p-2 rounded hover:bg-gray-50">
                                        <input type="checkbox" checked={newData.database_active} onChange={e => setNewData('database_active', e.target.checked)} className="rounded" /> داشبورد کاربری
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">انصراف</button>
                                <button disabled={processingNew} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
                                    {processingNew ? 'در حال ثبت...' : 'درح و ادامه تنظیمات'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function TemplateEditor({ template, emailThemes, smsTemplates = [] }: { template: Template, emailThemes: EmailTheme[], smsTemplates?: SmsTemplate[] }) {
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const { data, setData, post, processing } = useForm({
        sms_active: Boolean(template.sms_active),
        sms_pattern: template.sms_pattern || '',
        sms_template_id: template.sms_template_id || '',
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

    const handleDelete = () => {
        if (confirm('آیا از حذف این رویداد اطمینان دارید؟')) {
            setDeleting(true);
            router.delete(route('admin.notification-templates.destroy', template.id), {
                preserveScroll: true,
                onFinish: () => setDeleting(false),
            });
        }
    };

    const isSystemTemplate = template.event_name && ['otp_login', 'welcome_user'].includes(template.event_name);

    if (!editing) {
        return (
            <div className="border border-gray-200 rounded-xl p-4 flex justify-between items-center hover:shadow-sm transition bg-white group opacity-100">
                <div className="flex items-center gap-3">
                    <div className="bg-primary-50 text-primary-600 p-2 rounded-lg">
                        <BellRing size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 flex gap-2 items-center">
                            {template.title_fa}
                            {template.event_name && <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1 py-0.5 rounded border">{template.event_name}</span>}
                        </h4>
                        <div className="flex gap-2 mt-1.5 text-xs text-gray-500">
                            {template.sms_active && <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">پیامک</span>}
                            {template.database_active && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">پنل</span>}
                            {template.email_active && <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">ایمیل</span>}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setEditing(true)} className="px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg text-sm border border-transparent hover:border-primary-100 transition flex items-center gap-2">
                        <Edit2 size={16} />
                    </button>
                    {!isSystemTemplate && (
                        <button onClick={handleDelete} disabled={deleting} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm border border-transparent hover:border-red-100 transition flex items-center gap-2 disabled:opacity-50">
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="border border-primary-200 bg-primary-50/20 rounded-xl p-6 space-y-5 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-primary-100 pb-3">
                <div>
                     <h4 className="font-bold text-primary-800 text-lg flex gap-2 items-center">
                         {template.title_fa}
                         {template.event_name && <span className="text-[10px] text-primary-500 font-mono bg-primary-100 px-1.5 py-0.5 rounded">{template.event_name}</span>}
                     </h4>
                </div>
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
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">انتخاب قالب پیامک</label>
                            <select
                                value={data.sms_template_id || ''}
                                onChange={e => setData('sms_template_id', e.target.value)}
                                className="w-full text-sm border border-gray-300 rounded-xl px-4 py-2 bg-white"
                            >
                                <option value="">-- انتخاب قالب (یا استفاده از متن دلخواه) --</option>
                                {smsTemplates.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.name} {t.provider_template_id ? `(ID: ${t.provider_template_id})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {!data.sms_template_id && (
                            <div className="animate-in fade-in">
                                <label className="block text-xs font-bold text-gray-600 mb-1">متن پیامک دلخواه (پیشرفته)</label>
                                <textarea
                                    value={data.sms_pattern}
                                    onChange={e => setData('sms_pattern', e.target.value)}
                                    className="w-full text-sm border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary-500 px-4 py-3"
                                    rows={2}
                                    placeholder="متن پیامک یا شناسه قالب (برای sms.ir)"
                                />
                                <p className="text-[10px] text-gray-500 mt-1 mr-1">
                                    نکته: اگر قالبی انتخاب نکنید، این متن ارسال می‌شود. برای sms.ir می‌توانید شناسه قالب را اینجا وارد کنید.
                                </p>
                            </div>
                        )}
                    </div>
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

