
import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Edit2, Trash2 } from 'lucide-react';

interface Prize {
    id: number;
    title: string;
    probability: number;
    is_active: number;
    stock?: number;
    value?: number;
    type?: string;
    color?: string;
    text_color?: string;
    font_size?: number;
    text_orientation?: 'horizontal' | 'vertical';
}

export default function PrizeItem({ prize }: { prize: Prize }) {
    const { data, setData, post, processing } = useForm({
        title: prize.title,
        probability: prize.probability,
        stock: prize.stock || '',
        value: prize.value || 0,
        type: prize.type || 'points',
        is_active: Boolean(prize.is_active),
        color: prize.color || '#ffffff',
        text_color: prize.text_color || '#000000',
        font_size: prize.font_size || 12,
        text_orientation: prize.text_orientation || 'horizontal',
    });
    const [editing, setEditing] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.lucky-wheel.prize.update', prize.id), {
            onSuccess: () => setEditing(false),
            preserveScroll: true
        });
    };

    const handleDelete = () => {
        if(confirm('آیا از حذف این آیتم اطمینان دارید؟')) {
            router.delete(route('admin.lucky-wheel.prize.destroy', prize.id), { preserveScroll: true });
        }
    }

    return (
        <div className={`p-3 rounded-xl border transition ${editing ? 'bg-gray-50 border-primary-300' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold border shadow-sm text-xs"
                        style={{ backgroundColor: prize.color || '#f3f4f6', color: prize.text_color || '#374151' }}
                    >
                        {prize.probability}%
                    </span>
                    <div className="flex flex-col">
                        <span className="font-medium text-sm text-gray-800">{prize.title}</span>
                        <span className="text-[10px] text-gray-500">
                            {prize.type === 'points' ? `امتیاز: ${prize.value}` : (prize.type === 'item' ? 'کالای فیزیکی' : (prize.type === 'retry' ? 'شانس مجدد' : 'پوچ'))}
                        </span>
                    </div>
                    {prize.stock !== null && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">({prize.stock} موجود)</span>}
                </div>
                <div className="flex gap-1">
                    <button onClick={() => setEditing(!editing)} className="text-gray-400 hover:text-primary-600 p-1.5 hover:bg-gray-100 rounded-lg transition">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={handleDelete} className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-gray-100 rounded-lg transition">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {editing && (
                <form onSubmit={submit} className="mt-3 grid grid-cols-12 gap-2 animate-in fade-in">
                    <div className="col-span-12 md:col-span-4">
                        <label className="text-[10px] font-bold text-gray-500 block mb-1">عنوان</label>
                        <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-purple-500 focus:border-purple-500" />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 block mb-1">نوع</label>
                        <select value={data.type} onChange={e => setData('type', e.target.value)} className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-purple-500 focus:border-purple-500">
                            <option value="points">امتیاز</option>
                            <option value="empty">پوچ</option>
                            <option value="item">کالا</option>
                            <option value="retry">شانس مجدد</option>
                        </select>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 block mb-1">مقدار</label>
                        <input type="number" value={data.value} onChange={e => setData('value', parseInt(e.target.value))} className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-purple-500 focus:border-purple-500" />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 block mb-1">شانس</label>
                        <input type="number" value={data.probability} onChange={e => setData('probability', parseInt(e.target.value))} className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-purple-500 focus:border-purple-500" />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 block mb-1">موجودی</label>
                        <input type="number" value={data.stock} onChange={e => setData('stock', parseInt(e.target.value))} className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-purple-500 focus:border-purple-500" />
                    </div>

                    {/* New Fields */}
                    <div className="col-span-6 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 block mb-1">رنگ پس‌زمینه</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={data.color} onChange={e => setData('color', e.target.value)} className="w-8 h-8 p-0 border-0 rounded cursor-pointer" />
                            <input type="text" value={data.color} onChange={e => setData('color', e.target.value)} className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-purple-500 focus:border-purple-500" dir="ltr" />
                        </div>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 block mb-1">رنگ متن</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={data.text_color} onChange={e => setData('text_color', e.target.value)} className="w-8 h-8 p-0 border-0 rounded cursor-pointer" />
                            <input type="text" value={data.text_color} onChange={e => setData('text_color', e.target.value)} className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-purple-500 focus:border-purple-500" dir="ltr" />
                        </div>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 block mb-1">سایز فونت</label>
                        <input type="number" value={data.font_size} onChange={e => setData('font_size', parseInt(e.target.value))} className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-purple-500 focus:border-purple-500" />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 block mb-1">جهت متن</label>
                        <select value={data.text_orientation} onChange={e => setData('text_orientation', e.target.value as any)} className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-purple-500 focus:border-purple-500">
                            <option value="horizontal">افقی (پیش‌فرض)</option>
                            <option value="vertical">عمودی (شعاعی)</option>
                        </select>
                    </div>

                    <div className="col-span-12 flex justify-end mt-2">
                        <button disabled={processing} className="bg-primary-600 text-white text-xs px-4 py-2 rounded-lg font-medium">ذخیره تغییرات</button>
                    </div>
                </form>
            )}
        </div>
    );
}
