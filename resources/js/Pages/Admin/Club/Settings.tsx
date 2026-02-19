import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps } from '@/types';
import { Award, Save, Edit2, Shield, Zap, Plus, X, Settings as SettingsIcon, Trash2, List, Image as ImageIcon } from 'lucide-react';

export default function ClubSettings({ clubs, rules, flash }: any) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Create Club Form
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        slug: '',
        min_points: '',
        max_points: '',
        joining_cost: '', 
        color: '#000000',
        icon: 'star',
        is_tier: true, // Default to Tier
        benefits: [] as string[],
        image: null as File | null
    });

    const [newBenefit, setNewBenefit] = useState('');

    const addBenefit = () => {
        if (newBenefit.trim()) {
            setData('benefits', [...data.benefits, newBenefit.trim()]);
            setNewBenefit('');
        }
    };

    const removeBenefit = (index: number) => {
        const newBenefits = [...data.benefits];
        newBenefits.splice(index, 1);
        setData('benefits', newBenefits);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.clubs.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
                setNewBenefit('');
            }
        });
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'تنظیمات باشگاه' }]}>
            <Head title="تنظیمات باشگاه" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Club Settings (Daily Limit) */}
                <div className="lg:col-span-2">
                    <GeneralClubSettings />
                </div>

                {/* Club Levels */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Shield className="text-primary-600" />
                            سطوح و باشگاه‌ها
                        </h2>
                        <button onClick={() => setShowCreateModal(true)} className="text-sm bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 flex items-center gap-1">
                            <Plus size={16} /> افزودن
                        </button>
                    </div>
                    {clubs && clubs.map((club: any) => (
                        <ClubCard key={club.id} club={club} />
                    ))}
                </div>

                {/* Point Rules */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Zap className="text-amber-500" />
                        قوانین امتیازدهی
                    </h2>
                    {rules && rules.map((rule: any) => (
                        <RuleCard key={rule.id} rule={rule} />
                    ))}
                </div>
            </div>

            {/* Create Club Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">تعریف باشگاه جدید</h3>
                            <button onClick={() => setShowCreateModal(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <form onSubmit={submitCreate} className="p-6 space-y-4">
                            <div className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        checked={data.is_tier} 
                                        onChange={() => setData('is_tier', true)}
                                        className="text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-sm font-bold">سطح اصلی (Level)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        checked={!data.is_tier} 
                                        onChange={() => setData('is_tier', false)}
                                        className="text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-sm font-bold">باشگاه ویژه (Room)</span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">نام باشگاه</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">نامک (انگلیسی)</label>
                                <input type="text" value={data.slug} onChange={e => setData('slug', e.target.value)} className="w-full border rounded-lg px-3 py-2 dir-ltr text-left" required placeholder="example: gold" />
                                {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">حداقل امتیاز (Tier)</label>
                                    <input type="number" value={data.min_points} onChange={e => setData('min_points', e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
                                    {errors.min_points && <p className="text-red-500 text-xs mt-1">{errors.min_points}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">هزینه عضویت</label>
                                    <input type="number" value={data.joining_cost} onChange={e => setData('joining_cost', e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="0 = رایگان" />
                                    {errors.joining_cost && <p className="text-red-500 text-xs mt-1">{errors.joining_cost}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">رنگ</label>
                                <input type="color" value={data.color} onChange={e => setData('color', e.target.value)} className="w-full h-10 border rounded-lg px-1 py-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">تصویر (اختیاری)</label>
                                <input type="file" onChange={e => setData('image', e.target.files ? e.target.files[0] : null)} className="w-full border rounded-lg px-3 py-2 text-sm" accept="image/*" />
                                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                            </div>

                            {/* Benefits Section */}
                            <div>
                                <label className="block text-sm font-medium mb-1">ویژگی‌ها و مزایا</label>
                                <div className="flex gap-2 mb-2">
                                    <input 
                                        type="text" 
                                        value={newBenefit} 
                                        onChange={e => setNewBenefit(e.target.value)} 
                                        className="w-full border rounded-lg px-3 py-2 text-sm" 
                                        placeholder="مثلا: ارسال رایگان..."
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addBenefit(); } }}
                                    />
                                    <button type="button" onClick={addBenefit} className="bg-gray-100 px-3 rounded-lg hover:bg-gray-200">
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    {data.benefits.map((b, i) => (
                                        <div key={i} className="flex justify-between items-center bg-blue-50 px-3 py-1.5 rounded-lg text-sm text-blue-700">
                                            <span>{b}</span>
                                            <button type="button" onClick={() => removeBenefit(i)} className="text-blue-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">انصراف</button>
                                <button disabled={processing} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
                                    {processing && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>}
                                    ذخیره
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

// Component for Global Settings (Daily Limit)
const GeneralClubSettings = () => {
    const { data, setData, post, processing } = useForm({
        daily_point_limit: '' 
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('admin.settings.update'), {
            daily_point_limit: data.daily_point_limit
        });
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                <SettingsIcon className="text-gray-600" />
                تنظیمات عمومی امتیازات
            </h2>
            <form onSubmit={submit} className="flex items-end gap-4">
                <div className="flex-1 max-w-md">
                    <label className="block text-sm font-medium mb-1 text-gray-700">سقف امتیاز روزانه (0 = نامحدود)</label>
                    <input 
                        type="number" 
                        value={data.daily_point_limit} 
                        onChange={e => setData('daily_point_limit', e.target.value)} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-primary-500 focus:border-primary-500" 
                        placeholder="مثلا 1000"
                    />
                </div>
                <button disabled={processing} className="bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700 transition h-10 mb-0.5">
                    ذخیره تنظیمات
                </button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
                کاربران در هر روز بیشتر از این مقدار امتیاز (از طریق فعالیت‌های مختلف) کسب نخواهند کرد.
            </p>
        </div>
    );
}

const ClubCard = ({ club }: any) => {
    const { data, setData, post, processing } = useForm({
        name: club.name,
        min_points: club.min_points,
        joining_cost: club.joining_cost,
        color: club.color,
        is_tier: Boolean(club.is_tier),
        benefits: Array.isArray(club.benefits) ? club.benefits : [] as string[],
        image: null as File | null,
        _method: 'POST' // Required for file upload with router.post mimicking put
    });
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [newBenefit, setNewBenefit] = useState('');

    const addBenefit = () => {
        if (newBenefit.trim()) {
            setData('benefits', [...data.benefits, newBenefit.trim()]);
            setNewBenefit('');
        }
    };

    const removeBenefit = (index: number) => {
        const newBenefits = [...data.benefits];
        newBenefits.splice(index, 1);
        setData('benefits', newBenefits);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Use post with forceFormData for file uploads in updates
        post(route('admin.clubs.update', club.id), {
            forceFormData: true,
            onSuccess: () => setEditing(false)
        });
    };

    const deleteClub = () => {
        if(confirm('آیا از حذف این باشگاه اطمینان دارید؟')) {
            setDeleting(true);
            router.delete(route('admin.clubs.destroy', club.id), {
                preserveScroll: true,
                onFinish: () => setDeleting(false),
            });
        }
    };

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    {club.image ? (
                        <img src={club.image} alt={club.name} className="w-8 h-8 rounded-full object-cover border" />
                    ) : (
                        <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: club.color }}></div>
                    )}
                    <div className="flex flex-col">
                        <span className="font-bold text-sm">{club.name}</span>
                        <span className={`text-[10px] w-fit px-1.5 rounded ${club.is_tier ? 'bg-gray-100 text-gray-600' : 'bg-purple-100 text-purple-600'}`}>
                            {club.is_tier ? 'سطح اصلی' : 'اتاق ویژه'}
                        </span>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => setEditing(!editing)} className="text-gray-400 hover:text-primary-600 p-1">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={deleteClub} disabled={deleting} className="text-gray-400 hover:text-red-600 p-1 disabled:opacity-50">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
            
            {editing ? (
                <form onSubmit={submit} className="space-y-3">
                    <div className="flex gap-2 mb-2 text-xs">
                        <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" checked={data.is_tier} onChange={() => setData('is_tier', true)} /> سطح
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" checked={!data.is_tier} onChange={() => setData('is_tier', false)} /> ویژه
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="border rounded-lg px-2 py-1 text-sm" placeholder="نام" />
                        <input type="color" value={data.color} onChange={e => setData('color', e.target.value)} className="h-8 w-full" />
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-gray-600 mb-1 block">تغییر تصویر</label>
                        <input type="file" onChange={e => setData('image', e.target.files ? e.target.files[0] : null)} className="w-full border rounded-lg px-2 py-1 text-xs" accept="image/*" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-gray-500">حداقل امتیاز</label>
                            <input type="number" value={data.min_points} onChange={e => setData('min_points', parseInt(e.target.value))} className="border rounded-lg px-2 py-1 text-sm w-full" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">هزینه خرید</label>
                            <input type="number" value={data.joining_cost} onChange={e => setData('joining_cost', parseInt(e.target.value))} className="border rounded-lg px-2 py-1 text-sm w-full" placeholder="0" />
                        </div>
                    </div>

                    {/* Benefits Edit */}
                    <div className="border-t pt-2">
                        <label className="text-xs font-bold text-gray-600 mb-1 block">ویژگی‌ها</label>
                        <div className="flex gap-1 mb-2">
                            <input 
                                type="text" 
                                value={newBenefit} 
                                onChange={e => setNewBenefit(e.target.value)} 
                                className="w-full border rounded px-2 py-1 text-xs" 
                                placeholder="ویژگی جدید..."
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addBenefit(); } }}
                            />
                            <button type="button" onClick={addBenefit} className="bg-gray-100 px-2 rounded hover:bg-gray-200"><Plus size={14} /></button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {data.benefits.map((b, i) => (
                                <span key={i} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                                    {b}
                                    <button type="button" onClick={() => removeBenefit(i)} className="hover:text-red-500"><X size={10} /></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <button disabled={processing} className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm w-full mt-2">ذخیره تغییرات</button>
                </form>
            ) : (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>مینیمم: {club.min_points.toLocaleString()}</span>
                        <span>هزینه: {club.joining_cost ? club.joining_cost.toLocaleString() : 'رایگان'}</span>
                    </div>
                    {club.benefits && club.benefits.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {club.benefits.map((b: string, i: number) => (
                                <span key={i} className="text-[10px] bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded text-gray-500">{b}</span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const RuleCard = ({ rule }: any) => {
    const { data, setData, post, processing } = useForm({
        points: rule.points,
        title: rule.title,
        is_active: Boolean(rule.is_active)
    });
    const [editing, setEditing] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.point-rules.update', rule.id), {
            onSuccess: () => setEditing(false)
        });
    };

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-sm">{rule.title}</h4>
                    <p className="text-xs text-gray-400">{rule.description}</p>
                </div>
                <button onClick={() => setEditing(!editing)} className="text-gray-400 hover:text-primary-600">
                    <Edit2 size={16} />
                </button>
            </div>

            {editing ? (
                <form onSubmit={submit} className="space-y-2 mt-2">
                    <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="border rounded-lg px-2 py-1 text-sm w-full" />
                    <div className="flex gap-2">
                        <input type="number" value={data.points} onChange={e => setData('points', parseInt(e.target.value))} className="border rounded-lg px-2 py-1 text-sm w-20" />
                        <label className="flex items-center gap-1 text-xs">
                            <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
                            فعال
                        </label>
                    </div>
                    <button disabled={processing} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm w-full">بروزرسانی</button>
                </form>
            ) : (
                <div className="flex justify-between items-center mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs ${rule.points > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {rule.points > 0 ? '+' : ''}{rule.points} امتیاز
                    </span>
                    <span className={`w-2 h-2 rounded-full ${rule.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                </div>
            )}
        </div>
    );
};