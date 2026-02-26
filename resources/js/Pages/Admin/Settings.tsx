
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Save, Globe, Smartphone, Palette, Share2, Phone, Mail, BellRing, Code, ShoppingBag, Headphones, Shield, User as UserIcon, MessageSquare } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import clsx from 'clsx';

// Import Components
import SettingsSidebar from './Settings/Partials/SettingsSidebar';
import ThemeCustomizer from '@/Components/Admin/Settings/ThemeCustomizer';
import TemplateEditor from '@/Components/Admin/Settings/NotificationTemplates';
import EmailThemesManager from '@/Components/Admin/Settings/EmailThemes';
import SmsTemplatesManager from '@/Components/Admin/Settings/SmsTemplatesManager';
import TicketSettings from '@/Components/Admin/Settings/TicketSettings';
import WordPressSettings from '@/Components/Admin/Settings/WordPressSettings';
import SecuritySettings from '@/Components/Admin/Settings/SecuritySettings';
import GeneralSettings from '@/Components/Admin/Settings/GeneralSettings';
import ContactSettings from '@/Components/Admin/Settings/ContactSettings';
import SocialSettings from '@/Components/Admin/Settings/SocialSettings';
import SmsSettings from '@/Components/Admin/Settings/SmsSettings';
import EmailSettings from '@/Components/Admin/Settings/EmailSettings';
import LoginSettings from '@/Components/Admin/Settings/LoginSettings';
import type { PageProps, User } from '@/types/index';

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

interface SmsTemplate {
    id: number;
    name: string;
    content: string;
    provider_template_id: string | null;
}

interface SettingsProps extends PageProps {
    settings: Record<string, SettingItem[]>;
    notificationTemplates: NotificationTemplate[];
    emailThemes?: EmailTheme[];
    smsTemplates?: SmsTemplate[];
    admins?: User[];
}

// Tabs Configuration
const TABS = [
    { id: 'general', label: 'عمومی و سئو', icon: Globe },
    { id: 'theme', label: 'شخصی‌سازی ظاهر', icon: Palette },
    { id: 'login', label: 'تنظیمات ورود', icon: UserIcon }, // New Tab
    { id: 'security', label: 'امنیت', icon: Shield },
    { id: 'contact', label: 'اطلاعات تماس', icon: Phone },
    { id: 'social', label: 'شبکه‌های اجتماعی', icon: Share2 },
    { id: 'sms', label: 'تنظیمات پیامک', icon: Smartphone },
    { id: 'sms_templates', label: 'قالب‌های پیامک', icon: MessageSquare },
    { id: 'email', label: 'تنظیمات ایمیل', icon: Mail },
    { id: 'support', label: 'تیکت و پشتیبانی', icon: Headphones },
    { id: 'wordpress', label: 'فروشگاه (WordPress)', icon: ShoppingBag },
    { id: 'email_themes', label: 'قالب‌های ایمیل', icon: Code },
    { id: 'templates', label: 'تنظیمات رویدادها', icon: BellRing },
];

