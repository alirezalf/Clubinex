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
}

export default function PrizeItem({ prize }: { prize: Prize }) {
    const { data, setData, post, processing } = useForm({
        title: prize.title,
        probability: prize.probability,
        stock: prize.stock || '',
        value: prize.value || 0, 
        type: prize.type || 'points', 
        is_active: Boolean(prize.is_active)
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
                    <span className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 text-xs flex items-center justify-center font-bold border border-purple-100">
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
                    <div className="col-span-12 flex justify-end mt-2">
                        <button disabled={processing} className="bg-primary-600 text-white text-xs px-4 py-2 rounded-lg font-medium">ذخیره تغییرات</button>
                    </div>
                </form>
            )}
        </div>
    );
}