import axios from 'axios';
import { usePage, router } from '@inertiajs/react';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import React, { useState, useEffect, Suspense, lazy } from 'react';
import type { BreadcrumbItem } from '@/Components/Breadcrumbs';
import Breadcrumbs from '@/Components/Breadcrumbs';
import Header from '@/Components/Header';
import Sidebar from '@/Components/Sidebar';
import ToastContainer from '@/Components/Dashboard/ToastContainer';
import type { PageProps } from '@/types';
import { useThemeSystem, ThemeSettings } from '@/Hooks/useThemeSystem';

const ThemeSettingsPanel = lazy(() => import('@/Components/ThemeSettingsPanel'));
const DynamicSlider = lazy(() => import('@/Components/DynamicSlider'));

interface DashboardLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function DashboardLayout({ children, breadcrumbs }: DashboardLayoutProps) {
    // دریافت pageSlider از پراپ‌های سراسری
    const { auth, themeSettings, flash, unreadNotificationsCount, pageSlider } =
        usePage<PageProps<{ themeSettings?: ThemeSettings, unreadNotificationsCount: number, pageSlider?: any }>>().props;

    // Apply Theme Globally
    useThemeSystem(themeSettings);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        const defaultCollapsed = String(themeSettings?.sidebar_collapsed) === '1' || String(themeSettings?.sidebar_collapsed) === 'true';
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('sidebarCollapsed');
            const savedDefault = sessionStorage.getItem('sidebarDefaultCollapsed');

            // If the default setting from server changed, ignore the saved personal toggle
            if (savedDefault !== null && JSON.parse(savedDefault) !== defaultCollapsed) {
                sessionStorage.removeItem('sidebarCollapsed');
                sessionStorage.setItem('sidebarDefaultCollapsed', JSON.stringify(defaultCollapsed));
                return defaultCollapsed;
            }

            if (savedDefault === null) {
                sessionStorage.setItem('sidebarDefaultCollapsed', JSON.stringify(defaultCollapsed));
            }

            if (saved !== null) return JSON.parse(saved);
        }
        return defaultCollapsed;
    });

    // Listen for themeSettings changes (e.g. after saving Theme Settings Panel)
    useEffect(() => {
        const defaultCollapsed = String(themeSettings?.sidebar_collapsed) === '1' || String(themeSettings?.sidebar_collapsed) === 'true';
        if (typeof window !== 'undefined') {
            const savedDefault = sessionStorage.getItem('sidebarDefaultCollapsed');
            if (savedDefault !== null && JSON.parse(savedDefault) !== defaultCollapsed) {
                // Settings changed on the server! Updates local state & storage
                sessionStorage.removeItem('sidebarCollapsed');
                sessionStorage.setItem('sidebarDefaultCollapsed', JSON.stringify(defaultCollapsed));
                setIsSidebarCollapsed(defaultCollapsed);
            }
        }
    }, [themeSettings?.sidebar_collapsed]);

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['unreadNotificationsCount', 'badges']
            });

            // اجرای اتوماتیک صف‌های پس‌زمینه (جاب‌ها) روی هاست اشتراکی - فقط برای ادمین
            if (auth.user?.roles?.includes('super-admin') || auth.user?.roles?.includes('admin')) {
                axios.post('/admin/system/run-queue').catch(() => {});
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [auth]);

    const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('fa-IR', {
            calendar: 'persian',
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        const parts = formatter.formatToParts(now);

        let weekday = '', day = '', month = '', year = '';

        parts.forEach(part => {
            if (part.type === 'weekday') weekday = part.value;
            if (part.type === 'day') day = part.value;
            if (part.type === 'month') month = part.value;
            if (part.type === 'year') year = part.value;
        });

        // Convert Persian digits to Latin digits
        const toLatinDigits = (str: string) => str.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());

        setCurrentDate(`${weekday} ${toLatinDigits(day)} ${month} ${toLatinDigits(year)}`);
    }, []);

    return (
        <div className="min-h-screen font-sans" dir="rtl" style={{ background: 'var(--body-bg-gradient, #f9fafb)', transition: 'background 0.5s ease' }}>
            <Suspense fallback={null}>
                {isThemePanelOpen && (
                    <ThemeSettingsPanel
                        isOpen={isThemePanelOpen}
                        onClose={() => setIsThemePanelOpen(false)}
                        currentSettings={themeSettings}
                    />
                )}
            </Suspense>

            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                toggleCollapse={() => {
                    const newVal = !isSidebarCollapsed;
                    setIsSidebarCollapsed(newVal);
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem('sidebarCollapsed', JSON.stringify(newVal));
                    }
                }}
                onOpenThemePanel={() => setIsThemePanelOpen(true)}
            />

            <div className={clsx(
                'flex min-h-screen flex-col transition-all duration-300',
                isSidebarCollapsed ? 'lg:mr-[72px]' : 'lg:mr-[260px]',
            )}>
                <Header
                    auth={auth}
                    toggleSidebar={() => setIsSidebarOpen(true)}
                    currentDate={currentDate}
                    unreadCount={unreadNotificationsCount}
                    isAdmin={auth.user?.roles?.includes('super-admin') || auth.user?.roles?.includes('admin')}
                    onToggleThemePanel={() => setIsThemePanelOpen(true)}
                />

                <main className="flex-1 p-4 lg:p-8">
                    <div className="mx-auto max-w-7xl space-y-6">
                        {/* 1. Global Page Slider (Inserted Automatically) */}
                        {pageSlider && (
                            <div className="mb-6 animate-in fade-in slide-in-from-top-4">
                                <Suspense fallback={<div className="h-48 w-full bg-gray-100/50 animate-pulse rounded-2xl" />}>
                                    <DynamicSlider slider={pageSlider} />
                                </Suspense>
                            </div>
                        )}

                        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
                        {children}
                    </div>
                </main>
            </div>

            <ToastContainer flash={flash} />
        </div>
    );
}
