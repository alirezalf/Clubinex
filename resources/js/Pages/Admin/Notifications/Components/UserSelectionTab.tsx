import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Check, Users, X, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import axios from 'axios';

interface UserItem {
    id: number;
    first_name: string;
    last_name: string;
    mobile: string;
    avatar?: string;
}

interface Props {
    // users prop removed as we fetch them asynchronously
    selectedIds: number[];
    onChange: (ids: number[]) => void;
}

export default function UserSelectionTab({ selectedIds, onChange }: Props) {
    const [search, setSearch] = useState('');
    const [results, setSearchResults] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<UserItem[]>([]);
    
    // Debounce timer
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Perform search
    useEffect(() => {
        if (search.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setLoading(true);
        timeoutRef.current = setTimeout(() => {
            axios.get(route('api.users.search'), { params: { q: search } })
                .then(response => {
                    setSearchResults(response.data);
                })
                .catch(error => {
                    console.error("Search error:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }, 500); // 500ms debounce

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [search]);

    const toggleUser = (user: UserItem) => {
        if (selectedIds.includes(user.id)) {
            // Remove
            onChange(selectedIds.filter(id => id !== user.id));
            setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
        } else {
            // Add
            onChange([...selectedIds, user.id]);
            // Keep track of user object to display in "Selected" list even if search changes
            if (!selectedUsers.find(u => u.id === user.id)) {
                setSelectedUsers(prev => [...prev, user]);
            }
        }
    };
    
    const removeSelected = (id: number) => {
        onChange(selectedIds.filter(i => i !== id));
        setSelectedUsers(prev => prev.filter(u => u.id !== id));
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 border border-gray-100 rounded-2xl p-4 bg-gray-50/30">
            {/* Header / Search Area */}
            <div className="flex flex-col gap-4">
                <div className="relative w-full">
                    <input 
                        type="text"
                        placeholder="جستجوی نام یا موبایل (حداقل ۲ حرف)..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full border-gray-200 bg-white rounded-xl px-3 py-3 pr-10 pl-10 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                    />
                    <div className="absolute right-3 top-3.5 text-gray-400">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    </div>
                    
                    {search && (
                        <button 
                            type="button"
                            onClick={() => setSearch('')}
                            className="absolute left-3 top-3 p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-primary-100 shadow-sm">
                        <Users size={14} />
                        {selectedIds.length} نفر انتخاب شده
                    </div>
                    {selectedIds.length > 0 && (
                        <button 
                            onClick={() => { onChange([]); setSelectedUsers([]); }}
                            className="text-xs text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition font-medium"
                        >
                            پاک کردن همه
                        </button>
                    )}
                </div>
            </div>

            {/* Results Grid */}
            {search.trim().length >= 2 && (
                <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-500">نتایج جستجو:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                        {results.length > 0 ? results.map(user => {
                            const isSelected = selectedIds.includes(user.id);
                            return (
                                <div 
                                    key={user.id}
                                    onClick={() => toggleUser(user)}
                                    className={clsx(
                                        "flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all select-none group relative",
                                        isSelected 
                                            ? "bg-primary-50 border-primary-500 ring-1 ring-primary-500/20" 
                                            : "bg-white border-gray-100 hover:border-gray-200 shadow-sm"
                                    )}
                                >
                                    <div className="relative shrink-0">
                                        <div className={clsx(
                                            "w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border transition-transform group-active:scale-90",
                                            isSelected ? "border-primary-200" : "border-gray-100 bg-gray-50"
                                        )}>
                                            {user.avatar ? (
                                                <img src={user.avatar} className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={18} className={isSelected ? "text-primary-500" : "text-gray-400"} />
                                            )}
                                        </div>
                                        {isSelected && (
                                            <div className="absolute -top-1 -right-1 bg-primary-500 text-white rounded-full p-0.5 shadow-sm border border-white">
                                                <Check size={8} strokeWidth={4} />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className={clsx(
                                            "text-[12px] font-bold truncate", 
                                            isSelected ? "text-primary-700" : "text-gray-700"
                                        )}>
                                            {user.first_name} {user.last_name}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{user.mobile}</div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="col-span-full py-8 text-center text-gray-400 text-sm">
                                موردی یافت نشد.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Selected Users List (Chips) */}
            {selectedUsers.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-gray-200">
                    <span className="text-xs font-bold text-gray-500">لیست گیرندگان:</span>
                    <div className="flex flex-wrap gap-2">
                        {selectedUsers.map(user => (
                            <div key={user.id} className="bg-white border border-gray-200 rounded-lg pl-1 pr-2 py-1 flex items-center gap-2 shadow-sm">
                                <span className="text-xs text-gray-700">{user.first_name} {user.last_name}</span>
                                <button 
                                    onClick={() => removeSelected(user.id)}
                                    className="text-gray-400 hover:text-red-500 p-0.5 hover:bg-red-50 rounded transition"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}