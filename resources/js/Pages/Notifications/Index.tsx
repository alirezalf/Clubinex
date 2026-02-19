import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps } from '@/types';
import { Bell, Clock, Check, CheckCheck, Trash2, BookOpen, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface Notification {
    id: string;
    data: {
        title: string;
        message: string;
        icon?: string;
        created_at_jalali?: string;
    };
    read_at: string | null;
    created_at: string;
}

interface Props extends PageProps {
    notifications: {
        data: Notification[];
        links: any[];
    };
}

export default function NotificationsIndex({ notifications }: Props) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [localReadIds, setLocalReadIds] = useState<string[]>([]);

    const toggleNotification = (notification: Notification) => {
        const isExpanding = expandedId !== notification.id;
        
        if (isExpanding) {
            setExpandedId(notification.id);
            
            // اگر پیام قبلاً خوانده نشده باشد
            if (!notification.read_at && !localReadIds.includes(notification.id)) {
                // ۱. بلافاصله در ظاهر تیک دوم را بزن
                setLocalReadIds(prev => [...prev, notification.id]);
                
                // ۲. ارسال درخواست به سرور
                router.post(route('notifications.markAsRead', notification.id), {}, {
                    preserveScroll: true,
                    // بسیار مهم: درخواست فقط برای آپدیت عدد اعلان‌ها
                    only: ['notifications', 'unreadNotificationsCount'], 
                    onSuccess: () => {
                        // سرور props جدید را می‌فرستد و Header خودکار آپدیت می‌شود
                    }
                });
            }
        } else {
            setExpandedId(null);
        }
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if(confirm('آیا از حذف این پیام اطمینان دارید؟')) {
            router.delete(route('notifications.destroy', id), {
                preserveScroll: true,
                only: ['notifications', 'unreadNotificationsCount']
            });
        }
    };

    const handleMarkAllRead = () => {
        router.post(route('notifications.readAll'), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setLocalReadIds([]);
            }
        });
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'پیام‌ها و اعلان‌ها' }]}>
            <Head title="صندوق پیام" />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">صندوق پیام</h1>
                <button 
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 bg-primary-50 px-4 py-2 rounded-xl transition shadow-sm border border-primary-100 font-bold"
                >
                    <BookOpen size={16} /> خواندن همه پیام‌ها
                </button>
            </div>

            <div className="space-y-3">
                {notifications.data.map((notification) => {
                    const isExpanded = expandedId === notification.id;
                    const isRead = !!notification.read_at || localReadIds.includes(notification.id);

                    return (
                        <div 
                            key={notification.id} 
                            onClick={() => toggleNotification(notification)}
                            className={clsx(
                                "rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group relative select-none",
                                isRead 
                                    ? 'bg-white border-gray-100 hover:border-gray-200' 
                                    : 'bg-primary-50/40 border-primary-100 shadow-sm ring-1 ring-primary-500/10'
                            )}
                        >
                            <div className="p-4 sm:p-5">
                                <div className="flex items-center gap-4">
                                    <div className={clsx(
                                        "p-2.5 rounded-xl shrink-0 transition-all duration-500",
                                        isRead 
                                            ? "bg-gray-100 text-gray-400 rotate-0" 
                                            : "bg-primary-600 text-white shadow-lg shadow-primary-500/20 rotate-12"
                                    )}>
                                        <Bell size={20} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center gap-2">
                                            <h3 className={clsx(
                                                "text-sm sm:text-base truncate transition-all duration-300",
                                                isRead ? "text-gray-600 font-medium" : "text-gray-900 font-black"
                                            )}>
                                                {notification.data.title}
                                            </h3>
                                            
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="text-[10px] text-gray-400 hidden sm:flex items-center gap-1 font-mono">
                                                    <Clock size={12} />
                                                    {notification.data.created_at_jalali}
                                                </span>
                                                
                                                <div className="flex items-center transition-all duration-300">
                                                    {isRead ? (
                                                        <div className="flex items-center text-blue-500 animate-in zoom-in duration-300" title="خوانده شده">
                                                            <CheckCheck size={18} strokeWidth={3} />
                                                        </div>
                                                    ) : (
                                                        <div className="text-gray-300" title="تحویل شده">
                                                            <Check size={18} strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </div>

                                                <ChevronDown 
                                                    size={18} 
                                                    className={clsx(
                                                        "text-gray-400 transition-transform duration-500",
                                                        isExpanded && "rotate-180 text-primary-500"
                                                    )} 
                                                />
                                            </div>
                                        </div>
                                        
                                        {!isExpanded && (
                                            <p className="text-[11px] text-gray-400 truncate mt-1 max-w-[80%]">
                                                {notification.data.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className={clsx(
                                    "grid transition-all duration-500 ease-in-out",
                                    isExpanded ? "grid-rows-[1fr] opacity-100 mt-5" : "grid-rows-[0fr] opacity-0"
                                )}>
                                    <div className="overflow-hidden">
                                        <div className="pt-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                                            <p className="text-sm text-gray-700 leading-loose flex-1 w-full whitespace-pre-wrap bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
                                                {notification.data.message}
                                            </p>
                                            
                                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                                                <span className="text-[10px] text-gray-400 sm:hidden flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {notification.data.created_at_jalali}
                                                </span>
                                                <button 
                                                    onClick={(e) => handleDelete(e, notification.id)}
                                                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 flex items-center gap-1.5 text-xs font-bold"
                                                >
                                                    <Trash2 size={16} />
                                                    حذف دائمی
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {notifications.data.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                        <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <Bell size={48} className="text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-bold text-lg">صندوق پیام‌های شما خالی است</p>
                    </div>
                )}
            </div>

            {notifications.links.length > 3 && (
                <div className="mt-10 flex justify-center gap-2">
                    {notifications.links.map((link: any, i: number) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            className={clsx(
                                "px-4 py-2 rounded-xl text-sm transition-all duration-300",
                                link.active 
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 font-bold' 
                                    : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50',
                                !link.url && 'opacity-30 cursor-not-allowed pointer-events-none'
                            )}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}