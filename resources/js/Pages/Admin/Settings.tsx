import { Head, useForm, router } from '@inertiajs/react';
import { Save, Globe, Smartphone, Palette, Share2, Phone, Mail, BellRing, Code, ShoppingBag, Headphones, Shield } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import clsx from 'clsx';

// Import Components
import SettingsSidebar from './Settings/Partials/SettingsSidebar';
import ThemeCustomizer from '@/Components/Admin/Settings/ThemeCustomizer';
import TemplateEditor from '@/Components/Admin/Settings/NotificationTemplates';
import EmailThemesManager from '@/Components/Admin/Settings/EmailThemes';
import TicketSettings from '@/Components/Admin/Settings/TicketSettings';
import WordPressSettings from '@/Components/Admin/Settings/WordPressSettings';
import SecuritySettings from '@/Components/Admin/Settings/SecuritySettings';
import GeneralSettings from '@/Components/Admin/Settings/GeneralSettings';
import ContactSettings from '@/Components/Admin/Settings/ContactSettings';
import SocialSettings from '@/Components/Admin/Settings/SocialSettings';
import SmsSettings from '@/Components/Admin/Settings/SmsSettings';
import EmailSettings from '@/Components/Admin/Settings/EmailSettings';
import { PageProps, User } from '@/types';

// Types
interface SettingItem {
    id: number;
    key: string;
    value: string | null;
    group: string;
    type: string;
}

interface NotificationTemplate {
    id: number;
    title_fa: string;
    sms_active: boolean;
    sms_pattern: string;
    database_active: boolean;
    database_message: string;
    email_active: boolean;
    email_subject: string;
    email_body: string;
    email_theme_id: number | null;
    variables: string;
}

interface EmailTheme {
    id: number;
    name: string;
    content: string;
    styles: string | null;
}

interface SettingsProps extends PageProps {
    settings: Record<string, SettingItem[]>;
    notificationTemplates: NotificationTemplate[];
    emailThemes?: EmailTheme[]; 
    admins?: User[];
}

// Tabs Configuration
const TABS = [
    { id: 'general', label: 'عمومی و سئو', icon: Globe },
    { id: 'theme', label: 'شخصی‌سازی ظاهر', icon: Palette },
    { id: 'security', label: 'امنیت', icon: Shield },
    { id: 'contact', label: 'اطلاعات تماس', icon: Phone },
    { id: 'social', label: 'شبکه‌های اجتماعی', icon: Share2 },
    { id: 'sms', label: 'تنظیمات پیامک', icon: Smartphone },
    { id: 'email', label: 'تنظیمات ایمیل', icon: Mail },
    { id: 'support', label: 'تیکت و پشتیبانی', icon: Headphones },
    { id: 'wordpress', label: 'فروشگاه (WordPress)', icon: ShoppingBag },
    { id: 'email_themes', label: 'قالب‌های ایمیل', icon: Code }, 
    { id: 'templates', label: 'تنظیمات رویدادها', icon: BellRing }, 
];

