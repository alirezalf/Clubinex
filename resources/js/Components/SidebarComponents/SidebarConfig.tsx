import {
    LayoutDashboard, User, Users, Award, Gift,
    ShoppingCart, Dna, Settings,
    MessageSquare, FileText, Package, Bell, BarChart2, Database,
    Layers, Gamepad2, ShieldCheck, UserPlus, FileQuestion,
    MonitorPlay, Star, Target, Heart
} from 'lucide-react';

export const getMenuItems = (badgeCount: number = 0, notificationCount: number = 0) => [
    {
        name: 'داشبورد',
        icon: LayoutDashboard,
        href: route('dashboard'),
        group: 'general',
        description: 'نمای کلی فعالیت‌ها'
    },
    {
        name: 'پروفایل من',
        icon: User,
        href: route('profile'),
        group: 'general',
        description: 'مشاهده و ویرایش اطلاعات'
    },
    {
        name: 'معرفی دوستان',
        icon: UserPlus,
        href: route('referrals.index'),
        group: 'general',
        description: 'دعوت دوستان و کسب امتیاز'
    },

    {
        name: 'باشگاه‌های من',
        icon: Award,
        href: route('clubs.index'),
        group: 'club',
        description: 'مشاهده سطوح باشگاه'
    },
    {
        name: 'ثبت محصول و امتیاز',
        icon: Package,
        href: route('products.index'),
        group: 'club',
        description: 'کسب امتیاز از خریدها'
    },
    {
        name: 'فروشگاه جوایز',
        icon: ShoppingCart,
        href: route('rewards.index'),
        group: 'club',
        description: 'تبدیل امتیاز به جایزه'
    },
    {
        name: 'گردونه شانس',
        icon: Dna,
        href: route('lucky-wheel.index'),
        group: 'club',
        description: 'شانس خود را امتحان کنید'
    },
    {
        name: 'مسابقات و نظرسنجی',
        icon: FileQuestion,
        href: route('surveys.index'),
        group: 'club',
        description: 'شرکت در مسابقات'
    },

    {
        name: 'پیام‌ها و اعلان‌ها',
        icon: Bell,
        href: route('notifications.index'),
        group: 'support',
        badge: notificationCount,
        description: 'آخرین پیام‌ها'
    },
    {
        name: 'پشتیبانی و تیکت',
        icon: MessageSquare,
        href: route('tickets.index'),
        group: 'support',
        badge: badgeCount,
        description: 'ارسال تیکت پشتیبانی'
    },
];

export const getAdminItems = (badgeCount: number = 0, rewardsCount: number = 0) => [
    {
        name: 'مدیریت کاربران',
        icon: Users,
        href: route('admin.users'),
        group: 'admin',
        description: 'مدیریت کاربران سیستم'
    },
    {
        name: 'مدیریت دسترسی‌ها',
        icon: ShieldCheck,
        href: route('admin.roles.index'),
        group: 'admin',
        description: 'تعیین سطوح دسترسی'
    },
    {
        name: 'مدیریت دسته‌بندی‌ها',
        icon: Layers,
        href: route('admin.categories.index'),
        group: 'admin',
        description: 'دسته‌بندی محصولات'
    },
    {
        name: 'مدیریت محصولات',
        icon: Database,
        href: route('admin.products.index'),
        group: 'admin',
        description: 'مدیریت محصولات و امتیازات'
    },
    {
        name: 'مدیریت جوایز',
        icon: Gift,
        href: route('admin.rewards.index'),
        group: 'admin',
        badge: rewardsCount,
        description: 'مدیریت جوایز فروشگاه'
    },
    {
        name: 'مدیریت اسلایدرها',
        icon: MonitorPlay,
        href: route('admin.sliders.index'),
        group: 'admin',
        description: 'اسلایدرهای صفحه اصلی'
    },
    {
        name: 'تنظیمات باشگاه',
        icon: Award,
        href: route('admin.club.settings'),
        group: 'admin',
        description: 'تنظیمات سطوح باشگاه'
    },
    {
        name: 'مدیریت بازی‌ها',
        icon: Gamepad2,
        href: route('admin.gamification.index'),
        group: 'admin',
        description: 'گردونه شانس و بازی‌ها'
    },
    {
        name: 'ارسال اعلان',
        icon: Bell,
        href: route('admin.notifications.send'),
        group: 'admin',
        description: 'ارسال نوتیفیکیشن'
    },
    {
        name: 'گزارشات',
        icon: BarChart2,
        href: route('admin.reports.index'),
        group: 'admin',
        description: 'گزارشات سیستم'
    },
    {
        name: 'تنظیمات سیستم',
        icon: Settings,
        href: route('admin.settings'),
        group: 'admin',
        description: 'تنظیمات کلی سایت'
    },
    {
        name: 'لاگ‌های سیستم',
        icon: FileText,
        href: route('admin.logs'),
        group: 'admin',
        description: 'خطاها و رویدادها'
    },
    {
        name: 'مدیریت تیکت‌ها',
        icon: MessageSquare,
        href: route('admin.tickets.index'),
        group: 'admin',
        badge: badgeCount,
        description: 'پاسخ به تیکت‌ها'
    },
];

export const getMenuGroups = (items: any[]) => [
    {
        id: 'general',
        title: 'عمومی',
        icon: Star,
        items: items.filter(i => i.group === 'general')
    },
    {
        id: 'club',
        title: 'خدمات باشگاه',
        icon: Target,
        items: items.filter(i => i.group === 'club')
    },
    {
        id: 'support',
        title: 'پشتیبانی',
        icon: Heart,
        items: items.filter(i => i.group === 'support')
    },
];
