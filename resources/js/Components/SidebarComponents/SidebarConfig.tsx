import {
    LayoutDashboard, User, Users, Award, Gift,
    ShoppingCart, Dna, Settings, Wallet,
    MessageSquare, FileText, Package, Bell, BarChart2, Database,
    Layers, Gamepad2, ShieldCheck, UserPlus, FileQuestion,
    MonitorPlay, Star, Target, Heart, Box,
    Globe, Palette, Share2, Smartphone, Mail, Headphones, Code, Zap
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
        module: 'enable_referrals',
        description: 'دعوت دوستان و کسب امتیاز'
    },
    {
        name: 'کیف پول من',
        icon: Wallet,
        href: route('wallet.index'),
        group: 'general',
        module: 'enable_wallet',
        description: 'مدیریت اعتبار و پرداخت‌ها'
    },

    {
        name: 'باشگاه‌های من',
        icon: Award,
        href: route('clubs.index'),
        group: 'club',
        module: 'enable_clubs',
        description: 'مشاهده سطوح باشگاه'
    },
    {
        name: 'ثبت محصول و امتیاز',
        icon: Package,
        href: route('products.index'),
        group: 'club',
        module: 'enable_products',
        description: 'کسب امتیاز از خریدها'
    },
    {
        name: 'فروشگاه جوایز',
        icon: ShoppingCart,
        href: route('rewards.index'),
        group: 'club',
        module: 'enable_rewards',
        description: 'تبدیل امتیاز به جایزه'
    },
    {
        name: 'گردونه شانس',
        icon: Dna,
        href: route('lucky-wheel.index'),
        group: 'club',
        module: 'enable_lucky_wheel',
        description: 'شانس خود را امتحان کنید'
    },
    {
        name: 'مسابقات و نظرسنجی',
        icon: FileQuestion,
        href: route('surveys.index'),
        group: 'club',
        module: 'enable_surveys',
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
        name: 'تیکت‌های پشتیبانی',
        icon: MessageSquare,
        href: route('tickets.index'),
        group: 'support',
        module: 'enable_tickets',
        description: 'ثبت و پیگیری تیکت‌ها'
    },
    {
        name: 'راهنمای سیستم',
        icon: FileText,
        href: route('help.index'),
        group: 'support',
        description: 'آموزش و توسعه'
    },
    {
        name: 'درباره ما',
        icon: FileText,
        href: route('about'),
        group: 'support',
        description: 'اطلاعات نرم افزار'
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
        href: '#',
        group: 'admin',
        module: 'enable_products',
        description: 'مدیریت محصولات و امتیازات',
        subItems: [
            { name: 'موجودی', icon: Box, href: route('admin.products.index', { tab: 'inventory' }), group: 'admin' },
            { name: 'درخواست‌ها', icon: FileText, href: route('admin.products.index', { tab: 'registrations' }), group: 'admin' },
        ]
    },
    {
        name: 'مدیریت جوایز',
        icon: Gift,
        href: '#',
        group: 'admin',
        module: 'enable_rewards',
        badge: rewardsCount,
        description: 'مدیریت جوایز فروشگاه',
        subItems: [
            { name: 'لیست جوایز', icon: Gift, href: route('admin.rewards.index', { tab: 'list' }), group: 'admin' },
            { name: 'درخواست‌ها', icon: FileText, href: route('admin.rewards.index', { tab: 'redemptions' }), group: 'admin' },
        ]
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
        module: 'enable_clubs',
        description: 'تنظیمات سطوح باشگاه'
    },
    {
        name: 'مدیریت بازی‌ها',
        icon: Gamepad2,
        href: '#',
        group: 'admin',
        module: 'enable_lucky_wheel',
        description: 'گردونه شانس و بازی‌ها',
        subItems: [
            { name: 'گردونه شانس', icon: Dna, href: route('admin.gamification.index', { tab: 'wheel' }), group: 'admin' },
            { name: 'نظرسنجی‌ها', icon: FileQuestion, href: route('admin.gamification.index', { tab: 'surveys' }), group: 'admin' },
        ]
    },
    {
        name: 'ارسال اعلان',
        icon: Bell,
        href: '#',
        group: 'admin',
        description: 'ارسال نوتیفیکیشن',
        subItems: [
            { name: 'ارسال پیام', icon: Bell, href: route('admin.notifications.send', { tab: 'send' }), group: 'admin' },
            { name: 'تاریخچه', icon: FileText, href: route('admin.notifications.send', { tab: 'history' }), group: 'admin' },
        ]
    },
    {
        name: 'گزارشات',
        icon: BarChart2,
        href: '#',
        group: 'admin',
        module: 'enable_reports',
        description: 'گزارشات سیستم',
        subItems: [
            { name: 'تراکنش‌ها', icon: Wallet, href: route('admin.reports.index', { tab: 'transactions' }), group: 'admin' },
            { name: 'سفارشات', icon: ShoppingCart, href: route('admin.reports.index', { tab: 'redemptions' }), group: 'admin' },
            { name: 'کاربران', icon: Users, href: route('admin.reports.index', { tab: 'users' }), group: 'admin' },
            { name: 'محصولات', icon: Database, href: route('admin.reports.index', { tab: 'products' }), group: 'admin' },
            { name: 'نظرسنجی‌ها', icon: FileQuestion, href: route('admin.reports.index', { tab: 'surveys' }), group: 'admin' },
            { name: 'گزارشات پیشرفته', icon: FileText, href: route('admin.reports.dynamic'), group: 'admin' },
        ]
    },
    {
        name: 'تنظیمات سیستم',
        icon: Settings,
        href: '#',
        group: 'admin',
        description: 'تنظیمات کلی سایت',
        subItems: [
            { name: 'عمومی و سئو', icon: Globe, href: route('admin.settings', { tab: 'general' }), group: 'admin' },
            { name: 'لایسنس و ماژول‌ها', icon: Package, href: route('admin.settings', { tab: 'modules' }), group: 'admin' },
            { name: 'شخصی‌سازی ظاهر', icon: Palette, href: route('admin.settings', { tab: 'theme' }), group: 'admin' },
            { name: 'تنظیمات ورود', icon: User, href: route('admin.settings', { tab: 'login' }), group: 'admin' },
            { name: 'امنیت', icon: ShieldCheck, href: route('admin.settings', { tab: 'security' }), group: 'admin' },
            { name: 'تنظیمات درگاه', icon: Wallet, href: route('admin.settings', { tab: 'payment' }), group: 'admin' },
            { name: 'اطلاعات تماس', icon: MessageSquare, href: route('admin.settings', { tab: 'contact' }), group: 'admin' },
            { name: 'شبکه‌های اجتماعی', icon: Share2, href: route('admin.settings', { tab: 'social' }), group: 'admin' },
            { name: 'تنظیمات پیامک', icon: Smartphone, href: route('admin.settings', { tab: 'sms' }), group: 'admin' },
            { name: 'قالب‌های پیامک', icon: MessageSquare, href: route('admin.settings', { tab: 'sms_templates' }), group: 'admin' },
            { name: 'تنظیمات ایمیل', icon: Mail, href: route('admin.settings', { tab: 'email' }), group: 'admin' },
            { name: 'تیکت و پشتیبانی', icon: Headphones, href: route('admin.settings', { tab: 'support' }), group: 'admin' },
            { name: 'فروشگاه (WordPress)', icon: ShoppingCart, href: route('admin.settings', { tab: 'wordpress' }), group: 'admin' },
            { name: 'قالب‌های ایمیل', icon: Code, href: route('admin.settings', { tab: 'email_themes' }), group: 'admin' },
            { name: 'ابزارهای سیستم', icon: Zap, href: route('admin.settings', { tab: 'system_tools' }), group: 'admin' },
            { name: 'تنظیمات رویدادها', icon: Bell, href: route('admin.settings', { tab: 'templates' }), group: 'admin' },
        ]
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
        module: 'enable_tickets',
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
