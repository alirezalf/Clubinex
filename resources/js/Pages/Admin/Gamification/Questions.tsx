import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Plus, Trash2, Save, AlertTriangle, List, Type, Hash, Star, Edit } from 'lucide-react';

export default function Questions({ survey, questions }: any) {
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
        question: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_option: 0,
        correct_text: '',
        correct_min: '',
        correct_max: '',
        points: 10
    });

    // Safe check for questions array
    const questionsList = Array.isArray(questions) ? questions : [];

    const handleEdit = (q: any) => {
        setEditingId(q.id);
        
        let correct_option = 0;
        let correct_text = '';
        let correct_min = '';
        let correct_max = '';

        if (q.correct_answer) {
            if (q.type === 'multiple_choice') correct_option = parseInt(q.correct_answer.selected_option);
            if (q.type === 'text') correct_text = q.correct_answer.text;
            if (q.type === 'number') {
                correct_min = q.correct_answer.min;
                correct_max = q.correct_answer.max;
            }
        }

        setData({
            question: q.question,
            type: q.type,
            options: q.options && q.options.length > 0 ? q.options : ['', '', '', ''],
            correct_option,
            correct_text,
            correct_min,
            correct_max,
            points: q.points
        });
        
        setAdding(true);
        clearErrors();
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelForm = () => {
        setAdding(false);
        setEditingId(null);
        reset();
        clearErrors();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingId) {
            put(route('admin.surveys.questions.update', editingId), {
                onSuccess: () => {
                    cancelForm();
                }
            });
        } else {
            post(route('admin.surveys.questions.store', survey.id), {
                onSuccess: () => {
                    cancelForm();
                }
            });
        }
    };

    const deleteQuestion = (id: number) => {
        if(confirm('آیا از حذف این سوال اطمینان دارید؟')) {
            router.delete(route('admin.surveys.questions.destroy', id));
        }
    };

    const getTypeLabel = (type: string) => {
        switch(type) {
            case 'multiple_choice': return 'چند گزینه‌ای';
            case 'text': return 'متنی (تشریحی/کلمه)';
            case 'number': return 'عددی';
            case 'rating': return 'امتیاز دهی';
            default: return type;
        }
    };

    const getTypeIcon = (type: string) => {
        switch(type) {
            case 'multiple_choice': return <List size={16} />;
            case 'text': return <Type size={16} />;
            case 'number': return <Hash size={16} />;
            case 'rating': return <Star size={16} />;
            default: return <List size={16} />;
        }
    };

    if (!survey) {
        return (
            <DashboardLayout>
                <div className="p-8 text-center text-red-500">
                    <AlertTriangle size={48} className="mx-auto mb-4" />
                    اطلاعات آزمون بارگذاری نشد.
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout breadcrumbs={[
            { label: 'بازی‌سازی', href: route('admin.gamification.index') },
            { label: `سوالات: ${survey.title || 'نامشخص'}` }
        ]}>
            <Head title="مدیریت سوالات" />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-gray-800">سوالات آزمون</h1>
                {!adding && (
                    <button onClick={() => { setAdding(true); setEditingId(null); reset(); }} className="bg-primary-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary-700 transition">
                        <Plus size={20} /> افزودن سوال
                    </button>
                )}
            </div>

            {adding && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-primary-200 mb-6 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800">
                        {editingId ? <Edit size={18} className="text-primary-600" /> : <Plus size={18} className="text-primary-600" />}
                        {editingId ? 'ویرایش سوال' : 'تعریف سوال جدید'}
                    </h3>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium mb-1">متن سوال</label>
                                <input 
                                    type="text" 
                                    placeholder="مثلا: پایتخت ایران کجاست؟" 
                                    value={data.question}
                                    onChange={e => setData('question', e.target.value)}
                                    className="w-full border-gray-300 rounded-xl px-4 py-2"
                                    required
                                />
                                {errors.question && <p className="text-red-500 text-xs mt-1">{errors.question}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">نوع سوال</label>
                                <select 
                                    value={data.type} 
                                    onChange={e => setData('type', e.target.value)}
                                    className="w-full border-gray-300 rounded-xl px-3 py-2"
                                >
                                    <option value="multiple_choice">چند گزینه‌ای</option>
                                    <option value="text">متنی (پاسخ کوتاه)</option>
                                    <option value="number">عددی</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* Multiple Choice Settings */}
                        {data.type === 'multiple_choice' && (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <label className="block text-sm font-bold text-gray-700 mb-3">گزینه‌ها (گزینه صحیح را انتخاب کنید)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {data.options.map((opt, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <input 
                                                type="radio" 
                                                name="correct" 
                                                checked={data.correct_option === i}
                                                onChange={() => setData('correct_option', i)}
                                                className="w-4 h-4 text-green-600 cursor-pointer"
                                                title="انتخاب به عنوان گزینه صحیح / هدف"
                                            />
                                            <input 
                                                type="text" 
                                                placeholder={`گزینه ${i+1}`}
                                                value={opt}
                                                onChange={e => {
                                                    const newOpts = [...data.options];
                                                    newOpts[i] = e.target.value;
                                                    setData('options', newOpts);
                                                }}
                                                className={`w-full border rounded-lg px-3 py-1.5 text-sm ${data.correct_option === i ? 'border-green-400 bg-green-50 ring-1 ring-green-200' : 'border-gray-300'}`}
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Text Settings */}
                        {data.type === 'text' && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                <label className="block text-sm font-bold text-blue-800 mb-2">پاسخ صحیح (برای تصحیح خودکار)</label>
                                <p className="text-xs text-blue-600 mb-2">کاربر باید دقیقاً این کلمه یا جمله را وارد کند.</p>
                                <input 
                                    type="text" 
                                    placeholder="مثلا: تهران" 
                                    value={data.correct_text}
                                    onChange={e => setData('correct_text', e.target.value)}
                                    className="w-full border-blue-300 rounded-lg px-4 py-2"
                                    required={survey.type === 'quiz'}
                                />
                            </div>
                        )}

                        {/* Number Settings */}
                        {data.type === 'number' && (
                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                                <label className="block text-sm font-bold text-orange-800 mb-2">محدوده پاسخ صحیح</label>
                                <p className="text-xs text-orange-600 mb-2">اگر پاسخ یک عدد دقیق است، حداقل و حداکثر را برابر وارد کنید.</p>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <input 
                                            type="number" 
                                            placeholder="حداقل (مثلا: 10)" 
                                            value={data.correct_min}
                                            onChange={e => setData('correct_min', e.target.value)}
                                            className="w-full border-orange-300 rounded-lg px-4 py-2"
                                            required={survey.type === 'quiz'}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input 
                                            type="number" 
                                            placeholder="حداکثر (مثلا: 20)" 
                                            value={data.correct_max}
                                            onChange={e => setData('correct_max', e.target.value)}
                                            className="w-full border-orange-300 rounded-lg px-4 py-2"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">امتیاز سوال</label>
                            <input 
                                type="number" 
                                value={data.points} 
                                onChange={e => setData('points', parseInt(e.target.value))} 
                                className="w-32 border-gray-300 rounded-xl px-3 py-2"
                            />
                        </div>

                        <div className="flex justify-end gap-2 border-t pt-4">
                            <button type="button" onClick={cancelForm} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">انصراف</button>
                            <button disabled={processing} className="bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700 transition flex items-center gap-2">
                                <Save size={18} />
                                {editingId ? 'ذخیره تغییرات' : 'ایجاد سوال'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {questionsList.length > 0 ? questionsList.map((q: any, index: number) => (
                    <div key={q.id} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start hover:shadow-sm transition gap-4">
                        <div className="flex-1 w-full">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-gray-100 w-6 h-6 rounded flex items-center justify-center text-xs text-gray-600 font-bold">{index + 1}</span>
                                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded flex items-center gap-1">
                                    {getTypeIcon(q.type)}
                                    {getTypeLabel(q.type)}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded border border-yellow-100">
                                    {q.points} امتیاز
                                </span>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-3 text-sm md:text-base">
                                {q.question}
                            </h4>
                            
                            {/* Display Answer/Options based on type */}
                            {q.type === 'multiple_choice' && Array.isArray(q.options) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {q.options.map((opt: string, i: number) => (
                                        <div key={i} className={q.correct_answer?.selected_option === i ? 'text-green-700 font-bold flex items-center gap-1 bg-green-50 px-2 py-1 rounded' : 'px-2 py-1'}>
                                            <span className={`w-2 h-2 rounded-full inline-block ${q.correct_answer?.selected_option === i ? 'bg-green-500' : 'bg-gray-300'}`}></span> {opt}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {q.type === 'text' && q.correct_answer?.text && (
                                <div className="text-sm bg-green-50 text-green-800 px-3 py-2 rounded-lg border border-green-100 inline-block">
                                    <span className="font-bold">پاسخ صحیح:</span> {q.correct_answer.text}
                                </div>
                            )}

                            {q.type === 'number' && (
                                <div className="text-sm bg-orange-50 text-orange-800 px-3 py-2 rounded-lg border border-orange-100 inline-block">
                                    <span className="font-bold">محدوده صحیح:</span> {q.correct_answer?.min} تا {q.correct_answer?.max}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button onClick={() => handleEdit(q)} className="text-blue-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition" title="ویرایش">
                                <Edit size={18} />
                            </button>
                            <button onClick={() => deleteQuestion(q.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition" title="حذف">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
                        <List size={48} className="mx-auto mb-3 opacity-20" />
                        <p>هنوز سوالی برای این آزمون تعریف نشده است.</p>
                        <button onClick={() => { setAdding(true); setEditingId(null); reset(); }} className="text-primary-600 font-bold mt-2 hover:underline">
                            ایجاد اولین سوال
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}