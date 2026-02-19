import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { 
    LayoutGrid, Settings, ShoppingCart, Dna, Gift, Users, 
    FileText, Package, MessageSquare, Bell, Star, UserPlus, 
    Zap, X, Plus, Barcode, Database
} from 'lucide-react';
import clsx from 'clsx';

// List of all available quick actions
// Changed href to routeName to avoid calling route() at top level
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
    pinned: string[]; // IDs of pinned items
    frequent: string[]; // IDs of frequently used items
    isAdmin: boolean;
}

export default function QuickAccess({ pinned = [], frequent = [], isAdmin }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>(pinned);

    // Combine available actions based on role
    const pool = isAdmin ? [...AVAILABLE_ACTIONS, ...ADMIN_ACTIONS] : AVAILABLE_ACTIONS;

    // Resolve items
    const pinnedItems = pool.filter(a => pinned.includes(a.id));
    // If no pinned items, show frequent ones (limited to 4). If frequent empty, show defaults.
    const displayItems = pinnedItems.length > 0 
        ? pinnedItems 
        : (frequent.length > 0 ? pool.filter(a => frequent.includes(a.id)).slice(0, 4) : pool.slice(0, 4));

    const toggleSelection = (id: string) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(i => i !== id));
        } else {
            if (selectedItems.length >= 8) return; // Max limit
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
            <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Zap size={20} className="text-amber-500 fill-amber-500" />
                    دسترسی سریع
                    {pinned.length === 0 && frequent.length > 0 && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">
                            پرکاربردترین‌ها
                        </span>
                    )}
                </h3>
                <button 
                    onClick={() => { setSelectedItems(pinned); setShowModal(true); }}
                    className="text-xs text-gray-500 hover:text-primary-600 flex items-center gap-1 transition"
                >
                    <Settings size={14} />
                    شخصی‌سازی
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {displayItems.map(item => (
                    <Link 
                        key={item.id} 
                        href={route(item.routeName)}
                        className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all group"
                    >
                        <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110", item.bg, item.color)}>
                            <item.icon size={24} />
                        </div>
                        <span className="text-xs font-bold text-gray-700 text-center">{item.title}</span>
                    </Link>
                ))}
                
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300 hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
                >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 bg-gray-200/50">
                        <Plus size={24} />
                    </div>
                    <span className="text-xs font-bold">افزودن</span>
                </button>
            </div>

            {/* Customization Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">شخصی‌سازی دسترسی سریع</h3>
                                <p className="text-xs text-gray-500 mt-1">حداکثر ۸ آیتم را برای نمایش در داشبورد انتخاب کنید.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        
                        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto">
                            {pool.map(item => {
                                const isSelected = selectedItems.includes(item.id);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleSelection(item.id)}
                                        className={clsx(
                                            "flex flex-col items-center p-3 rounded-xl border-2 transition-all relative",
                                            isSelected 
                                                ? "border-primary-500 bg-primary-50" 
                                                : "border-gray-100 bg-white hover:border-gray-300"
                                        )}
                                    >
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-white">
                                                <Plus size={12} className="rotate-45" />
                                            </div>
                                        )}
                                        <item.icon size={24} className={clsx("mb-2", isSelected ? "text-primary-600" : "text-gray-400")} />
                                        <span className={clsx("text-xs font-bold", isSelected ? "text-primary-700" : "text-gray-600")}>{item.title}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                                {selectedItems.length} از ۸ انتخاب شده
                            </span>
                            <div className="flex gap-2">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-xl transition">انصراف</button>
                                <button onClick={savePreferences} className="bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700 shadow-lg transition">ذخیره تغییرات</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}