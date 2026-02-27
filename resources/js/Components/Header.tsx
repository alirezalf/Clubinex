import { Link, usePage } from '@inertiajs/react';
import clsx from 'clsx';
import {
    Menu,
    Bell,
    Calendar,
    Home as HomeIcon,
    Grip,
    MessageSquare,
    User,
    ChevronDown,
    LogOut,
    Settings,
    HelpCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import GlobalSearch from '@/Components/GlobalSearch';
import type { PageProps } from '@/types';

interface HeaderProps {
    auth: any;
    toggleSidebar: () => void;
    currentDate: string;
    unreadCount: number;
    isAdmin: boolean;
    onToggleThemePanel: () => void;
}

export default function Header({
    auth,
    toggleSidebar,
    currentDate,
    unreadCount,
    isAdmin,
    onToggleThemePanel,
}: HeaderProps) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    // @ts-ignore
    const { badges } = usePage<
        PageProps & { badges: { user: number; admin: number } }
    >().props;
    const ticketCount = isAdmin ? badges.admin : badges.user;

    const getRoleLabel = () => {
        const roles = auth.user.roles || [];
        if (roles.includes('super-admin') || roles.includes('admin'))
            return 'مدیر کل';
        if (roles.includes('agent')) return 'نماینده فروش';
        return 'کاربر عادی';
    };

    const getRoleColor = () => {
        const roles = auth.user.roles || [];
        if (roles.includes('super-admin'))
            return 'from-purple-500 to-purple-600';
        if (roles.includes('admin')) return 'from-red-500 to-red-600';
        if (roles.includes('agent')) return 'from-green-500 to-green-600';
        return 'from-blue-500 to-blue-600';
    };

    return (
        <header
            className="sticky top-0 z-20 flex h-20 items-center justify-between border-b px-4 shadow-sm backdrop-blur-xl transition-all duration-300 lg:px-8"
            style={{
                backgroundColor: 'var(--header-bg)',
                borderColor: 'var(--header-border)',
                boxShadow: 'var(--header-shadow)',
            }}
        >
            {/* سمت راست - منو و جستجو */}
            <div className="flex flex-1 items-center gap-3">
                <button
                    onClick={toggleSidebar}
                    className="rounded-xl p-2.5 transition-all duration-200 hover:scale-105 active:scale-95 lg:hidden"
                    style={{
                        backgroundColor: 'var(--header-hover)',
                        color: 'var(--header-text)',
                    }}
                    title="منو"
                >
                    <Menu size={22} />
                </button>

                <a
                    href="/"
                    className="group relative rounded-xl p-2.5 transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                        backgroundColor: 'var(--header-hover)',
                        color: 'var(--header-text-muted)',
                    }}
                    title="مشاهده سایت"
                >
                    <HomeIcon
                        size={22}
                        className="transition-transform group-hover:rotate-[-5deg]"
                    />
                    <span className="absolute -right-1 -bottom-1 h-2 w-2 animate-pulse rounded-full bg-green-500" />
                </a>

                {/* جستجوی پیشرفته */}
                <div className="group relative hidden w-full max-w-md md:block">
                    <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 opacity-0 blur transition duration-300 group-hover:opacity-100" />
                    <div className="relative">
                        <GlobalSearch isAdmin={isAdmin} />
                    </div>
                </div>
            </div>

            {/* سمت چپ - آیکون‌ها و پروفایل */}
            <div className="flex items-center gap-2 lg:gap-3">
                {/* تاریخ شمسی */}
                <div
                    className="hidden items-center gap-2.5 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 xl:flex"
                    style={{
                        backgroundColor: 'var(--header-hover)',
                        color: 'var(--header-text)',
                    }}
                >
                    <Calendar size={16} className="text-amber-500" />
                    <span className="tracking-tight">{currentDate}</span>
                </div>

                {/* تیکت‌ها */}
                <Link
                    href={
                        isAdmin
                            ? route('admin.tickets.index')
                            : route('tickets.index')
                    }
                    className="group relative rounded-xl p-2.5 transition-all duration-200 hover:scale-110 active:scale-95"
                    style={{
                        backgroundColor: 'var(--header-hover)',
                        color: 'var(--header-text-muted)',
                    }}
                    title="تیکت‌ها"
                >
                    <MessageSquare
                        size={22}
                        className="transition-transform group-hover:rotate-12"
                    />
                    {ticketCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-red-500 to-red-600 text-[9px] font-bold text-white shadow-lg">
                                {ticketCount > 9 ? '9+' : ticketCount}
                            </span>
                        </span>
                    )}
                </Link>

                {/* اعلان‌ها */}
                <Link
                    href={route('notifications.index')}
                    className="group relative rounded-xl p-2.5 transition-all duration-200 hover:scale-110 active:scale-95"
                    style={{
                        backgroundColor: 'var(--header-hover)',
                        color: 'var(--header-text-muted)',
                    }}
                    title="اعلان‌ها"
                >
                    <Bell
                        size={22}
                        className={clsx(
                            'transition-transform group-hover:rotate-12',
                            unreadCount > 0 &&
                                'animate-[gentle-shake_3s_ease-in-out_infinite]',
                        )}
                    />

                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-red-500 to-red-600 px-1 text-[10px] font-bold text-white shadow-lg">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        </span>
                    )}
                </Link>

                {/* پروفایل کاربر با منوی کشویی - اصلاح شده */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 rounded-xl p-1.5 transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{ backgroundColor: 'var(--header-hover)' }}
                    >
                        {/* آواتار */}
                        <div
                            className={`h-10 w-10 rounded-full bg-gradient-to-tr ${getRoleColor()} p-0.5 shadow-lg`}
                        >
                            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
                                {auth.user.avatar ? (
                                    <img
                                        src={auth.user.avatar}
                                        alt="User"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span
                                        className="text-lg font-bold"
                                        style={{ color: 'var(--primary-600)' }}
                                    >
                                        {auth.user.first_name?.[0]}
                                        {auth.user.last_name?.[0]}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* اطلاعات کاربر */}
                        <div className="hidden text-right md:block">
                            <div
                                className="flex items-center gap-1.5 text-sm font-bold"
                                style={{ color: 'var(--header-text)' }}
                            >
                                {auth.user.first_name} {auth.user.last_name}
                                <ChevronDown
                                    size={16}
                                    className={clsx(
                                        'transition-transform duration-300',
                                        showUserMenu && 'rotate-180',
                                    )}
                                    style={{
                                        color: 'var(--header-text-muted)',
                                    }}
                                />
                            </div>
                        </div>
                    </button>

                    {/* منوی کشویی کاربر - ساده شده با دو گزینه */}
                    {showUserMenu && (
                        <>
                            {/* اوورلی برای بستن منو با کلیک بیرون */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowUserMenu(false)}
                            />

                            {/* منو */}
                            <div
                                className="absolute left-0 z-50 mt-2 w-48 rounded-xl border bg-white py-1 shadow-xl"
                                style={{
                                    borderColor: 'var(--header-border)',
                                }}
                            >
                                {/* گزینه پروفایل */}
                                <Link
                                    href={route('profile')}
                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-right text-sm transition-colors hover:bg-gray-50"
                                    onClick={() => setShowUserMenu(false)}
                                >
                                    <User
                                        size={16}
                                        className="text-amber-500"
                                    />
                                    <span>پروفایل من</span>
                                </Link>

                                {/* خط جداکننده */}
                                <div className="my-1 h-px bg-gray-100" />

                                {/* گزینه خروج */}
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-right text-sm text-red-600 transition-colors hover:bg-red-50"
                                    onClick={() => setShowUserMenu(false)}
                                >
                                    <LogOut size={16} />
                                    <span>خروج</span>
                                </Link>
                            </div>
                        </>
                    )}
                </div>

                {/* دکمه تنظیمات ظاهری */}
                <button
                    onClick={onToggleThemePanel}
                    className="group relative rounded-xl p-2.5 transition-all duration-200 hover:scale-110 hover:rotate-90 active:scale-95"
                    style={{
                        backgroundColor: 'var(--header-hover)',
                        color: 'var(--header-text-muted)',
                    }}
                    title="تنظیمات ظاهری"
                >
                    <Grip size={22} className="group-hover:animate-spin-slow" />
                    <span className="absolute -right-1 -bottom-1 h-2 w-2 rounded-full bg-amber-500" />
                </button>
            </div>

            <style>{`
                @keyframes gentle-shake {
                    0%, 100% { transform: rotate(0); }
                    5%, 15%, 25%, 35%, 45% { transform: rotate(8deg); }
                    10%, 20%, 30%, 40% { transform: rotate(-8deg); }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }
            `}</style>
        </header>
    );
}
