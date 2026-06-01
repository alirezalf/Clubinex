import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Book, Shield, Settings, Server, Users, Code, Search, ChevronRight, FileText, Lock, Sparkles, Terminal } from 'lucide-react';
import clsx from 'clsx';

// Content structure
const categories = [
    { id: 'install', name: 'نصب و راه‌اندازی', icon: Server, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'dev', name: 'برنامه‌نویسی و توسعه', icon: Code, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'security', name: 'امنیت و لایسنس', icon: Shield, color: 'text-red-500', bg: 'bg-red-50' },
    { id: 'admin', name: 'راهنمای مدیران', icon: Settings, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'users', name: 'راهنمای کاربران', icon: Users, color: 'text-green-500', bg: 'bg-green-50' },
];

const articles = [
    {
        id: 'build-deploy',
        categoryId: 'install',
        title: 'بیلد و استقرار پروژه روی هاست',
        content: `برای استقرار پروژه روی سرور مشتری مراحل زیر را با دقت دنبال کنید:

1. **کامپایل فایل‌های فرانت‌اند (React):** قبل از خروجی گرفتن برای مشتری در سیستم خودتان حتماً دستور زیر را اجرا کنید تا فایل‌های React کامپایل شوند و حجم آن‌ها کم شود. (پوشه node_modules نیازی نیست به هاست مشتری منتقل شود).
\`\`\`bash
npm install
npm run build
\`\`\`

2. **نصب پکیج‌های بک‌اند:** در سرور مشتری سعی کنید پکیج‌ها را فقط برای پروداکشن نصب کنید تا حجم و مصرف رم کاهش یابد:
\`\`\`bash
composer install --optimize-autoloader --no-dev
\`\`\`

3. **دستورات پایانی در هاست:** اجرا کردن دستورات زیر برای ساخت جداول پایگاه داده و بالاتر بردن سرعت سایت در هاست الزامی است:
\`\`\`bash
php artisan migrate --force
php artisan optimize
\`\`\`

4. **تنظیم پابلیش (Public Check):** هاست مشتری باید به گونه‌ای تنظیم شود که فقط فولدر \`public\` در دسترس عموم و اینترنت باشد و پوشه‌هایی مثل \`app\` یا \`storage\` کاملا خارج از دسترس وب باشند (Document Root باید روی فولدر public تنظیم شود).`
    },
    {
        id: 'license-security',
        categoryId: 'security',
        title: 'امنیت ۱۰۰ درصدی و جلوگیری از نال شدن لایسنس',
        content: `چون نرم‌افزار شما با PHP و Laravel نوشته شده است، سورس کدها عموماً به صورت متنِ باز (Open Source) روی هاست مشتری قرار می‌گیرند. اگر مشتری شما یک برنامه‌نویس حرفه‌ای لاراول استخدام کند و به او دسترسی هاست بدهد، آن برنامه‌نویس می‌تواند به ساختار برنامه نفوذ کند (مانند تغییر LicenseService).

**راه حل نهایی برای امنیت ۱۰۰ درصدی:**
برای اینکه هیچ‌کس نتواند سورس برنامه را تغییر دهد تا لایسنس را خنثی کند، قبل از تحویل پروژه به مشتری و آپلود روی هاست، باید فایل‌های حساس خود (مخصوصاً کل پوشه \`app/Services/\` و \`app/Providers/\`) را با ابزارهایی مثل **ionCube Encoder** یا **SourceGuardian** رمزنگاری (Obfuscate/Encode) کنید.
وقتی این کار را بکنید، کدها ناخوانا می‌شوند و در ترکیب با این سیستم لایسنسی که طراحی کرده‌ایم، کپی کردن یا دور زدن برنامه برای مشتری غیرممکن می‌شود.`
    },
    {
        id: 'modules-dev',
        categoryId: 'dev',
        title: 'راهنمای افزودن ماژول‌های جدید به سیستم',
        content: `سیستم ماژولار ما به گونه‌ای طراحی شده است که به صورت کاملا اتوماتیک هر ماژول جدید را تشخیص می‌دهد.
برای افزودن قابلیت یا ماژول جدید به لایسنس و دسترسی‌ها، فقط کافیست مراحل زیر را طی کنید:

1. **نام‌گذاری متغیر (پیش‌وند enable_):**
به بخش "مدیریت لایسنس" در پنل بروید. هر ویژگی جدیدی که قصد فروش یا مدیریت آن را دارید با کلمه \`enable_\` شروع کنید.
مثلا اگر یک سیستم حسابداری جدید می‌سازید نام متغیر را در لایسنس \`enable_accounting\` بگذارید.

2. **تشخیص اتوماتیک:**
وقتی کاربر لایسنسی دریافت می‌کند که این متغیر درون آن روشن باشد، سیستم فرانت‌اند ما هنگام چک کردن \`modules.enable_accounting\` مقدار true را می‌بیند.
شما فقط کافیست در قالب (مانند \`SidebarConfig.tsx\`) فیلد \`module: 'enable_accounting'\` را روی آن منو اضافه کنید.`
    },
    {
        id: 'db-update',
        categoryId: 'dev',
        title: 'راهنمای بروزرسانی دیتابیس',
        content: `هنگام اضافه شدن ویژگی‌های جدید به ساختار پایگاه داده، به جای ویرایش مستقیم دیتابیس به صورت دستی (که باعث خطای همگام‌سازی در دیتابیس مشتری می‌شود)، همواره از \`Migration\` های لاراول استفاده کنید.

نمونه دستور ساخت جدول یا تغییر دیتابیس:
\`\`\`bash
php artisan make:migration create_help_articles_table
\`\`\`
پس از آپلود پروژه بروز در سرور کارفرما، تنها کافیست دستور \`php artisan migrate --force\` اجرا شود.`
    },
    {
        id: 'update-guide',
        categoryId: 'admin',
        title: 'فرآیند آپدیت و انتقال تغییرات به مشتری',
        content: `اگر از Git استفاده می‌کنید، نیاز دارید تا بروزرسانی‌های خود را به صورت هوشمند برای مشتری‌ها ارسال کنید.

### مرحله ۱: بیلد و ساخت بسته
1. همیشه بعد از تغییر در ظاهر پنل دستورکامپایل را اجرا کنید: \`npm run build\`
2. پیدا کردن آخرین کامیت (مثلاً abcd123) که به مشتری تحویل داده‌اید.
3. در ترمینال خود اجرا کنید:
\`\`\`bash
php artisan make:update abcd123
\`\`\`
این دستور یک فایل \`zip\` از تغییرات (شامل public/build) در مسیر اصلی پروژه برای شما می‌سازد.

### مرحله ۲: اعمال آپدیت روی سایت مشتری
1. به مسیر **پنل ادمین > تنظیمات سیستم > ابزارهای سیستم** بروید.
2. در بخش «آپلود و نصب بسته بروزرسانی» فایل \`zip\` ساخته شده را آپلود کنید.
سیستم به‌صورت خودکار فایل‌ها را جایگزین می‌کند، مایگریشن‌ها (\`php artisan migrate --force\`) را اجرا می‌کند و کش‌ها را پاکسازی می‌کند.

**نکته درباره پکیج‌های جدید:** اگر از طریق \`composer require\` پکیج جدیدی نصب کرده‌اید، به دلیل تحریم یا عدم دسترسی کامپوزر در هاست اشتراکی، باید به صورت دستی پوشه \`vendor\` سیستم خودتان را همراه آپدیت در سایت مشتری آپلود کنید.`
    },
    {
        id: 'super-admin-guide',
        categoryId: 'admin',
        title: 'تفاوت سوپر ادمین و ادمین‌های عادی',
        content: `سیستم ما دارای سطوح دسترسی پیشرفته است:
- **سوپر ادمین (super-admin):** این کاربر بالاترین سطح دسترسی را دارد و مدیریت کامل کل پیکربندی‌های وب‌سایت شامل لاگ‌ها، لایسنس‌ها، و تنظیمات تم سایت را در اختیار دارد.
- **ادمین (admin):** مدیران عادی بر اساس نقش‌هایی (Roles) که شما در "مدیریت دسترسی‌ها" می‌سازید، فقط به بخش‌های تعیین شده (مثلا امور مالی یا مدیریت محصولات) دسترسی خواهند داشت.`
    },
    {
        id: 'user-guide',
        categoryId: 'users',
        title: 'فرآیند ثبت‌نام و سطوح کاربری (Club)',
        content: `باشگاه مشتریان (Club) بر اساس امتیازات کاربران کار می‌کند.
کاربران با ثبت نام، تکمیل پروفایل، یا خرید کالا امتیاز می‌گیرند و هرچه امتیازشان بیشتر شود وارد سطوح بالاتری (مانند طلایی، نقره‌ای و برنزی) می‌شوند.
شما در پنل مدیریت می‌توانید این سطوح و حداقل امتیاز مورد نیاز هرکدام را تغییر دهید.`
    }
];