export default function AdminSettings({ settings, notificationTemplates, emailThemes = [], smsTemplates = [], admins = [] }: SettingsProps) {
    const { themeSettings } = usePage<PageProps<{ themeSettings: any }>>().props;
    const [activeTab, setActiveTab] = useState('general');

    // Helper to extract values safely
    const getSettingValue = (group: string, key: string, defaultVal: any) => {
        const item = settings[group]?.find((s: SettingItem) => s.key === key);
        return item ? item.value : defaultVal;
    };

    // Prepare initial form data
    const initialValues = useMemo(() => {
        // Use DB Settings (settings prop) for initial values, NOT active theme (themeSettings)
        // This prevents overwriting System Settings with User Preferences

        return {
        // General & SEO
        site_title: getSettingValue('general', 'site_title', 'Clubinex'),
        site_description: getSettingValue('general', 'site_description', ''),
        meta_keywords: getSettingValue('seo', 'meta_keywords', ''),
        og_image: getSettingValue('seo', 'og_image', null) as File | string | null,
        footer_text: getSettingValue('general', 'footer_text', ''),

        // Theme (Use DB Settings directly)
        primary_color: getSettingValue('theme', 'primary_color', '#0284c7'),
        sidebar_bg: getSettingValue('theme', 'sidebar_bg', '#ffffff'),
        sidebar_text: getSettingValue('theme', 'sidebar_text', '#1f2937'),
        sidebar_texture: getSettingValue('theme', 'sidebar_texture', 'none'),
        header_bg: getSettingValue('theme', 'header_bg', 'rgba(255,255,255,0.8)'),
        radius_size: getSettingValue('theme', 'radius_size', '0.75rem'),
        card_style: getSettingValue('theme', 'card_style', 'default'),
        card_shadow: getSettingValue('theme', 'card_shadow', 'sm'),
        card_opacity: getSettingValue('theme', 'card_opacity', '1'),
        sidebar_collapsed: getSettingValue('theme', 'sidebar_collapsed', '0') === '1',

        reset_personal_theme: false, // Do not reset by default
        logo_url: null as File | string | null,
        favicon_url: null as File | string | null,

        // Login Settings
        login_theme: getSettingValue('login', 'login_theme', 'classic'),
        login_layout_reversed: getSettingValue('login', 'login_layout_reversed', '0') === '1',
        login_left_bg_type: getSettingValue('login', 'login_left_bg_type', 'random'),
        login_left_image: getSettingValue('login', 'login_left_image', null) as File | string | null,
        login_left_color: getSettingValue('login', 'login_left_color', '#f3f4f6'),
        login_left_gradient: getSettingValue('login', 'login_left_gradient', ''),
        login_right_bg_type: getSettingValue('login', 'login_right_bg_type', 'color'),
        login_right_image: getSettingValue('login', 'login_right_image', null) as File | string | null,
        login_right_color: getSettingValue('login', 'login_right_color', '#ffffff'),
        login_right_gradient: getSettingValue('login', 'login_right_gradient', ''),
        login_title: getSettingValue('login', 'login_title', 'خوش آمدید'),
        login_subtitle: getSettingValue('login', 'login_subtitle', 'به حساب کاربری خود وارد شوید'),
        login_copyright: getSettingValue('login', 'login_copyright', '© 2024 تمامی حقوق محفوظ است.'),
        login_slogan_title: getSettingValue('login', 'login_slogan_title', 'آینده وفاداری'),
        login_slogan_text: getSettingValue('login', 'login_slogan_text', 'با پیوستن به باشگاه مشتریان ما، دنیایی از امکانات و جوایز را تجربه کنید.'),
        login_logo: getSettingValue('login', 'login_logo', null) as File | string | null,
        login_title_color: getSettingValue('login', 'login_title_color', '#111827'),
        login_subtitle_color: getSettingValue('login', 'login_subtitle_color', '#6b7280'),
        login_slogan_color: getSettingValue('login', 'login_slogan_color', '#ffffff'),
        login_copyright_color: getSettingValue('login', 'login_copyright_color', '#9ca3af'),
        login_btn_bg: getSettingValue('login', 'login_btn_bg', '#0284c7'),
        login_btn_text: getSettingValue('login', 'login_btn_text', '#ffffff'),
        login_card_bg: getSettingValue('login', 'login_card_bg', '#ffffff'),

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
        resend_interval: getSettingValue('sms', 'resend_interval', '120'),
        sms_ir_template_id: getSettingValue('sms', 'sms_ir_template_id', ''),
        sms_ir_parameter_name: getSettingValue('sms', 'sms_ir_parameter_name', 'Code'),
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
    };
    }, [settings, themeSettings]);

    const { data, setData } = useForm(initialValues);

    // Define fields per tab to prevent overwriting unrelated settings
    const TAB_FIELDS: Record<string, string[]> = {
        general: ['site_title', 'site_description', 'footer_text', 'meta_keywords', 'og_image'],
        theme: ['primary_color', 'sidebar_bg', 'sidebar_text', 'sidebar_texture', 'header_bg', 'radius_size', 'card_style', 'card_shadow', 'card_opacity', 'sidebar_collapsed', 'reset_personal_theme', 'logo_url', 'favicon_url'],
        login: ['login_theme', 'login_layout_reversed', 'login_left_bg_type', 'login_left_image', 'login_left_color', 'login_left_gradient', 'login_right_bg_type', 'login_right_image', 'login_right_color', 'login_right_gradient', 'login_title', 'login_subtitle', 'login_copyright', 'login_slogan_title', 'login_slogan_text', 'login_logo', 'login_title_color', 'login_subtitle_color', 'login_slogan_color', 'login_copyright_color', 'login_btn_bg', 'login_btn_text', 'login_card_bg'],
        contact: ['admin_mobile', 'support_email', 'address'],
        social: ['instagram', 'telegram', 'whatsapp', 'linkedin'],
        sms: ['sms_provider', 'sms_sender', 'sms_api_key', 'sms_username', 'sms_password', 'resend_interval', 'sms_ir_template_id', 'sms_ir_parameter_name'],
        email: ['mail_host', 'mail_port', 'mail_username', 'mail_password', 'mail_from_address', 'mail_from_name'],
        wordpress: ['wp_url', 'wp_consumer_key', 'wp_consumer_secret'],
        support: ['ticket_auto_close_hours', 'support_agents'],
        security: ['max_login_attempts', 'lockout_time', 'session_timeout', 'captcha_enabled'],
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Filter data to only include fields for the active tab
        const fieldsToSubmit = TAB_FIELDS[activeTab] || [];
        const payload: any = { _method: 'post' };

        // Always include _method
        // Add only relevant fields
        fieldsToSubmit.forEach(field => {
            // @ts-ignore
            if (data[field] !== undefined) {
                // @ts-ignore
                payload[field] = data[field];
            }
        });

        // Special case for SEO which is mixed with General in UI but might be separate in logic,
        // but here we grouped them in TAB_FIELDS.general if they are on the same tab.
        // The UI shows GeneralSettings component for 'general' tab.
        // Let's check GeneralSettings component to see if it includes SEO fields.
        // Yes, usually.

        router.post(route('admin.settings.update'), payload, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                // Apply theme settings immediately only if on theme tab
                if (activeTab === 'theme') {
                    const root = document.documentElement;
                    root.style.setProperty('--header-bg', String(data.header_bg));
                    root.style.setProperty('--sidebar-bg', String(data.sidebar_bg));
                    root.style.setProperty('--sidebar-text', String(data.sidebar_text));
                    root.style.setProperty('--sidebar-texture', String(data.sidebar_texture));
                    root.style.setProperty('--radius-xl', String(data.radius_size));
                    root.style.setProperty('--radius-2xl', `calc(${data.radius_size} + 0.25rem)`);
                    root.style.setProperty('--card-opacity', String(data.card_opacity));

                    document.body.setAttribute('data-card-style', String(data.card_style));
                    document.body.setAttribute('data-card-shadow', String(data.card_shadow));

                    // Re-calculate primary colors if needed (simplified here, ideally import utils)
                    root.style.setProperty('--color-primary-500', String(data.primary_color));
                }
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
                <div className="flex-1 card-base p-6 min-h-[600px]">

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
                                    <TemplateEditor key={template.id} template={template} emailThemes={emailThemes} smsTemplates={smsTemplates} />
                                ))}
                            </div>
                        </div>
                    ) : activeTab === 'email_themes' ? (
                        <EmailThemesManager themes={emailThemes} />
                    ) : activeTab === 'sms_templates' ? (
                        <SmsTemplatesManager templates={smsTemplates} />
                    ) : (
                        <form onSubmit={submit} className="space-y-6" encType="multipart/form-data">

                            {activeTab === 'security' && (
                                <SecuritySettings data={data} setData={setData} />
                            )}

                            {activeTab === 'general' && (
                                <GeneralSettings data={data} setData={handleSettingChange} />
                            )}

                            {activeTab === 'login' && (
                                <LoginSettings data={data} setData={handleSettingChange} />
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
                                <EmailSettings data={data} setData={handleSettingChange} emailThemes={emailThemes} />
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
