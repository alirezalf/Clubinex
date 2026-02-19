import React, { useEffect, useRef, useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps } from '@/types';
import { Send, User, ShieldCheck, XCircle, ArrowRight, RefreshCcw, Bell } from 'lucide-react';

export default function AdminTicketShow({ auth, ticket, messages }: PageProps<{ ticket: any, messages: any[] }>) {
    const { data, setData, post, processing, reset } = useForm({
        message: ''
    });

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const lastMessageCount = useRef(messages.length);
    const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // --- 1. اسکرول خودکار هوشمند ---
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

    // --- 2. سیستم Polling بهینه شده ---
    const schedulePoll = () => {
        if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);

        if (ticket.status === 'closed') return;

        pollTimeoutRef.current = setTimeout(() => {
            if (processing || document.hidden) {
                schedulePoll();
                return;
            }

            router.reload({
                only: ['messages', 'ticket'],
                onFinish: () => schedulePoll(),
                onError: () => schedulePoll()
            });
        }, 6000);
    };

    useEffect(() => {
        schedulePoll();
        return () => {
            if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
        };
    }, [ticket.status, processing]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // توقف پولینگ هنگام سابمیت
        if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);

        post(route('admin.tickets.reply', ticket.id), {
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
                // شروع مجدد پولینگ
                schedulePoll();
            }
        });
    };

    const closeTicket = () => {
        if(confirm('آیا از بستن این تیکت اطمینان دارید؟')) {
            router.post(route('admin.tickets.close', ticket.id));
        }
    }

    return (
        <DashboardLayout breadcrumbs={[
            { label: 'مدیریت تیکت‌ها', href: route('admin.tickets.index') },
            { label: `تیکت #${ticket.id}` }
        ]}>
            <Head title={`مدیریت تیکت: ${ticket.subject}`} />

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <Link href={route('admin.tickets.index')} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <ArrowRight size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        پاسخگویی به تیکت
                        {ticket.status !== 'closed' && (
                            <span className="flex h-2 w-2 relative" title="ارتباط زنده">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                        )}
                    </h1>
                </div>
                <div className="flex gap-2">
                    {ticket.status !== 'closed' && (
                        <button onClick={closeTicket} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition text-sm font-bold">
                            <XCircle size={18} /> بستن تیکت
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50 shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 mb-2">{ticket.subject}</h1>
                        <div className="flex gap-4 text-xs text-gray-500">
                            <Link href={route('admin.users', {search: ticket.user?.mobile})} className="flex items-center gap-1 hover:text-primary-600 underline font-medium">
                                <User size={12}/> {ticket.user?.first_name} {ticket.user?.last_name} ({ticket.user?.mobile})
                            </Link>
                            <span className="w-1 h-1 bg-gray-300 rounded-full self-center"></span>
                            <span>دپارتمان: {ticket.department}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full self-center"></span>
                            <span>اولویت: {ticket.priority}</span>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ticket.status === 'closed' ? 'bg-gray-100 text-gray-600' : 
                        ticket.status === 'open' ? 'bg-red-100 text-red-700 animate-pulse' :
                        ticket.status === 'customer_reply' ? 'bg-orange-100 text-orange-700 animate-pulse' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                        {ticket.status_farsi}
                    </span>
                </div>

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
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>
                                    {isMe ? <ShieldCheck size={20} /> : <User size={20} />}
                                </div>
                                <div className={`rounded-2xl p-4 shadow-sm text-sm whitespace-pre-wrap leading-relaxed
                                    ${isMe 
                                        ? 'bg-blue-50 border border-blue-100 text-gray-800 rounded-tr-none' 
                                        : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-none'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold opacity-70">{isMe ? 'پشتیبان (شما)' : 'کاربر'}</span>
                                    </div>
                                    {msg.message}
                                    <div className={`text-[10px] mt-2 opacity-50 text-left`}>
                                        {msg.created_at_jalali}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="shrink-0 bg-white border-t border-gray-100 p-4">
                    {ticket.status !== 'closed' ? (
                        <form onSubmit={submit} className="relative">
                            <textarea
                                value={data.message}
                                onChange={e => setData('message', e.target.value)}
                                placeholder="پاسخ خود را بنویسید..."
                                className="w-full border-gray-300 rounded-xl pr-4 pl-12 py-3 focus:ring-primary-500 focus:border-primary-500 resize-none shadow-sm transition-shadow focus:shadow-md"
                                rows={4}
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