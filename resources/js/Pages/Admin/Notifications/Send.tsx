import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Send, Users, Building, History, Database, Smartphone, Mail, ListChecks } from 'lucide-react';
import clsx from 'clsx';

// Sub Components
import UserSelectionTab from './Components/UserSelectionTab';
import BroadcastHistory from './Components/BroadcastHistory';
import { TargetTypeBtn, ChannelCheckbox } from './Components/FormElements';

export default function AdminSendNotification({ clubs, tab = 'send', history }: any) {
    const { data, setData, post, processing, errors, reset } = useForm({
        target_type: 'all', // all, club, manual
        club_id: '',
        selected_user_ids: [] as number[],
        channels: ['database'], // database, sms, email
        title: '',
        message: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.notifications.post'), {
            onSuccess: () => {
                reset();
                if(confirm('پیام ارسال شد. مایلید تاریخچه را مشاهده کنید؟')) {
                    switchTab('history');
                }
            }
        });
    };

    const switchTab = (newTab: string) => {
        router.get(route('admin.notifications.send'), { tab: newTab }, { preserveState: true });
    };

    const handleChannelChange = (channel: string) => {
        const current = [...data.channels];
        if (current.includes(channel)) {
            setData('channels', current.filter(c => c !== channel));
        } else {
            setData('channels', [...current, channel]);
        }
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'مدیریت اعلان‌ها' }]}>
            <Head title="ارسال پیام و تاریخچه" />

            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-6 w-fit no-print">
                <button 
                    onClick={() => switchTab('send')}
                    className={clsx(
                        "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
                        tab === 'send' ? "bg-primary-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"
                    )}
                >
                    <Send size={18} />
                    ارسال اعلان جدید
                </button>
                <button 
                    onClick={() => switchTab('history')}
                    className={clsx(
                        "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
                        tab === 'history' ? "bg-primary-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"
                    )}
                >
                    <History size={18} />
                    تاریخچه ارسال‌ها
                </button>
            </div>

            {tab === 'send' ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h1 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                            <Send size={20} className="text-primary-600" />
                            ارسال پیام و اعلان گروهی
                        </h1>
                        {data.target_type === 'manual' && (
                             <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                                 {data.selected_user_ids.length} کاربر انتخاب شده
                             </span>
                        )}
                    </div>

                    <form onSubmit={submit} className="p-6 space-y-6">
                        {/* Target Selection Type */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">گیرندگان پیام</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                <TargetTypeBtn 
                                    active={data.target_type === 'all'} 
                                    onClick={() => setData('target_type', 'all')} 
                                    icon={Users} label="همه کاربران" 
                                />
                                <TargetTypeBtn 
                                    active={data.target_type === 'club'} 
                                    onClick={() => setData('target_type', 'club')} 
                                    icon={Building} label="بر اساس باشگاه" 
                                />
                                <TargetTypeBtn 
                                    active={data.target_type === 'manual'} 
                                    onClick={() => setData('target_type', 'manual')} 
                                    icon={ListChecks} label="انتخاب دستی از لیست" 
                                />
                            </div>

                            <div className="mt-4">
                                {data.target_type === 'club' && (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <label className="block text-sm text-gray-600 mb-1">انتخاب باشگاه مقصد</label>
                                        <select
                                            value={data.club_id}
                                            onChange={e => setData('club_id', e.target.value)}
                                            className="w-full border-gray-300 border rounded-xl focus:ring-primary-500 focus:border-primary-500 px-3 py-2.5"
                                        >
                                            <option value="">یک باشگاه را انتخاب کنید...</option>
                                            {clubs.map((club: any) => (
                                                <option key={club.id} value={club.id}>{club.name}</option>
                                            ))}
                                        </select>
                                        {errors.club_id && <p className="text-red-500 text-xs mt-1">{errors.club_id}</p>}
                                    </div>
                                )}

                                {data.target_type === 'manual' && (
                                    <UserSelectionTab 
                                        selectedIds={data.selected_user_ids} 
                                        onChange={(ids: number[]) => setData('selected_user_ids', ids)} 
                                    />
                                )}
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Channels */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">کانال‌های ارسال</label>
                            <div className="flex flex-wrap gap-4">
                                <ChannelCheckbox 
                                    label="اعلان پنل" 
                                    icon={Database} 
                                    checked={data.channels.includes('database')} 
                                    onChange={() => handleChannelChange('database')} 
                                    color="blue"
                                />
                                <ChannelCheckbox 
                                    label="پیامک (SMS)" 
                                    icon={Smartphone} 
                                    checked={data.channels.includes('sms')} 
                                    onChange={() => handleChannelChange('sms')} 
                                    color="green"
                                />
                                <ChannelCheckbox 
                                    label="ایمیل" 
                                    icon={Mail} 
                                    checked={data.channels.includes('email')} 
                                    onChange={() => handleChannelChange('email')} 
                                    color="purple"
                                />
                            </div>
                            {errors.channels && <p className="text-red-500 text-xs mt-1">{errors.channels}</p>}
                        </div>

                        {/* Content */}
                        <div className="space-y-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">عنوان پیام</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="w-full border-gray-300 border rounded-xl focus:ring-primary-500 focus:border-primary-500 px-4 py-3 shadow-sm bg-white"
                                    placeholder="مثلا: هدیه ویژه اعضای طلایی"
                                    required
                                />
                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">متن کامل پیام</label>
                                <textarea
                                    rows={5}
                                    value={data.message}
                                    onChange={e => setData('message', e.target.value)}
                                    className="w-full border-gray-300 border rounded-xl focus:ring-primary-500 focus:border-primary-500 px-4 py-3 text-sm shadow-sm bg-white"
                                    placeholder="متن پیام خود را اینجا بنویسید..."
                                    required
                                ></textarea>
                                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-primary-600 text-white px-12 py-4 rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-500/30 font-bold flex items-center gap-2 transition transform active:scale-95 disabled:opacity-70"
                            >
                                {processing ? 'در حال ارسال...' : 'شروع عملیات ارسال'}
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <BroadcastHistory history={history} />
            )}
        </DashboardLayout>
    );
}