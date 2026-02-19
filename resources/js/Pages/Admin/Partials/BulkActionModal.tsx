import React from 'react';
import { useForm } from '@inertiajs/react';
import { X, CheckCircle, Shield, Award, MessageSquare, Loader2 } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    selectedIds: number[];
    actionType: 'change_status' | 'change_club' | 'send_message' | null;
    clubs: any[];
    statuses: any[];
    onSuccess: () => void;
}

export default function BulkActionModal({ isOpen, onClose, selectedIds, actionType, clubs, statuses, onSuccess }: Props) {
    if (!isOpen || !actionType) return null;

    const { data, setData, post, processing, reset, errors } = useForm({
        ids: selectedIds,
        action: actionType,
        status_id: '',
        club_id: '',
        message: ''
    });

    const titles = {
        'change_status': 'تغییر وضعیت گروهی',
        'change_club': 'تغییر سطح گروهی',
        'send_message': 'ارسال پیام گروهی'
    };

    const icons = {
        'change_status': <Shield className="text-blue-600" size={24} />,
        'change_club': <Award className="text-purple-600" size={24} />,
        'send_message': <MessageSquare className="text-green-600" size={24} />
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.bulk_action'), {
            onSuccess: () => {
                onSuccess();
                onClose();
                reset();
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                            {icons[actionType]}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">{titles[actionType]}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{selectedIds.length} کاربر انتخاب شده</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                
                <form onSubmit={submit} className="p-6 space-y-4">
                    
                    {actionType === 'change_status' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">انتخاب وضعیت جدید</label>
                            <select 
                                value={data.status_id} 
                                onChange={e => setData('status_id', e.target.value)} 
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500"
                                required
                            >
                                <option value="">انتخاب کنید...</option>
                                {statuses.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            {errors.status_id && <p className="text-red-500 text-xs mt-1">{errors.status_id}</p>}
                        </div>
                    )}

                    {actionType === 'change_club' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">انتخاب سطح جدید</label>
                            <select 
                                value={data.club_id} 
                                onChange={e => setData('club_id', e.target.value)} 
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500"
                                required
                            >
                                <option value="">انتخاب کنید...</option>
                                {clubs.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {errors.club_id && <p className="text-red-500 text-xs mt-1">{errors.club_id}</p>}
                            <p className="text-xs text-gray-500 mt-2 bg-blue-50 p-2 rounded text-blue-700">
                                توجه: تغییر سطح به صورت دستی امتیاز کاربر را کسر نمی‌کند.
                            </p>
                        </div>
                    )}

                    {actionType === 'send_message' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">متن پیام</label>
                            <textarea 
                                value={data.message} 
                                onChange={e => setData('message', e.target.value)} 
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 h-32 resize-none"
                                placeholder="متن پیام خود را بنویسید..."
                                required
                            ></textarea>
                            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                            <p className="text-xs text-gray-400 mt-1">این پیام به صورت اعلان داخلی برای کاربران ارسال می‌شود.</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-5 py-2.5 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium"
                        >
                            انصراف
                        </button>
                        <button 
                            type="submit" 
                            disabled={processing} 
                            className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition font-bold flex items-center gap-2"
                        >
                            {processing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                            انجام عملیات
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}