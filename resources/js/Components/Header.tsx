import React from 'react';
import { Menu, Bell, Calendar, Home as HomeIcon, Grip, MessageSquare } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import clsx from 'clsx';
import GlobalSearch from '@/Components/GlobalSearch';

interface HeaderProps {
    auth: any;
    toggleSidebar: () => void;
    currentDate: string;
    unreadCount: number;
    // Props مربوط به جستجوی قدیمی حذف شدند چون در GlobalSearch مدیریت می‌شوند
    isAdmin: boolean;
    onToggleThemePanel: () => void;
}

export default function Header({ 
    auth, 
    toggleSidebar, 
    currentDate, 
    unreadCount, 
    isAdmin,
    onToggleThemePanel 
}: HeaderProps) {
    
    // @ts-ignore
    const { badges } = usePage<PageProps & { badges: { user: number, admin: number } }>().props;
    const ticketCount = isAdmin ? badges.admin : badges.user;

    const getRoleLabel = () => {
        const roles = auth.user.roles || [];
        if (roles.includes('super-admin') || roles.includes('admin')) return 'مدیر کل';
        if (roles.includes('agent')) return 'نماینده فروش';
        return 'کاربر عادی';
    };

    return (
        <header 
            className="h-20 backdrop-blur-md shadow-sm z-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 border-b border-gray-100 transition-colors duration-300" 
            style={{ 
                backgroundColor: 'var(--header-bg)', 
                color: 'var(--header-text)',
                borderColor: 'rgba(0,0,0,0.05)'
            }}
        >
            <div className="flex items-center gap-4 w-full max-w-2xl">
                <button 
                    onClick={toggleSidebar} 
                    className="lg:hidden p-2 rounded-xl transition hover:bg-black/5" 
                    style={{ color: 'var(--header-text)' }}
                >
                    <Menu size={24} />
                </button>
                
                <a 
                    href="/" 
                    className="flex items-center justify-center p-2 rounded-xl transition hover:bg-black/5"
                    style={{ color: 'var(--header-text-muted)' }}
                    title="مشاهده سایت"
                >
                    <HomeIcon size={20} />
                </a>

                {/* بخش جستجوی جدید */}
                <div className="hidden md:block w-full max-w-md">
                    <GlobalSearch isAdmin={isAdmin} />
                </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-6 shrink-0">
                
                <div 
                    className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--header-hover)]" 
                    style={{ color: 'var(--header-text)' }}
                >
                    <Calendar size={14} />
                    <span>{currentDate}</span>
                </div>

                <Link 
                    href={isAdmin ? route('admin.tickets.index') : route('tickets.index')} 
                    className="relative p-2.5 rounded-xl transition flex items-center justify-center hover:bg-[var(--header-hover)] group" 
                    style={{ color: 'var(--header-text-muted)' }}
                    title="تیکت‌ها"
                >
                    <MessageSquare size={22} className="group-hover:scale-110 transition-transform" />
                    {ticketCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                    )}
                </Link>

                <Link 
                    href={route('notifications.index')} 
                    className="relative p-2.5 rounded-xl transition flex items-center justify-center hover:bg-[var(--header-hover)] group" 
                    style={{ color: 'var(--header-text-muted)' }}
                    title="اعلان‌ها"
                >
                    <Bell size={22} className={clsx("group-hover:scale-110 transition-transform", unreadCount > 0 && "animate-[bell-ring_2s_infinite]")} />
                    
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px]">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 min-w-[16px] bg-red-600 text-[9px] text-white font-black items-center justify-center px-1 border border-white shadow-sm animate-pulse">
                                {unreadCount > 99 ? '+99' : unreadCount}
                            </span>
                        </span>
                    )}
                </Link>

                <Link 
                    href={route('profile')} 
                    className="flex items-center gap-3 hover:bg-[var(--header-hover)] p-1.5 rounded-xl transition"
                >
                    <div className="hidden md:block text-left">
                        <div className="text-sm font-bold" style={{ color: 'var(--header-text)' }}>
                            {auth.user.first_name} {auth.user.last_name}
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--header-text-muted)' }}>
                            {getRoleLabel()}
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-purple-600 p-0.5">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                            {auth.user.avatar ? (
                                <img src={auth.user.avatar} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold text-primary-600">{auth.user.first_name?.[0]}</span>
                            )}
                        </div>
                    </div>
                </Link>

                <button 
                    onClick={onToggleThemePanel}
                    className="flex items-center justify-center p-2 rounded-xl transition hover:bg-[var(--header-hover)]"
                    style={{ color: 'var(--header-text-muted)' }}
                    title="تنظیمات ظاهری"
                >
                    <Grip size={22} />
                </button>
            </div>
            
            <style>{`
                @keyframes bell-ring {
                    0%, 100% { transform: rotate(0); }
                    10%, 30%, 50%, 70%, 90% { transform: rotate(10deg); }
                    20%, 40%, 60%, 80% { transform: rotate(-10deg); }
                }
            `}</style>
        </header>
    );
}