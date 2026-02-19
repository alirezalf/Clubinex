import React from 'react';
import { Headphones, Clock, User as UserIcon, Info } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
}

interface TicketSettingsData {
    ticket_auto_close_hours: string | number;
    support_agents: number[];
}

interface Props {
    data: TicketSettingsData;
    setData: (key: string, value: any) => void;
    admins: User[];
}

export default function TicketSettings({ data, setData, admins }: Props) {
    
    const handleAgentToggle = (id: number) => {
        const currentAgents = Array.isArray(data.support_agents) ? data.support_agents : [];
        if (currentAgents.includes(id)) {
            setData('support_agents', currentAgents.filter((agentId: number) => agentId !== id));
        } else {
            setData('support_agents', [...currentAgents, id]);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                <Headphones size={20} className="text-primary-600" />
                تنظیمات پشتیبانی
            </h3>

            {/* Auto Close */}
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Clock size={16} className="text-orange-600" />
                    بستن خودکار تیکت‌ها
                </label>
                <div className="flex items-center gap-3">
                    <input 
                        type="number" 
                        value={data.ticket_auto_close_hours} 
                        onChange={e => setData('ticket_auto_close_hours', e.target.value)} 
                        className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-center" 
                        placeholder="0"
                    />
                    <span className="text-sm text-gray-600">ساعت پس از پاسخ ادمین (اگر کاربر پاسخ ندهد)</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    در صورت وارد کردن 0 یا خالی گذاشتن، تیکت‌ها به صورت خودکار بسته نمی‌شوند.
                </p>
            </div>

            {/* Support Agents */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">کارشناسان پاسخگو (توزیع تیکت)</label>
                
                {admins.length === 0 ? (
                    <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl text-center border border-dashed border-gray-200">
                        هیچ کاربر با نقش ادمین یا کارمند یافت نشد.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
                        {admins.map(admin => (
                            <label key={admin.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                (data.support_agents || []).includes(admin.id) 
                                    ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-500' 
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}>
                                <input 
                                    type="checkbox" 
                                    className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4" 
                                    checked={(data.support_agents || []).includes(admin.id)} 
                                    onChange={() => handleAgentToggle(admin.id)} 
                                />
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                                        {admin.avatar ? (
                                            <img src={admin.avatar} alt={admin.first_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon size={14} className="text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-xs text-gray-800 truncate">{admin.first_name} {admin.last_name}</span>
                                        <span className="text-[10px] text-gray-500 truncate max-w-[120px]">{admin.email}</span>
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                )}

                {/* Helpful Tip */}
                <div className="mt-4 bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start gap-3">
                    <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800 leading-relaxed">
                        <p className="mb-1">
                            این لیست فقط شامل کاربرانی است که دارای نقش <b>«مدیر»</b>، <b>«مدیر کل»</b> یا <b>«کارمند»</b> هستند.
                        </p>
                        برای افزودن شخص جدید به این لیست، به بخش 
                        <Link href={route('admin.users')} className="font-bold underline mx-1 hover:text-blue-600">
                            مدیریت کاربران
                        </Link>
                        بروید و نقش کاربر مورد نظر را تغییر دهید.
                    </div>
                </div>
            </div>
        </div>
    );
}