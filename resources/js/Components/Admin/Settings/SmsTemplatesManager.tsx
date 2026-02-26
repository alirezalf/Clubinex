import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus, Edit2, Trash2, X, MessageSquare } from 'lucide-react';

interface SmsTemplate {
    id: number;
    name: string;
    content: string;
    provider_template_id: string | null;
}

export default function SmsTemplatesManager({ templates = [] }: { templates?: SmsTemplate[] }) {
    const [editingTemplate, setEditingTemplate] = useState<SmsTemplate | null>(null);
    const [creating, setCreating] = useState(false);
    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        content: '',
        provider_template_id: ''
    });

    const generateRandomId = () => Math.floor(100000 + Math.random() * 900000).toString();

    const handleCreate = () => {
        setCreating(true);
        setData({
            name: '',
            content: '',
            provider_template_id: generateRandomId()
        });
    };

    const handleCancel = () => {
        setEditingTemplate(null);
        setCreating(false);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTemplate) {
            put(route('admin.sms-templates.update', editingTemplate.id), {
                onSuccess: handleCancel
            });
        } else {
            post(route('admin.sms-templates.store'), {
                onSuccess: handleCancel
            });
        }
    };

    const startEditing = (template: SmsTemplate) => {
        setEditingTemplate(template);
        setData({
            name: template.name,
            content: template.content || '',
            provider_template_id: template.provider_template_id || ''
        });
    };

    if (editingTemplate || creating) {
        return (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 animate-in fade-in space-y-6 shadow-sm">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                        {creating ? 'ایجاد قالب پیامک جدید' : `ویرایش قالب: ${editingTemplate?.name}`}
                    </h3>
                    <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">نام قالب (نمایشی)</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                                placeholder="مثلاً: کد ورود"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">شناسه در پنل پیامک (اختیاری)</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={data.provider_template_id}
                                    onChange={e => setData('provider_template_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-20 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition dir-ltr text-left"
                                    placeholder="مثلاً: 100234"
                                />
                                <button
                                    type="button"
                                    onClick={() => setData('provider_template_id', generateRandomId())}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-lg transition"
                                    title="تولید کد تصادفی جدید"
                                >
                                    تولید کد
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">برای سامانه sms.ir این شناسه الزامی است.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">متن پیامک</label>
                        <textarea
                            value={data.content}
                            onChange={e => setData('content', e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition min-h-[120px]"
                            placeholder="متن پیامک را اینجا بنویسید. از {variable} برای متغیرها استفاده کنید."
                        />
                        <p className="text-xs text-gray-500">
                            اگر شناسه پنل وارد شده باشد، این متن فقط برای نمایش در سیستم استفاده می‌شود.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium"
                        >
                            انصراف
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-8 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-bold shadow-lg shadow-primary-600/20"
                        >
                            {processing ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">مدیریت قالب‌های پیامک</h3>
                    <p className="text-sm text-gray-500 mt-1">تعریف قالب‌های پیامک برای استفاده در رویدادهای سیستم</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary-700 transition shadow-lg shadow-primary-600/20"
                >
                    <Plus size={18} />
                    قالب جدید
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {templates.map(template => (
                    <div key={template.id} className="group bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all duration-200 hover:border-primary-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-50 text-orange-600 p-3 rounded-xl group-hover:bg-orange-100 transition-colors">
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg">{template.name}</h4>
                                    {template.provider_template_id && (
                                        <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-1 inline-block dir-ltr">
                                            ID: {template.provider_template_id}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3 mb-4 min-h-[60px]">
                            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                {template.content || <span className="text-gray-400 italic">بدون متن پیش‌فرض</span>}
                            </p>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                            <button
                                onClick={() => startEditing(template)}
                                className="flex-1 py-2 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg text-sm font-medium transition flex justify-center items-center gap-2"
                            >
                                <Edit2 size={16} />
                                ویرایش
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm('آیا از حذف این قالب اطمینان دارید؟')) {
                                        destroy(route('admin.sms-templates.destroy', template.id));
                                    }
                                }}
                                className="px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                                title="حذف"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {templates.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <MessageSquare size={48} className="mb-3 opacity-20" />
                        <p>هنوز هیچ قالب پیامکی تعریف نشده است.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
