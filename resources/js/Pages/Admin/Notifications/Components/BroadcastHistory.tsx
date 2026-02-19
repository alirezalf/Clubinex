import React, { useState } from 'react';
import { History, Eye, Database, Smartphone, Mail, X, User } from 'lucide-react';
import Pagination from '@/Components/Pagination';

export default function BroadcastHistory({ history }: any) {
    const [selectedBroadcast, setSelectedBroadcast] = useState<any>(null);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <History size={20} className="text-gray-500" />
                    سوابق اعلان‌های ارسال شده
                </h2>
                <span className="text-xs text-gray-500">مجموع: {history.total} مورد</span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-6 py-4">عنوان پیام</th>
                            <th className="px-6 py-4">هدف ارسال</th>
                            <th className="px-6 py-4">کانال‌ها</th>
                            <th className="px-6 py-4">تعداد گیرنده</th>
                            <th className="px-6 py-4">زمان ارسال</th>
                            <th className="px-6 py-4">عملیات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {history.data.map((item: any) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 font-bold text-gray-800">{item.title}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 px-2.5 py-1 rounded-lg text-[11px] font-bold text-gray-600 border border-gray-200">
                                        {item.target_label}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-1.5">
                                        {item.channels.map((ch: string) => (
                                            <span key={ch} title={ch} className="p-1.5 rounded-lg bg-gray-50 text-gray-400 border border-gray-200">
                                                {ch === 'database' && <Database size={14} className="text-blue-500" />}
                                                {ch === 'sms' && <Smartphone size={14} className="text-green-500" />}
                                                {ch === 'email' && <Mail size={14} className="text-purple-500" />}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-black text-primary-600">{item.recipient_count}</span>
                                    <span className="text-[10px] text-gray-400 mr-1">نفر</span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-xs dir-ltr text-right">{item.created_at_jalali}</td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => setSelectedBroadcast(item)}
                                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition border border-transparent hover:border-primary-100"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {history.data.length === 0 && (
                <div className="p-20 text-center text-gray-400">
                    <History size={48} className="mx-auto mb-4 opacity-20" />
                    <p>هنوز هیچ اعلانی ارسال نشده است.</p>
                </div>
            )}
            <Pagination links={history.links} />

            {/* Detail Modal */}
            {selectedBroadcast && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                            <h3 className="font-bold text-lg">جزئیات اعلان</h3>
                            <button onClick={() => setSelectedBroadcast(null)} className="p-1 hover:bg-gray-200 rounded-lg transition"><X size={20} className="text-gray-400" /></button>
                        </div>
                        <div className="p-6 space-y-5 overflow-y-auto flex-1 scrollbar-thin">
                            <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">عنوان</span>
                                <div className="font-bold text-gray-800 text-lg leading-tight">{selectedBroadcast.title}</div>
                            </div>
                            
                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 shadow-inner">
                                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-2">متن پیام:</span>
                                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedBroadcast.message}</div>
                            </div>

                            {/* Recipients Details Section */}
                            {selectedBroadcast.target_type === 'manual' && selectedBroadcast.recipients_list && (
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-2 flex items-center gap-1">
                                        <User size={12} /> کاربران انتخاب شده:
                                    </span>
                                    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50 max-h-48 overflow-y-auto shadow-sm">
                                        {selectedBroadcast.recipients_list.map((rec: any) => (
                                            <div key={rec.id} className="p-3 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                                <div className="text-xs font-bold text-gray-700">{rec.first_name} {rec.last_name}</div>
                                                <div className="text-[10px] font-mono text-gray-400">{rec.mobile}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                    <span className="text-[10px] text-blue-600 block mb-1 font-bold">هدف ارسال</span>
                                    <span className="text-sm font-bold text-blue-800">{selectedBroadcast.target_label}</span>
                                </div>
                                <div className="bg-green-50/50 p-3 rounded-xl border border-green-100">
                                    <span className="text-[10px] text-green-600 block mb-1 font-bold">گیرندگان</span>
                                    <span className="text-sm font-bold text-green-800">{selectedBroadcast.recipient_count} نفر</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-gray-400 pt-2 border-t font-medium shrink-0">
                                <span>ارسال توسط: {selectedBroadcast.admin_name}</span>
                                <span dir="ltr">{selectedBroadcast.created_at_jalali}</span>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 text-center shrink-0">
                            <button onClick={() => setSelectedBroadcast(null)} className="px-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-100 transition shadow-sm">بستن</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}