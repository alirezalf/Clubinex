import React from 'react';
import { Filter } from 'lucide-react';
import SearchInput from '@/Components/SearchInput';

interface Props {
    search: string;
    setSearch: (val: string) => void;
    onSearch: (val: string) => void;
    roleFilter: string;
    setRoleFilter: (val: string) => void;
    clubFilter: string;
    setClubFilter: (val: string) => void;
    onApply: () => void;
    roles: { id: number; name: string }[];
    clubs: { id: number; name: string }[];
}

export default function UserFilters({ 
    search, setSearch, onSearch, 
    roleFilter, setRoleFilter, 
    clubFilter, setClubFilter, 
    onApply, roles, clubs 
}: Props) {
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 md:flex-row items-end md:items-center shadow-sm">
            <div className="relative flex-1 w-full">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    onSearch={onSearch}
                    placeholder="جستجو (نام، موبایل، ایمیل)..."
                />
            </div>

            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 flex-1 md:flex-none bg-white min-w-[120px]"
                >
                    <option value="all">همه نقش‌ها</option>
                    {roles.map((role) => (
                        <option key={role.id} value={role.name}>
                            {role.name}
                        </option>
                    ))}
                </select>

                <select
                    value={clubFilter}
                    onChange={(e) => setClubFilter(e.target.value)}
                    className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 flex-1 md:flex-none bg-white min-w-[120px]"
                >
                    <option value="all">همه باشگاه‌ها</option>
                    {clubs.map((club) => (
                        <option key={club.id} value={club.id}>
                            {club.name}
                        </option>
                    ))}
                </select>

                <button
                    onClick={onApply}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-5 py-2.5 text-gray-700 transition hover:bg-gray-200 font-bold text-sm shrink-0"
                >
                    <Filter size={16} />
                    اعمال
                </button>
            </div>
        </div>
    );
}