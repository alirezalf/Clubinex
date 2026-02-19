import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Smartphone, User, Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
    value: string;
    onChange: (val: string) => void;
    error?: string;
}

export default function UserLookupField({ value, onChange, error }: Props) {
    const [lookupResult, setLookupResult] = useState<{ found: boolean, name?: string, id?: number } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (value && value.length === 11 && value.startsWith('09')) {
                performLookup();
            } else {
                setLookupResult(null);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [value]);

    const performLookup = async () => {
        setLoading(true);
        try {
            const res = await axios.post(route('api.users.lookup'), { mobile: value });
            setLookupResult(res.data);
        } catch (err) {
            console.error("Lookup error", err);
            setLookupResult(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-top-2">
            <label className="block text-sm text-gray-600 mb-1.5">شماره موبایل کاربر</label>
            <div className="relative">
                <input
                    type="tel"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full border-gray-300 border rounded-xl focus:ring-primary-500 focus:border-primary-500 dir-ltr text-left px-4 py-3 pl-12 font-mono"
                    placeholder="09120000000"
                    maxLength={11}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {loading ? <Loader2 size={20} className="animate-spin text-primary-500" /> : <Smartphone size={20} />}
                </div>
            </div>
            
            {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}

            {/* Display User Details Result */}
            {lookupResult && (
                <div className={`mt-3 p-3 rounded-xl border flex items-center gap-3 animate-in zoom-in-95 duration-200 ${lookupResult.found ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                    <div className={`p-2 rounded-lg ${lookupResult.found ? 'bg-white text-green-600 shadow-sm' : 'bg-white text-red-600 shadow-sm'}`}>
                        {lookupResult.found ? <CheckCircle2 size={18} /> : <User size={18} />}
                    </div>
                    <div>
                        {lookupResult.found ? (
                            <div className="flex flex-col">
                                <span className="font-bold text-sm">{lookupResult.name}</span>
                                <span className="text-[10px] opacity-70">کاربر در سیستم یافت شد</span>
                            </div>
                        ) : (
                            <span className="text-xs font-medium">این شماره موبایل در سیستم ثبت نشده است.</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
