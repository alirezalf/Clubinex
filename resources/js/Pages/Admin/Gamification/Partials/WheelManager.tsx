import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dna, Plus, X, ChevronDown, ChevronUp, Info, Gift, CheckCircle, ShoppingBag } from 'lucide-react';
import * as Collapsible from '@radix-ui/react-collapsible';
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
    text_color?: string;
    font_size?: number;
    text_orientation?: 'horizontal' | 'vertical';
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
    const [isOpen, setIsOpen] = useState(true);

    // Form for Adding Prize
    const { data, setData, post, processing, reset } = useForm({
        lucky_wheel_id: wheel?.id,
        title: '',
        type: 'points',
        value: 0,
        probability: 10,
        stock: '',
        color: '#ffffff',
        text_color: '#000000',
        font_size: 12,
        text_orientation: 'horizontal',
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
                    <h2 className="text-xl font-bold text-gray-800">مدیریت گردونه شانس</h2>
                </div>
            </div>

            <Collapsible.Root open={isOpen} onOpenChange={setIsOpen} className="card-base overflow-hidden">
                <div className="p-4 flex items-center justify-between cursor-pointer bg-gray-50 border-b border-gray-100" onClick={() => setIsOpen(!isOpen)}>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-700">آیتم‌های گردونه</h3>
                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">{prizes.length} آیتم</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={(e) => { e.stopPropagation(); setShowAddPrize(true); }} className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 flex items-center gap-1 shadow-sm transition">
                            <Plus size={14} /> آیتم جدید
                        </button>
                        {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                    </div>
                </div>

                <Collapsible.Content className="p-6 animate-in slide-in-from-top-2">
                    <div className="space-y-3">
                        {prizes.length > 0 ? (
                            prizes.map((prize) => (
                                <PrizeItem key={prize.id} prize={prize} />
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg text-center">هیچ آیتمی برای گردونه تعریف نشده است.</p>
                        )}
                    </div>
                </Collapsible.Content>
            </Collapsible.Root>

            {/* Explanation Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>

                <div className="flex items-start gap-4 relative z-10">
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600 shrink-0">
                        <Info size={24} />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold text-lg text-blue-900 mb-1">راهنمای عملکرد گردونه شانس</h3>
                            <p className="text-sm text-blue-700 leading-relaxed">
                                در این بخش می‌توانید آیتم‌های گردونه شانس را مدیریت کنید. سناریوی عملکرد گردونه به شرح زیر است:
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white/60 p-4 rounded-xl border border-blue-100/50">
                                <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold text-sm">
                                    <Dna size={16} />
                                    <span>محاسبه شانس</span>
                                </div>
                                <p className="text-xs text-gray-600 leading-5">
                                    شانس برنده شدن هر آیتم بر اساس "وزن" (Probability) تعیین می‌شود. همچنین اگر آیتمی دارای محدودیت موجودی باشد، در صورتی که موجودی تمام شده باشد، شانس آن صفر در نظر گرفته می‌شود.
                                </p>
                            </div>

                            <div className="bg-white/60 p-4 rounded-xl border border-blue-100/50">
                                <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold text-sm">
                                    <Gift size={16} />
                                    <span>جوایز فیزیکی</span>
                                </div>
                                <p className="text-xs text-gray-600 leading-5">
                                    اگر کاربر برنده کالای فیزیکی شود، یک <strong>تیکت پشتیبانی</strong> به صورت خودکار برای ادمین ارسال می‌شود. پس از بررسی و تایید ادمین، امتیاز معادل کالا به کاربر داده می‌شود.
                                </p>
                            </div>

                            <div className="bg-white/60 p-4 rounded-xl border border-blue-100/50">
                                <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold text-sm">
                                    <ShoppingBag size={16} />
                                    <span>خرید نهایی</span>
                                </div>
                                <p className="text-xs text-gray-600 leading-5">
                                    کاربر با دریافت امتیاز معادل کالا، می‌تواند به فروشگاه مراجعه کرده و کالای مورد نظر را با استفاده از امتیازهای خود خریداری کند.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Prize Modal */}
            {showAddPrize && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="font-bold text-lg">افزودن آیتم به گردونه</h3>
                            <button onClick={() => setShowAddPrize(false)}><X size={20} className="text-gray-400 hover:text-red-500 transition" /></button>
                        </div>
                        <form onSubmit={submitAddPrize} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold mb-2 text-gray-700">عنوان آیتم</label>
                                    <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition" placeholder="مثلا: 100 امتیاز هدیه" required />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">نوع جایزه</label>
                                    <select value={data.type} onChange={e => setData('type', e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition">
                                        <option value="points">امتیاز</option>
                                        <option value="empty">پوچ</option>
                                        <option value="item">کالا (فیزیکی)</option>
                                        <option value="retry">شانس مجدد</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">مقدار (امتیاز)</label>
                                    <input type="number" value={data.value} onChange={e => setData('value', parseInt(e.target.value))} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition" />
                                    <p className="text-[10px] text-gray-500 mt-1">برای کالای فیزیکی، معادل امتیازی آن را وارد کنید.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">شانس (وزن)</label>
                                    <input type="number" value={data.probability} onChange={e => setData('probability', parseInt(e.target.value))} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">موجودی (اختیاری)</label>
                                    <input type="number" value={data.stock} onChange={e => setData('stock', e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition" placeholder="تعداد محدود" />
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-bold text-sm text-gray-700 mb-4">تنظیمات ظاهری</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">رنگ پس‌زمینه</label>
                                        <div className="flex items-center gap-3">
                                            <input type="color" value={data.color} onChange={e => setData('color', e.target.value)} className="w-10 h-10 p-0 border-0 rounded-lg cursor-pointer shadow-sm" />
                                            <input type="text" value={data.color} onChange={e => setData('color', e.target.value)} className="flex-1 border border-gray-300 rounded-xl p-2 text-sm text-left" dir="ltr" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">رنگ متن</label>
                                        <div className="flex items-center gap-3">
                                            <input type="color" value={data.text_color} onChange={e => setData('text_color', e.target.value)} className="w-10 h-10 p-0 border-0 rounded-lg cursor-pointer shadow-sm" />
                                            <input type="text" value={data.text_color} onChange={e => setData('text_color', e.target.value)} className="flex-1 border border-gray-300 rounded-xl p-2 text-sm text-left" dir="ltr" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">سایز فونت</label>
                                        <input type="number" value={data.font_size} onChange={e => setData('font_size', parseInt(e.target.value))} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">جهت متن</label>
                                        <select value={data.text_orientation} onChange={e => setData('text_orientation', e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition">
                                            <option value="horizontal">افقی (پیش‌فرض)</option>
                                            <option value="vertical">عمودی (شعاعی)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setShowAddPrize(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition">انصراف</button>
                                <button disabled={processing} className="flex-[2] bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-200">افزودن آیتم</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
