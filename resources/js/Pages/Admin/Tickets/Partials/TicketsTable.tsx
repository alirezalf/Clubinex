import React from 'react';
import { Link } from '@inertiajs/react';
import { MessageSquare, User, Clock } from 'lucide-react';
import clsx from 'clsx';

interface Ticket {
    id: number;
    subject: string;
    status: string;
    status_farsi: string;
    priority: string;
    department: string;
    user: { id: number; first_name: string; last_name: string; mobile: string };
    created_at_jalali: string;
}

interface Props {
    tickets: Ticket[];
}

export default function TicketsTable({ tickets }: Props) {
    if (tickets.length === 0) return null;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
                <thead className="bg-gray-50/50 text-gray-400 font-bold text-xs uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-5 w-16 text-center">ID</th>
                        <th className="px-6 py-5">اطلاعات کاربر</th>
                        <th className="px-6 py-5">موضوع درخواست</th>
                        <th className="px-6 py-5">اولویت</th>
                        <th className="px-6 py-5">وضعیت فعلی</th>
                        <th className="px-6 py-5">تاریخ ثبت</th>
                        <th className="px-6 py-5 text-center">عملیات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {tickets.map((ticket) => (
                        <tr key={ticket.id} className="group hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-5 text-center text-gray-400 font-mono">#{ticket.id}</td>
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                                        <User size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <Link href={route('admin.users', {search: ticket.user.mobile})} className="font-black text-gray-800 hover:text-primary-600 transition-colors">
                                            {ticket.user.first_name} {ticket.user.last_name}
                                        </Link>
                                        <span className="text-[10px] text-gray-400 font-mono tracking-tighter">{ticket.user.mobile}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <div className="font-bold text-gray-700 group-hover:text-primary-600 transition-colors">{ticket.subject}</div>
                                <div className="text-[10px] text-gray-400 mt-1 uppercase opacity-60">دپارتمان: {ticket.department}</div>
                            </td>
                            <td className="px-6 py-5">
                                <span className={clsx(
                                    "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase",
                                    ticket.priority === 'high' ? "bg-red-50 text-red-600 border border-red-100" :
                                    ticket.priority === 'medium' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                    "bg-blue-50 text-blue-600 border border-blue-100"
                                )}>
                                    {ticket.priority === 'high' ? 'فوری' : ticket.priority === 'medium' ? 'متوسط' : 'عادی'}
                                </span>
                            </td>
                            <td className="px-6 py-5">
                                <div className={clsx(
                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shadow-sm ring-1 ring-inset",
                                    ticket.status === 'open' ? "bg-red-50 text-red-700 ring-red-100 animate-pulse" :
                                    ticket.status === 'customer_reply' ? "bg-orange-50 text-orange-700 ring-orange-100 animate-pulse" :
                                    ticket.status === 'answered' ? "bg-green-50 text-green-700 ring-green-100" :
                                    "bg-gray-100 text-gray-500 ring-gray-200"
                                )}>
                                    {(ticket.status === 'open' || ticket.status === 'customer_reply') && <div className="w-1.5 h-1.5 rounded-full bg-current"></div>}
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
                                    href={route('admin.tickets.show', ticket.id)}
                                    className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all transform active:scale-95"
                                >
                                    <MessageSquare size={16} />
                                    پاسخگویی
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}