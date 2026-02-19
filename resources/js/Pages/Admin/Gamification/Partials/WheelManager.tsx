import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dna, Plus, X } from 'lucide-react';
import PrizeItem from './PrizeItem';

interface Prize {
    id: number;
    title: string;
    probability: number;
    is_active: number;
    stock?: number;
    value?: number;
    type?: string;
    color?: string;
}

interface Wheel {
    id: number;
    title: string;
    cost_per_spin: number;
    prizes: Prize[];
}

interface Props {
    wheel: Wheel;
}

export default function WheelManager({ wheel }: Props) {
    const prizes = wheel?.prizes || [];
    const [showAddPrize, setShowAddPrize] = useState(false);

    // Form for Adding Prize
    const { data, setData, post, processing, reset } = useForm({
        lucky_wheel_id: wheel?.id,
        title: '',
        type: 'points',
        value: 0,
        probability: 10,
        stock: '',
    });

    const submitAddPrize = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.lucky-wheel.prize.store'), {
            onSuccess: () => {
                setShowAddPrize(false);
                reset();
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Dna size={24} /></div>
                    <h2 className="text-xl font-bold text-gray-800">گردونه شانس</h2>
                </div>
                <button onClick={() => setShowAddPrize(true)} className="text-sm bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-1 shadow-md">
                    <Plus size={16} /> آیتم جدید
                </button>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold mb-4 text-gray-700">آیتم‌های گردونه</h3>
                <div className="space-y-3">
                    {prizes.length > 0 ? (
                        prizes.map((prize) => (
                            <PrizeItem key={prize.id} prize={prize} />
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg text-center">هیچ آیتمی برای گردونه تعریف نشده است.</p>
                    )}
                </div>
            </div>

            {/* Add Prize Modal */}
            {showAddPrize && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">افزودن آیتم به گردونه</h3>
                            <button onClick={() => setShowAddPrize(false)}><X size={20} className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={submitAddPrize} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold mb-1 text-gray-600">عنوان</label>
                                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-purple-500 focus:border-purple-500" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-gray-600">نوع</label>
                                    <select value={data.type} onChange={e => setData('type', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-purple-500 focus:border-purple-500">
                                        <option value="points">امتیاز</option>
                                        <option value="empty">پوچ</option>
                                        <option value="item">کالا (فیزیکی)</option>
                                        <option value="retry">شانس مجدد</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-gray-600">مقدار (امتیاز)</label>
                                    <input type="number" value={data.value} onChange={e => setData('value', parseInt(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-purple-500 focus:border-purple-500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-gray-600">شانس (وزن)</label>
                                    <input type="number" value={data.probability} onChange={e => setData('probability', parseInt(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-purple-500 focus:border-purple-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-gray-600">موجودی (اختیاری)</label>
                                    <input type="number" value={data.stock} onChange={e => setData('stock', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-purple-500 focus:border-purple-500" />
                                </div>
                            </div>
                            <button disabled={processing} className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 transition">افزودن</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}