export default function AdminSettings({ settings, notificationTemplates, emailThemes = [], admins = [] }: SettingsProps) {
    const [activeTab, setActiveTab] = useState('general');

    // Helper to extract values safely
    const getSettingValue = (group: string, key: string, defaultVal: any) => {
        const item = settings[group]?.find((s: SettingItem) => s.key === key);
        return item ? item.value : defaultVal;
    };

    // Prepare initial form data
    const initialValues = useMemo(() => ({
        // General & SEO
        site_title: getSettingValue('general', 'site_title', 'Clubinex'),
        site_description: getSettingValue('general', 'site_description', ''),
        meta_keywords: getSettingValue('seo', 'meta_keywords', ''),
        og_image: getSettingValue('seo', 'og_image', null) as File | string | null, // Added og_image
        footer_text: getSettingValue('general', 'footer_text', ''),
        
        // Theme
        primary_color: getSettingValue('theme', 'primary_color', '#0284c7'),
        sidebar_bg: getSettingValue('theme', 'sidebar_bg', '#ffffff'),
        sidebar_text: getSettingValue('theme', 'sidebar_text', '#1f2937'),
        sidebar_texture: getSettingValue('theme', 'sidebar_texture', 'none'),
        header_bg: getSettingValue('theme', 'header_bg', 'rgba(255,255,255,0.8)',),
        radius_size: getSettingValue('theme', 'radius_size', '0.75rem'),
        sidebar_collapsed: getSettingValue('theme', 'sidebar_collapsed', '0') === '1',
        logo_url: null as File | string | null,
        favicon_url: null as File | string | null,

        // Contact & Social
        admin_mobile: getSettingValue('contact', 'admin_mobile', ''),
        support_email: getSettingValue('contact', 'support_email', ''),
        address: getSettingValue('contact', 'address', ''),
        instagram: getSettingValue('social', 'instagram', ''),
        telegram: getSettingValue('social', 'telegram', ''),
        whatsapp: getSettingValue('social', 'whatsapp', ''),
        linkedin: getSettingValue('social', 'linkedin', ''),

        // SMS & Email
        sms_provider: getSettingValue('sms', 'sms_provider', 'kavenegar'),
        sms_sender: getSettingValue('sms', 'sms_sender', ''),
        sms_api_key: getSettingValue('sms', 'sms_api_key', ''),
        sms_username: getSettingValue('sms', 'sms_username', ''),
        sms_password: getSettingValue('sms', 'sms_password', ''),
        mail_host: getSettingValue('email', 'mail_host', ''),
        mail_port: getSettingValue('email', 'mail_port', ''),
        mail_username: getSettingValue('email', 'mail_username', ''),
        mail_password: getSettingValue('email', 'mail_password', ''),
        mail_from_address: getSettingValue('email', 'mail_from_address', ''),
        mail_from_name: getSettingValue('email', 'mail_from_name', ''),

        // Wordpress
        wp_url: getSettingValue('wordpress', 'wp_url', ''),
        wp_consumer_key: getSettingValue('wordpress', 'wp_consumer_key', ''),
        wp_consumer_secret: getSettingValue('wordpress', 'wp_consumer_secret', ''),

        // Support
        ticket_auto_close_hours: getSettingValue('support', 'ticket_auto_close_hours', ''),
        support_agents: getSettingValue('support', 'support_agents', []),

        // Security
        max_login_attempts: getSettingValue('security', 'max_login_attempts', '5'),
        lockout_time: getSettingValue('security', 'lockout_time', '60'),
        session_timeout: getSettingValue('security', 'session_timeout', '30'),
        captcha_enabled: getSettingValue('security', 'captcha_enabled', '0') === '1',
    }), [settings]);

    const { data, setData } = useForm(initialValues);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('admin.settings.update'), {
            _method: 'post',
            ...data
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                const root = document.documentElement;
                root.style.setProperty('--header-bg', String(data.header_bg));
                root.style.setProperty('--sidebar-bg', String(data.sidebar_bg));
            }
        });
    };

    const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            // @ts-ignore
            setData(key, e.target.files[0]);
        }
    };

    const handleSettingChange = (key: string, value: any) => {
        // @ts-ignore
        setData(key, value);
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'تنظیمات سیستم' }]}>
            <Head title="تنظیمات سیستم" />

            <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Sidebar Navigation */}
                <SettingsSidebar 
                    tabs={TABS} 
                    activeTab={activeTab} 
                    onChange={setActiveTab} 
                />

                {/* Main Content Area */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[600px]">
                    
                    {activeTab === 'theme' ? (
                        <ThemeCustomizer data={data} setData={setData} submit={submit} handleFileChange={handleFileChange} />
                    ) : activeTab === 'templates' ? (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="border-b pb-4 mb-4">
                                <h3 className="text-lg font-bold text-gray-800">مدیریت رویدادها و اعلان‌ها</h3>
                                <p className="text-sm text-gray-500 mt-1">تنظیم متن پیامک، ایمیل و اعلان‌های سیستم برای هر رویداد.</p>
                            </div>
                            <div className="space-y-4">
                                {notificationTemplates.map((template) => (
                                    <TemplateEditor key={template.id} template={template} emailThemes={emailThemes} />
                                ))}
                            </div>
                        </div>
                    ) : activeTab === 'email_themes' ? (
                        <EmailThemesManager themes={emailThemes} />
                    ) : (
                        <form onSubmit={submit} className="space-y-6" encType="multipart/form-data">
                            
                            {activeTab === 'security' && (
                                <SecuritySettings data={data} setData={setData} />
                            )}

                            {activeTab === 'general' && (
                                <GeneralSettings data={data} setData={handleSettingChange} />
                            )}

                            {activeTab === 'contact' && (
                                <ContactSettings data={data} setData={handleSettingChange} />
                            )}

                            {activeTab === 'social' && (
                                <SocialSettings data={data} setData={handleSettingChange} />
                            )}

                            {activeTab === 'sms' && (
                                <SmsSettings data={data} setData={handleSettingChange} />
                            )}

                            {activeTab === 'email' && (
                                <EmailSettings data={data} setData={handleSettingChange} />
                            )}

                            {activeTab === 'support' && (
                                <TicketSettings data={data} setData={setData} admins={admins} />
                            )}

                            {activeTab === 'wordpress' && (
                                <WordPressSettings data={data} setData={handleSettingChange} />
                            )}

                            <div className="pt-6 border-t border-gray-100 flex justify-end sticky bottom-0 bg-white pb-2 z-10">
                                <button type="submit" className="bg-primary-600 text-white px-8 py-3 rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/30 flex items-center gap-2 transition font-bold transform hover:-translate-y-0.5">
                                    <Save size={18} />
                                    ذخیره تغییرات
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}