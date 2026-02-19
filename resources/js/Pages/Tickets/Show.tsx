import React, { useEffect, useRef, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps } from '@/types';
import { Send, User, ShieldCheck, XCircle, Headset, RefreshCcw } from 'lucide-react';

export default function TicketShow({ auth, ticket, messages }: PageProps<{ ticket: any, messages: any[] }>) {
    const { data, setData, post, processing, reset } = useForm({
        message: ''
    });

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const lastMessageCount = useRef(messages.length);
    const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // --- 1. اسکرول خودکار به پایین ---
    useEffect(() => {
        if (messagesContainerRef.current && messages.length > lastMessageCount.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
            lastMessageCount.current = messages.length;
        }
    }, [messages]);

    // اسکرول اولیه
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, []);

    // --- 2. سیستم Polling بهینه شده (Recursive Timeout) ---
    const schedulePoll = () => {
        // پاک کردن تایمر قبلی اگر وجود دارد
        if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);

        // اگر تیکت بسته شده، دیگر ادامه نده
        if (ticket.status === 'closed') return;

        pollTimeoutRef.current = setTimeout(() => {
            // اگر کاربر در حال ارسال پیام است یا صفحه مخفی است، درخواست نفرست ولی تایمر را ریست کن
            if (processing || document.hidden) {
                schedulePoll(); 
                return;
            }

            router.reload({
                only: ['messages', 'ticket'],
                // نکته کلیدی: درخواست بعدی را فقط وقتی قبلی تمام شد زمان‌بندی کن
                onFinish: () => schedulePoll(),
                // اگر ارور داد هم دوباره تلاش کن
                onError: () => schedulePoll()
            });
        }, 6000); // افزایش زمان به 6 ثانیه برای کاهش فشار
    };

    useEffect(() => {
        schedulePoll();

        // پاکسازی هنگام خروج از صفحه
        return () => {
            if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
        };
    }, [ticket.status, processing]); // اضافه شدن processing به وابستگی‌ها

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // توقف پولینگ هنگام ارسال برای جلوگیری از تداخل
        if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);

        post(route('tickets.reply', ticket.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setTimeout(() => {
                    if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTo({
                            top: messagesContainerRef.current.scrollHeight,
                            behavior: 'smooth'
                        });
                    }
                }, 100);
            },
            onFinish: () => {
                // شروع مجدد پولینگ بعد از اتمام ارسال
                schedulePoll();
            }
        });
    };

    const handleClose = () => {
        if (confirm('آیا از بستن این تیکت اطمینان دارید؟')) {
            router.post(route('tickets.close', ticket.id));
        }
    };

    return (
        <DashboardLayout breadcrumbs={[
            { label: 'تیکت‌ها', href: route('tickets.index') },
            { label: `تیکت #${ticket.id}` }
        ]}>
            <Head title={`تیکت: ${ticket.subject}`} />

            {/* Agent Info Banner */}
            {ticket.assigned_to && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="w-12 h-12 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center overflow-hidden">
                        {ticket.assigned_to.avatar ? (
                            <img src={ticket.assigned_to.avatar} alt="Agent" className="w-full h-full object-cover" />
                        ) : (
                            <Headset size={24} className="text-blue-500" />
                        )}
                    </div>
                    <div>
                        <div className="text-xs text-blue-600 font-bold mb-0.5">کارشناس پاسخگو:</div>
                        <div className="font-bold text-gray-800">{ticket.assigned_to.first_name} {ticket.assigned_to.last_name}</div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 flex flex-col h-[calc(100vh-250px)] min-h-[500px]">
                {/* Ticket Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50 shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                            {ticket.subject}
                            {ticket.status !== 'closed' && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                            )}
                        </h1>
                        <div className="flex gap-3 text-xs text-gray-500">
                            <span>دپارتمان: {ticket.department}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full self-center"></span>
                            <span>اولویت: {ticket.priority}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full self-center"></span>
                            <span>تاریخ: {ticket.created_at_jalali}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            ticket.status === 'closed' ? 'bg-gray-100 text-gray-600' : 
                            ticket.status === 'answered' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                            {ticket.status_farsi}
                        </span>
                        {ticket.status !== 'closed' && (
                            <button 
                                onClick={handleClose}
                                className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs hover:bg-red-100 transition border border-red-100"
                            >
                                <XCircle size={14} /> بستن
                            </button>
                        )}
                    </div>
                </div>

                {/* Messages Area */}
                <div 
                    ref={messagesContainerRef}
                    className="bg-white p-6 flex-1 overflow-y-auto space-y-6 flex flex-col scrollbar-thin scrollbar-thumb-gray-200"
                >
                    {messages.map((msg) => {
                        const isMe = msg.user_id === auth.user.id;
                        
                        return (
                            <div 
                                key={msg.id} 
                                className={`flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${isMe ? 'self-start flex-row-reverse' : 'self-end flex-row'}`}
                            >
                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}`}>
                                    {isMe ? <User size={20} /> : <ShieldCheck size={20} />}
                                </div>
                                
                                {/* Bubble */}
                                <div className={`rounded-2xl p-4 shadow-sm text-sm whitespace-pre-wrap leading-relaxed 
                                    ${isMe 
                                        ? 'bg-primary-50 text-gray-800 rounded-tr-none border border-primary-100' 
                                        : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-200'
                                    }`}
                                >
                                    {msg.message}
                                    <div className={`text-[10px] mt-2 opacity-60 text-left flex items-center gap-1`}>
                                        {msg.created_at_jalali}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Reply Form */}
                <div className="shrink-0 bg-white border-t border-gray-100 p-4">
                    {ticket.status !== 'closed' ? (
                        <form onSubmit={submit} className="relative">
                            <textarea
                                value={data.message}
                                onChange={e => setData('message', e.target.value)}
                                placeholder="پاسخ خود را بنویسید..."
                                className="w-full border-gray-300 rounded-xl pr-4 pl-12 py-3 focus:ring-primary-500 focus:border-primary-500 resize-none shadow-sm transition-shadow focus:shadow-md"
                                rows={3}
                                required
                            ></textarea>
                            <button
                                type="submit"
                                disabled={processing || !data.message.trim()}
                                className="absolute left-3 bottom-3 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center"
                            >
                                {processing ? <RefreshCcw size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </form>
                    ) : (
                        <div className="bg-gray-100 text-center text-gray-500 text-sm p-3 rounded-xl border border-gray-200 flex items-center justify-center gap-2">
                            <XCircle size={16} />
                            این تیکت بسته شده است و امکان ارسال پاسخ وجود ندارد.
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}