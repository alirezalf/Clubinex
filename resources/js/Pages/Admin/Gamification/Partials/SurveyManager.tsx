import React, { useState } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import { Target, Plus, Trophy, Hash, Star, Clock, Edit2, ListChecks, Loader2, Copy, Power, Trash2, X } from 'lucide-react';
import PersianDatePicker from '@/Components/PersianDatePicker';

interface Survey {
    id: number;
    title: string;
    type: string;
    participants_count: number; 
    is_active: number;
    description: string;
    starts_at: string; 
    ends_at: string;
    duration_minutes: number;
    starts_at_jalali?: string;
    ends_at_jalali?: string;
    questions_count?: number;
    questions_sum_points?: number;
}

interface Props {
    surveys: Survey[];
}

export default function SurveyManager({ surveys }: Props) {
    const [showSurveyModal, setShowSurveyModal] = useState(false);
    const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
    const [duplicatingId, setDuplicatingId] = useState<number | null>(null);

    // Form for Adding/Editing Survey
    const { data, setData, post, put, processing, reset } = useForm({
        title: '',
        description: '',
        type: 'quiz', // quiz, poll
        starts_at: '',
        ends_at: '',
        duration_minutes: '',
        is_active: true
    });

    const openSurveyModal = (survey: Survey | null = null) => {
        if (survey) {
            setEditingSurvey(survey);
            setData({
                title: survey.title,
                description: survey.description,
                type: survey.type,
                starts_at: survey.starts_at || '',
                ends_at: survey.ends_at || '',
                duration_minutes: survey.duration_minutes ? String(survey.duration_minutes) : '',
                is_active: Boolean(survey.is_active)
            });
        } else {
            setEditingSurvey(null);
            reset();
        }
        setShowSurveyModal(true);
    };

    const submitSurvey = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSurvey) {
                put(route('admin.surveys.update', editingSurvey.id), {
                    onSuccess: () => {
                        setShowSurveyModal(false);
                        reset();
                    }
                });
            } else {
                post(route('admin.surveys.store'), {
                    onSuccess: () => {
                        setShowSurveyModal(false);
                        reset();
                    }
                });
            }
        } catch (error) {
            console.error(error);
            alert('خطا در ذخیره‌سازی.');
        }
    };

    const handleDuplicateSurvey = (id: number) => {
        if(confirm('آیا از کپی کردن این مسابقه (شامل تمام سوالات) اطمینان دارید؟')) {
            try {
                router.post(route('admin.surveys.duplicate', id), {}, {
                    preserveScroll: true,
                    onStart: () => setDuplicatingId(id),
                    onFinish: () => setDuplicatingId(null),
                });
            } catch (error) {
                console.error(error);
            }
        }
    }

    const handleDeleteSurvey = (id: number) => {
        if(confirm('آیا از حذف این مسابقه اطمینان دارید؟')) {
            try {
                router.delete(route('admin.surveys.destroy', id), {
                    preserveScroll: true
                });
            } catch (error) {
                alert('خطا در حذف.');
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Target size={24} /></div>
                    <h2 className="text-xl font-bold text-gray-800">مسابقات و نظرسنجی</h2>
                </div>
                <button onClick={() => openSurveyModal()} className="text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1 shadow-md">
                    <Plus size={16} /> مسابقه جدید
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {(surveys && surveys.length > 0) ? surveys.map((survey) => (
                    <div key={survey.id} className="p-4 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center last:border-0 hover:bg-gray-50 transition gap-4">
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-800">{survey.title}</h4>
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-2">
                                <span className="flex items-center gap-1"><Trophy size={12} /> {survey.type === 'quiz' ? 'مسابقه' : 'نظرسنجی'}</span>
                                <span className="flex items-center gap-1"><Hash size={12} /> {survey.questions_count || 0} سوال</span>
                                <span className="flex items-center gap-1"><Star size={12} /> {survey.questions_sum_points || 0} امتیاز</span>
                                {survey.duration_minutes && (
                                    <span className="flex items-center gap-1"><Clock size={12} /> {survey.duration_minutes} دقیقه</span>
                                )}
                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">{survey.participants_count} شرکت‌کننده</span>
                            </div>
                            {(survey.starts_at_jalali || survey.ends_at_jalali) && (
                                <div className="text-[10px] text-gray-400 mt-1 flex gap-3">
                                    {survey.starts_at_jalali && <span>شروع: {survey.starts_at_jalali}</span>}
                                    {survey.ends_at_jalali && <span>پایان: {survey.ends_at_jalali}</span>}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1 self-end sm:self-auto">
                            <button 
                                onClick={() => openSurveyModal(survey)}
                                className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition"
                                title="ویرایش تنظیمات"
                            >
                                <Edit2 size={18} />
                            </button>
                            <Link 
                                href={route('admin.surveys.questions', survey.id)}
                                className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition"
                                title="مدیریت سوالات"
                            >
                                <ListChecks size={18} />
                            </Link>
                            <button 
                                onClick={() => handleDuplicateSurvey(survey.id)}
                                disabled={duplicatingId === survey.id}
                                className="text-gray-400 hover:text-purple-600 p-2 hover:bg-purple-50 rounded-lg transition disabled:opacity-50"
                                title="کپی مسابقه"
                            >
                                {duplicatingId === survey.id ? (
                                    <Loader2 size={18} className="animate-spin text-purple-600" />
                                ) : (
                                    <Copy size={18} />
                                )}
                            </button>
                            <button 
                                onClick={() => router.post(route('admin.surveys.toggle', survey.id), {}, { preserveScroll: true })}
                                className={`p-2 rounded-lg transition ${survey.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                title={survey.is_active ? 'فعال (کلیک برای غیرفعال کردن)' : 'غیرفعال (کلیک برای فعال کردن)'}
                            >
                                <Power size={18} />
                            </button>
                            <button 
                                onClick={() => handleDeleteSurvey(survey.id)}
                                className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition"
                                title="حذف مسابقه"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="p-6 text-center text-gray-500">مسابقه‌ای وجود ندارد.</div>
                )}
            </div>

            {/* Survey Modal (Create / Edit) */}
            {showSurveyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h3 className="font-bold text-lg text-gray-800">
                                {editingSurvey ? `ویرایش: ${editingSurvey.title}` : 'تعریف مسابقه جدید'}
                            </h3>
                            <button onClick={() => setShowSurveyModal(false)}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <form onSubmit={submitSurvey} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">عنوان مسابقه</label>
                                <input 
                                    type="text" 
                                    value={data.title} 
                                    onChange={e => setData('title', e.target.value)} 
                                    className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 border" 
                                    placeholder="مثلا: مسابقه اطلاعات عمومی نوروز"
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">توضیحات</label>
                                <textarea 
                                    value={data.description} 
                                    onChange={e => setData('description', e.target.value)} 
                                    className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 border" 
                                    rows={3}
                                    placeholder="توضیحاتی در مورد مسابقه و جوایز..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">نوع</label>
                                    <select 
                                        value={data.type} 
                                        onChange={e => setData('type', e.target.value)} 
                                        className="w-full border-gray-300 rounded-lg p-2.5 border"
                                    >
                                        <option value="quiz">مسابقه (آزمون)</option>
                                        <option value="poll">نظرسنجی</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">مدت زمان (دقیقه)</label>
                                    <input 
                                        type="number" 
                                        value={data.duration_minutes} 
                                        onChange={e => setData('duration_minutes', e.target.value)} 
                                        className="w-full border-gray-300 rounded-lg p-2.5 border"
                                        placeholder="خالی = نامحدود" 
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={data.is_active} 
                                        onChange={e => setData('is_active', e.target.checked)} 
                                        className="rounded text-blue-600 focus:ring-blue-500 w-5 h-5 border-gray-300 border"
                                    />
                                    <span className="text-sm font-medium text-gray-700">فعال باشد</span>
                                </label>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <PersianDatePicker 
                                        label="شروع از (تاریخ و ساعت)"
                                        value={data.starts_at}
                                        onChange={(date) => setData('starts_at', date)}
                                        placeholder="انتخاب زمان"
                                        withTime={true} 
                                    />
                                </div>
                                <div>
                                    <PersianDatePicker 
                                        label="پایان در (تاریخ و ساعت)"
                                        value={data.ends_at}
                                        onChange={(date) => setData('ends_at', date)}
                                        placeholder="انتخاب زمان"
                                        withTime={true} 
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2 gap-2">
                                <button type="button" onClick={() => setShowSurveyModal(false)} className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-600">
                                    انصراف
                                </button>
                                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">
                                    {editingSurvey ? 'ذخیره تغییرات' : 'ایجاد مسابقه'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}