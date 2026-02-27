import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import {
    LayoutGrid, Settings, ShoppingCart, Dna, Gift, Users,
    FileText, Package, MessageSquare, Bell, Star, UserPlus,
    Zap, X, Plus, Barcode, Database, ChevronLeft, Sparkles
} from 'lucide-react';
import clsx from 'clsx';

// List of all available quick actions
const AVAILABLE_ACTIONS = [
    { id: 'products', title: 'ثبت محصول', icon: Barcode, routeName: 'products.index', color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'rewards', title: 'فروشگاه جوایز', icon: Gift, routeName: 'rewards.index', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'lucky_wheel', title: 'گردونه شانس', icon: Dna, routeName: 'lucky-wheel.index', color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'surveys', title: 'مسابقات', icon: FileText, routeName: 'surveys.index', color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'tickets', title: 'پشتیبانی', icon: MessageSquare, routeName: 'tickets.index', color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'referrals', title: 'معرفی دوستان', icon: UserPlus, routeName: 'referrals.index', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { id: 'profile', title: 'پروفایل من', icon: Users, routeName: 'profile', color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'notifications', title: 'پیام‌ها', icon: Bell, routeName: 'notifications.index', color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'clubs', title: 'باشگاه‌ها', icon: Star, routeName: 'clubs.index', color: 'text-purple-600', bg: 'bg-purple-50' },
];

// Admin specific actions
const ADMIN_ACTIONS = [
    { id: 'admin_users', title: 'کاربران', icon: Users, routeName: 'admin.users', color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'admin_products', title: 'محصولات', icon: Database, routeName: 'admin.products.index', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'admin_reports', title: 'گزارشات', icon: FileText, routeName: 'admin.reports.index', color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'admin_tickets', title: 'تیکت‌ها', icon: MessageSquare, routeName: 'admin.tickets.index', color: 'text-orange-600', bg: 'bg-orange-50' },
];

interface Props {
    pinned: string[];
    frequent: string[];
    isAdmin: boolean;
}

export default function QuickAccess({ pinned = [], frequent = [], isAdmin }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>(pinned);

    const pool = isAdmin ? [...AVAILABLE_ACTIONS, ...ADMIN_ACTIONS] : AVAILABLE_ACTIONS;

    const pinnedItems = pool.filter(a => pinned.includes(a.id));
    const displayItems = pinnedItems.length > 0
        ? pinnedItems
        : (frequent.length > 0 ? pool.filter(a => frequent.includes(a.id)).slice(0, 4) : pool.slice(0, 4));

    const toggleSelection = (id: string) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(i => i !== id));
        } else {
            if (selectedItems.length >= 8) return;
            setSelectedItems([...selectedItems, id]);
        }
    };

    const savePreferences = () => {
        router.post(route('dashboard.quick-access.update'), { items: selectedItems }, {
            onSuccess: () => setShowModal(false),
            preserveScroll: true
        });
    };

    return (
        <div className="mb-8">
            {/* هدر بخش */}
            <div className="flex justify-between items-center mb-5 px-1">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg shadow-amber-500/20">
                        <Zap size={18} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">دسترسی سریع</h3>
                        <p className="text-xs text-gray-500">میانبرهای پرکاربرد</p>
                    </div>
                    {pinned.length === 0 && frequent.length > 0 && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-full mr-2">
                            پرکاربردترین‌ها
                        </span>
                    )}
                </div>

                <button
                    onClick={() => { setSelectedItems(pinned); setShowModal(true); }}
                    className="group flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-amber-500 hover:text-amber-600 transition-all hover:shadow-md"
                >
                    <Settings size={14} className="group-hover:rotate-45 transition-transform" />
                    شخصی‌سازی
                    <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>
            </div>

            {/* گرید آیتم‌ها */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {displayItems.map(item => (
                    <Link
                        key={item.id}
                        href={route(item.routeName)}
                        className="group relative flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                        {/* افکت درخشش در هاور */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* آیکون */}
                        <div className={clsx(
                            "w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                            item.bg,
                            item.color
                        )}>
                            <item.icon size={24} />
                        </div>

                        {/* عنوان */}
                        <span className="text-xs font-bold text-gray-700 text-center group-hover:text-gray-900 transition-colors">
                            {item.title}
                        </span>

                        {/* هایلایت پایین */}
                        <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-amber-500/0 to-transparent group-hover:via-amber-500/50 rounded-full transition-all duration-300" />
                    </Link>
                ))}

                {/* دکمه افزودن */}
                <button
                    onClick={() => setShowModal(true)}
                    className="group flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-dashed border-gray-300 hover:border-amber-400 hover:bg-gradient-to-br hover:from-amber-50 hover:to-amber-100/50 transition-all duration-300"
                >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 bg-white/80 group-hover:bg-white group-hover:scale-110 transition-all">
                        <Plus size={24} className="text-gray-400 group-hover:text-amber-500 group-hover:rotate-90 transition-all duration-300" />
                    </div>
                    <span className="text-xs font-bold text-gray-400 group-hover:text-amber-600">افزودن</span>
                </button>
            </div>

            {/* مودال شخصی‌سازی */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* هدر مودال */}
                        <div className="relative p-6 border-b border-gray-100 bg-gradient-to-l from-amber-50 to-transparent">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-x-16 -translate-y-16" />
                            <div className="relative flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-amber-500 rounded-xl shadow-lg shadow-amber-500/20">
                                        <Sparkles size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">شخصی‌سازی دسترسی سریع</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            حداکثر ۸ آیتم را برای نمایش در داشبورد انتخاب کنید.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-white/60 rounded-xl transition-colors group"
                                >
                                    <X size={20} className="text-gray-400 group-hover:text-red-500 group-hover:rotate-90 transition-all" />
                                </button>
                            </div>
                        </div>

                        {/* لیست آیتم‌ها */}
                        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto">
                            {pool.map(item => {
                                const isSelected = selectedItems.includes(item.id);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleSelection(item.id)}
                                        className={clsx(
                                            "group relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105",
                                            isSelected
                                                ? "border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100/50 shadow-lg shadow-amber-500/20"
                                                : "border-gray-100 bg-white hover:border-gray-300 hover:shadow-md"
                                        )}
                                    >
                                        {/* نشان انتخاب */}
                                        {isSelected && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in">
                                                <span className="text-sm">✓</span>
                                            </div>
                                        )}

                                        {/* آیکون */}
                                        <div className={clsx(
                                            "w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all",
                                            item.bg,
                                            isSelected ? "scale-110" : "opacity-80"
                                        )}>
                                            <item.icon size={24} className={clsx(isSelected ? item.color : "text-gray-400")} />
                                        </div>

                                        {/* عنوان */}
                                        <span className={clsx(
                                            "text-xs font-bold text-center",
                                            isSelected ? "text-gray-800" : "text-gray-600"
                                        )}>
                                            {item.title}
                                        </span>

                                        {/* شماره ترتیب (برای آیتم‌های انتخاب شده) */}
                                        {isSelected && (
                                            <span className="absolute -bottom-1 -left-1 w-4 h-4 bg-amber-500 rounded-full text-[8px] text-white flex items-center justify-center shadow-md">
                                                {selectedItems.indexOf(item.id) + 1}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* فوتر مودال */}
                        <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                    {selectedItems.length}
                                </div>
                                <span className="text-sm text-gray-600">
                                    از ۸ انتخاب شده
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                                >
                                    انصراف
                                </button>
                                <button
                                    onClick={savePreferences}
                                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2.5 rounded-xl hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
                                >
                                    ذخیره تغییرات
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
