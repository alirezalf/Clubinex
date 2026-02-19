import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps } from '@/types';
import { MessageSquare, Plus, Archive, LayoutList, RefreshCcw, CheckCircle2, Search, X, Clock, AlertCircle } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import clsx from 'clsx';

type Props = PageProps<{
    tickets: { data: any[]; links: any[] };
    filters?: { status?: string };
}>;

export default function TicketsIndex({ tickets, filters, auth, flash }: Props) {
    const [showModal, setShowModal] = useState(false);
    const currentStatus = filters?.status || 'active';

    const { data, setData, post, processing, reset, errors } = useForm({
        subject: '',
        department: 'support',
        priority: 'medium',
        message: ''
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tickets.store'), {
            onSuccess: () => { 
                setShowModal(false); 
                reset(); 
            }
        });
    };

    const handleFilter = (status: string) => {
        router.get(route('tickets.index'), { status }, { 
            preserveState: true,
            preserveScroll: true 
        });
    };

    const tabs = [
        { id: 'active', label: 'تیکت‌های باز', icon: RefreshCcw, color: 'text-blue-600' },
        { id: 'answered', label: 'پاسخ داده شده', icon: CheckCircle2, color: 'text-green-600' },
        { id: 'closed', label: 'بسته شده', icon: Archive, color: 'text-gray-500' },
        { id: 'all', label: 'همه تیکت‌ها', icon: LayoutList, color: 'text-purple-600' },
    ];

    return (
        <DashboardLayout breadcrumbs={[{ label: 'پشتیبانی و تیکت' }]}>
            <Head title="تیکت‌های پشتیبانی" />

            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-primary-50 rounded-xl">
                            <MessageSquare className="text-primary-600" size={28} />
                        </div>
                        مرکز پشتیبانی و تیکت
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 mr-12">سوالات و مشکلات خود را با ما در میان بگذارید.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="w-full md:w-auto bg-primary-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-700 transition shadow-xl shadow-primary-500/30 font-bold transform active:scale-95"
                >
                    <Plus size={20} /> ارسال تیکت جدید
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 mb-8 w-fit overflow-x-auto max-w-full scrollbar-none">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleFilter(tab.id)}
                        className={clsx(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                            currentStatus === tab.id 
                                ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20" 
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                        )}
                    >
                        <tab.icon size={18} className={currentStatus === tab.id ? "text-white" : tab.color} /> 
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content List */}
            <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100 min-h-[400px] flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50/50 text-gray-400 font-bold text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-5">موضوع و شناسه</th>
                                <th className="px-6 py-5">دپارتمان</th>
                                <th className="px-6 py-5">اولویت</th>
                                <th className="px-6 py-5">وضعیت</th>
                                <th className="px-6 py-5">آخرین بروزرسانی</th>
                                <th className="px-6 py-5 text-center">عملیات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tickets.data.map((ticket: any) => (
                                <tr key={ticket.id} className="group hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-black text-gray-800 text-base group-hover:text-primary-600 transition-colors">{ticket.subject}</span>
                                            <span className="text-[10px] text-gray-400 font-mono mt-1">#TICKET-{ticket.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary-400"></div>
                                            <span className="text-gray-600 font-medium">
                                                {ticket.department === 'support' ? 'پشتیبانی' : 
                                                 ticket.department === 'sales' ? 'فروش و مالی' : 'فنی و وب‌سایت'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={clsx(
                                            "px-3 py-1 rounded-lg text-[10px] font-black uppercase",
                                            ticket.priority === 'high' ? "bg-red-50 text-red-600 border border-red-100" :
                                            ticket.priority === 'medium' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                            "bg-green-50 text-green-600 border border-green-100"
                                        )}>
                                            {ticket.priority === 'high' ? 'فوری' : ticket.priority === 'medium' ? 'متوسط' : 'عادی'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className={clsx(
                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all",
                                            ticket.status === 'closed' ? "bg-gray-100 text-gray-500" :
                                            ticket.status === 'answered' ? "bg-green-100 text-green-700 animate-pulse shadow-sm ring-1 ring-green-200" :
                                            ticket.status === 'customer_reply' ? "bg-blue-50 text-blue-600" :
                                            "bg-primary-50 text-primary-700"
                                        )}>
                                            {ticket.status === 'answered' && <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>}
                                            {ticket.status_farsi}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-gray-500 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} className="text-gray-300" />
                                            {ticket.created_at_jalali}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <Link 
                                            href={route('tickets.show', ticket.id)}
                                            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-primary-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-primary-600 hover:text-white hover:border-primary-600 hover:shadow-lg transition-all"
                                        >
                                            مشاهده گفتگو
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {tickets.data.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <div className="bg-gray-50 p-6 rounded-full mb-4">
                            <MessageSquare size={64} className="text-gray-200" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700">تیکتی یافت نشد</h3>
                        <p className="text-sm text-gray-400 mt-1">شما در این بخش هنوز تیکتی ثبت نکرده‌اید.</p>
                        <button onClick={() => setShowModal(true)} className="mt-6 text-primary-600 font-black hover:underline flex items-center gap-1">
                            <Plus size={18} /> ارسال اولین تیکت
                        </button>
                    </div>
                )}
            </div>

            <Pagination links={tickets.links} />

            {/* Create Ticket Modal (Optimized UI) */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">ارسال درخواست جدید</h3>
                                <p className="text-[11px] text-gray-500">لطفاً جزئیات را به دقت وارد کنید.</p>
                            </div>
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={submit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 mr-1">موضوع تیکت</label>
                                <input 
                                    type="text" 
                                    value={data.subject} 
                                    onChange={e => setData('subject', e.target.value)} 
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none" 
                                    placeholder="مثلا: سوال در مورد امتیازات محصول"
                                    required 
                                />
                                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 mr-1">دپارتمان مربوطه</label>
                                    <select 
                                        value={data.department} 
                                        onChange={e => setData('department', e.target.value)} 
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none bg-white"
                                    >
                                        <option value="support">واحد پشتیبانی عمومی</option>
                                        <option value="sales">واحد فروش و هدایا</option>
                                        <option value="technical">واحد فنی و وب‌سایت</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 mr-1">سطح اولویت</label>
                                    <select 
                                        value={data.priority} 
                                        onChange={e => setData('priority', e.target.value)} 
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none bg-white"
                                    >
                                        <option value="low">کم (عادی)</option>
                                        <option value="medium">متوسط</option>
                                        <option value="high">زیاد (فوری)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 mr-1">شرح درخواست</label>
                                <textarea 
                                    value={data.message} 
                                    onChange={e => setData('message', e.target.value)} 
                                    rows={4} 
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none resize-none" 
                                    placeholder="جزئیات کامل درخواست خود را بنویسید..."
                                    required
                                ></textarea>
                                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                            </div>

                            <div className="bg-blue-50 p-3 rounded-xl flex gap-2 items-start border border-blue-100">
                                <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                                    لطفاً از ارسال تیکت‌های تکراری خودداری کنید تا روند پاسخگویی سریع‌تر انجام شود.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)} 
                                    className="px-5 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors text-sm"
                                >
                                    انصراف
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing} 
                                    className="bg-primary-600 text-white px-6 py-2.5 rounded-xl hover:bg-primary-700 font-bold shadow-lg shadow-primary-500/20 transition-all transform active:scale-95 disabled:opacity-50 text-sm"
                                >
                                    {processing ? 'در حال ارسال...' : 'ثبت تیکت'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}