import { 
    LayoutDashboard, User, Users, Award, Gift,
    ShoppingCart, Dna, Settings, Search,
    MessageSquare, FileText, Package, Bell, BarChart2, Database,
    Layers, Gamepad2, ShieldCheck, UserPlus, FileQuestion,
    MonitorPlay
} from 'lucide-react';

export const getMenuItems = (badgeCount: number = 0) => [
    { name: 'داشبورد', icon: LayoutDashboard, href: route('dashboard'), group: 'general' },
    { name: 'پروفایل من', icon: User, href: route('profile'), group: 'general' },
    { name: 'معرفی دوستان', icon: UserPlus, href: route('referrals.index'), group: 'general' },
    
    { name: 'باشگاه‌های من', icon: Award, href: route('clubs.index'), group: 'club' },
    { name: 'ثبت محصول و امتیاز', icon: Package, href: route('products.index'), group: 'club' },
    { name: 'فروشگاه جوایز', icon: ShoppingCart, href: route('rewards.index'), group: 'club' },
    { name: 'گردونه شانس', icon: Dna, href: route('lucky-wheel.index'), group: 'club' },
    { name: 'مسابقات و نظرسنجی', icon: FileQuestion, href: route('surveys.index'), group: 'club' },
    
    { name: 'پیام‌ها و اعلان‌ها', icon: Bell, href: route('notifications.index'), group: 'support' },
    { name: 'پشتیبانی و تیکت', icon: MessageSquare, href: route('tickets.index'), group: 'support', badge: badgeCount },
];

export const getAdminItems = (badgeCount: number = 0) => [
    { name: 'مدیریت کاربران', icon: Users, href: route('admin.users'), group: 'admin' },
    { name: 'مدیریت دسترسی‌ها', icon: ShieldCheck, href: route('admin.roles.index'), group: 'admin' },
    { name: 'مدیریت دسته‌بندی‌ها', icon: Layers, href: route('admin.categories.index'), group: 'admin' },
    { name: 'مدیریت محصولات', icon: Database, href: route('admin.products.index'), group: 'admin' },
    { name: 'مدیریت جوایز', icon: Gift, href: route('admin.rewards.index'), group: 'admin' },
    { name: 'مدیریت اسلایدرها', icon: MonitorPlay, href: route('admin.sliders.index'), group: 'admin' },
    { name: 'تنظیمات باشگاه', icon: Layers, href: route('admin.club.settings'), group: 'admin' },
    { name: 'مدیریت بازی‌ها', icon: Gamepad2, href: route('admin.gamification.index'), group: 'admin' },
    { name: 'ارسال اعلان', icon: Bell, href: route('admin.notifications.send'), group: 'admin' },
    { name: 'گزارشات', icon: BarChart2, href: route('admin.reports.index'), group: 'admin' },
    { name: 'تنظیمات سیستم', icon: Settings, href: route('admin.settings'), group: 'admin' },
    { name: 'لاگ‌های سیستم', icon: FileText, href: route('admin.logs'), group: 'admin' },
    { name: 'مدیریت تیکت‌ها', icon: MessageSquare, href: route('admin.tickets.index'), group: 'admin', badge: badgeCount },
];

export const getMenuGroups = (items: any[]) => [
    { id: 'general', title: 'عمومی', items: items.filter(i => i.group === 'general') },
    { id: 'club', title: 'خدمات باشگاه', items: items.filter(i => i.group === 'club') },
    { id: 'support', title: 'پشتیبانی', items: items.filter(i => i.group === 'support') },
];