export default function HelpIndex({ isAdmin }: { isAdmin: boolean }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

    // فیلتر کردن مقالات
    const filteredArticles = useMemo(() => {
        return articles.filter(article => {
            const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 article.content.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory ? article.categoryId === activeCategory : true;
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, activeCategory]);

    const activeArticleObj = articles.find(a => a.id === selectedArticle);

    // رندر هوشمند مارک‌داون‌های محدود (بولد و کدبلاک)
    const renderContent = (content: string) => {
        return content.split('\n').map((line, i) => {
            if (line.startsWith('\`\`\`')) {
                return null; // Handle manually if complex
            }

            // جایگزینی بولد
            let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // کد درون‌خطی
            formattedLine = formattedLine.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-red-500 font-mono text-sm">$1</code>');

            if (line.trim() === '') return <br key={i} />;
            return <p key={i} className="mb-2 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
        });
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'راهنمای سیستم', url: '#' }]}>
            <Head title="مرکز آموزش و مستندات" />

            <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">

                {/* بخش سایدبار راهنما */}
                <div className="w-full md:w-80 flex flex-col gap-4 bg-white/50 backdrop-blur-md border border-gray-200 rounded-3xl p-5 shadow-sm">
                    {/* جستجو */}
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="جستجو در آموزش‌ها..."
                            className="w-full pl-4 pr-10 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* دسته‌بندی‌ها */}
                    <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                        <button
                            onClick={() => { setActiveCategory(null); setSelectedArticle(null); }}
                            className={clsx(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-right text-sm font-bold",
                                activeCategory === null ? "bg-primary-500 text-white shadow-md shadow-primary-500/20" : "hover:bg-gray-100 text-gray-600"
                            )}
                        >
                            <Book size={18} />
                            همه مقالات
                        </button>

                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => { setActiveCategory(category.id); setSelectedArticle(null); }}
                                className={clsx(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-right text-sm font-bold",
                                    activeCategory === category.id
                                        ? `${category.bg} ${category.color} shadow-sm border border-${category.color.split('-')[1]}-200`
                                        : "hover:bg-gray-50 text-gray-600 border border-transparent"
                                )}
                            >
                                <category.icon size={18} className={activeCategory === category.id ? '' : 'opacity-60'} />
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* بخش محتوای اصلی */}
                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    {selectedArticle ? (
                        /* نمایش یک مقاله مشخص */
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <button
                                onClick={() => setSelectedArticle(null)}
                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6 transition"
                            >
                                <ChevronRight size={16} />
                                بازگشت به لیست
                            </button>

                            <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                                {activeArticleObj?.title}
                            </h1>

                            <div className="prose max-w-none prose-primary text-gray-800 leading-8">
                                {/* ما از رندر سفارشی برای متن استفاده کردیم */}
                                {activeArticleObj && contentRenderer(activeArticleObj.content)}
                            </div>
                        </div>
                    ) : (
                        /* نمایش لیست مقالات (گرید) */
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-gray-50/50">
                            <div className="flex items-center gap-3 mb-8">
                                <Sparkles className="text-amber-500" size={24} />
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {activeCategory ? categories.find(c => c.id === activeCategory)?.name : 'تمامی مستندات نرم‌افزار'}
                                </h2>
                            </div>

                            {filteredArticles.length === 0 ? (
                                <div className="text-center py-20">
                                    <Search className="mx-auto text-gray-300 mb-4" size={48} />
                                    <p className="text-gray-500 font-medium">هیچ مقاله‌ای با این کلمات یافت نشد.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredArticles.map(article => {
                                        const cat = categories.find(c => c.id === article.categoryId);
                                        return (
                                            <div
                                                key={article.id}
                                                onClick={() => setSelectedArticle(article.id)}
                                                className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-primary-200 transition cursor-pointer group flex flex-col h-full"
                                            >
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className={clsx("p-2 rounded-xl shrink-0 text-white shadow-sm", cat?.color.replace('text-', 'bg-') || 'bg-gray-500')}>
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block", cat?.bg, cat?.color)}>
                                                            {cat?.name}
                                                        </span>
                                                        <h3 className="font-bold text-gray-800 group-hover:text-primary-600 transition leading-tight">
                                                            {article.title}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 line-clamp-2 mt-auto pt-2 border-t border-gray-50">
                                                    {article.content.substring(0, 100)}...
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

// کامپوننت کمکی برای رندر کردن کدها
const contentRenderer = (content: string) => {
    const parts = content.split('```');
    return parts.map((part, index) => {
        if (index % 2 === 1) {
            // بلوک کد
            const lines = part.trim().split('\n');
            const lang = lines[0];
            const code = lines.slice(1).join('\n');
            return (
                <div key={index} className="my-4 rounded-2xl overflow-hidden bg-[#1e1e1e] border border-gray-700 shadow-xl group" dir="ltr">
                    <div className="bg-[#2d2d2d] px-4 py-2 flex items-center gap-2 border-b border-gray-700">
                        <Terminal size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-400 font-mono uppercase font-bold">{lang}</span>
                    </div>
                    <pre className="p-4 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed">
                        <code>{code}</code>
                    </pre>
                </div>
            );
        } else {
            // متن عادی
            return (
                <div key={index} className="space-y-4 text-[15px]">
                    {part.split('\n').map((line, i) => {
                        let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        formattedLine = formattedLine.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded-md text-red-500 font-mono text-sm border border-gray-200 select-all">$1</code>');

                        if (line.startsWith('- ')) {
                            return <li key={i} className="mr-4 text-gray-700 list-disc marker:text-primary-500" dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }} />;
                        }

                        if (line.trim() === '') return null; // Ignore blanks to let gap handle it
                        return <p key={i} className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
                    }).filter(Boolean)}
                </div>
            );
        }
    });
};
