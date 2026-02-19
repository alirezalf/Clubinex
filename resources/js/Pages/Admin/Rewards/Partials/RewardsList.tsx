import { useForm } from '@inertiajs/react';
import { Plus, X, Loader2, Edit2, Gift } from 'lucide-react';
import React, { useState } from 'react';
import Pagination from '@/Components/Pagination';
import { PaginatedData } from '@/types';

interface Reward {
    id: number;
    title: string;
    points_cost: number;
    type: string;
    stock: number;
    description: string;
    required_club_id: number | null;
    is_active: number | boolean;
    image: string | null;
    club: { name: string } | null;
}

interface Props {
    rewards: PaginatedData<Reward>;
    clubs: { id: number; name: string }[];
}

export default function RewardsList({ rewards, clubs }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [editingReward, setEditingReward] = useState<Reward | null>(null);

    // Form for Creating/Editing Reward
    const { data, setData, post, processing, reset, clearErrors } = useForm({
        title: '',
        points_cost: '',
        type: 'physical',
        stock: '',
        description: '',
        required_club_id: '',
        is_active: true,
        image: null as File | null,
    });

    const openCreateModal = () => {
        setEditingReward(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = (reward: Reward) => {
        setEditingReward(reward);
        setData({
            title: reward.title || '',
            points_cost: String(reward.points_cost),
            type: reward.type || 'physical',
            stock: String(reward.stock),
            description: reward.description || '',
            required_club_id: reward.required_club_id ? String(reward.required_club_id) : '',
            is_active: Boolean(reward.is_active),
            image: null,
        });
        clearErrors();
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingReward) {
            post(route('admin.rewards.update', editingReward.id), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        } else {
            post(route('admin.rewards.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    return (
        <>
            <div className="mb-4 flex justify-end">
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-white shadow-lg transition hover:bg-primary-700"
                >
                    <Plus size={20} />
                    جایزه جدید
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4">تصویر</th>
                                <th className="px-6 py-4">عنوان</th>
                                <th className="px-6 py-4">هزینه (امتیاز)</th>
                                <th className="px-6 py-4">موجودی</th>
                                <th className="px-6 py-4">نوع</th>
                                <th className="px-6 py-4">باشگاه</th>
                                <th className="px-6 py-4">وضعیت</th>
                                <th className="px-6 py-4">عملیات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rewards.data.map((reward) => (
                                <tr
                                    key={reward.id}
                                    className="transition hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                            {reward.image ? (
                                                <img
                                                    src={reward.image}
                                                    alt={reward.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Gift size={24} className="text-gray-300" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold">
                                        {reward.title}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-primary-600">
                                        {reward.points_cost.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`rounded px-2 py-1 text-xs ${reward.stock > 0 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}
                                        >
                                            {reward.stock} عدد
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {reward.type === 'physical'
                                            ? 'فیزیکی'
                                            : reward.type === 'digital'
                                              ? 'دیجیتال'
                                              : reward.type === 'charge'
                                                ? 'شارژ کیف پول'
                                                : 'کد تخفیف'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {reward.club ? (
                                            <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                                {reward.club.name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">
                                                همه
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`rounded px-2 py-1 text-xs ${reward.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                        >
                                            {reward.is_active
                                                ? 'فعال'
                                                : 'غیرفعال'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() =>
                                                openEditModal(reward)
                                            }
                                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                            title="ویرایش"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {rewards.data.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        هیچ جایزه‌ای تعریف نشده است.
                    </div>
                )}
            </div>
            <Pagination links={rewards.links} />

            {/* Create/Edit Reward Modal */}
            {showModal && (
                <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="animate-in zoom-in-95 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-6">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingReward
                                    ? 'ویرایش جایزه'
                                    : 'تعریف جایزه جدید'}
                            </h3>
                            <button onClick={() => setShowModal(false)}>
                                <X
                                    size={20}
                                    className="text-gray-400 hover:text-gray-600"
                                />
                            </button>
                        </div>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4 overflow-y-auto p-6"
                        >
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    عنوان جایزه
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    className="w-full rounded-lg border px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        هزینه (امتیاز)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.points_cost}
                                        onChange={(e) =>
                                            setData(
                                                'points_cost',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border px-3 py-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        موجودی
                                    </label>
                                    <input
                                        type="number"
                                        value={data.stock}
                                        onChange={(e) =>
                                            setData('stock', e.target.value)
                                        }
                                        className="w-full rounded-lg border px-3 py-2"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        نوع جایزه
                                    </label>
                                    <select
                                        value={data.type}
                                        onChange={(e) =>
                                            setData('type', e.target.value)
                                        }
                                        className="w-full rounded-lg border px-3 py-2"
                                    >
                                        <option value="physical">
                                            فیزیکی (کالا)
                                        </option>
                                        <option value="digital">
                                            دیجیتال (کد)
                                        </option>
                                        <option value="charge">
                                            شارژ کیف پول
                                        </option>
                                        <option value="discount_code">
                                            کد تخفیف
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        سطح باشگاه (اختیاری)
                                    </label>
                                    <select
                                        value={data.required_club_id}
                                        onChange={(e) =>
                                            setData(
                                                'required_club_id',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border px-3 py-2"
                                    >
                                        <option value="">همه کاربران</option>
                                        {clubs.map((c) => (
                                            <option key={c.id} value={String(c.id)}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    توضیحات
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    className="w-full rounded-lg border px-3 py-2"
                                    rows={2}
                                ></textarea>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    تصویر{' '}
                                    {editingReward &&
                                        '(فقط اگر قصد تغییر دارید)'}
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) =>
                                        setData(
                                            'image',
                                            e.target.files
                                                ? e.target.files[0]
                                                : null,
                                        )
                                    }
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                    accept="image/*"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) =>
                                        setData('is_active', e.target.checked)
                                    }
                                    className="h-4 w-4 cursor-pointer rounded text-primary-600 focus:ring-primary-500"
                                />
                                <label
                                    htmlFor="is_active"
                                    className="cursor-pointer text-sm select-none"
                                >
                                    جایزه فعال باشد
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="rounded-lg border px-4 py-2 text-gray-600 hover:bg-gray-50"
                                >
                                    انصراف
                                </button>
                                <button
                                    disabled={processing}
                                    className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2 text-white hover:bg-primary-700"
                                >
                                    {processing && (
                                        <Loader2
                                            className="animate-spin"
                                            size={16}
                                        />
                                    )}
                                    {editingReward ? 'بروزرسانی' : 'ذخیره'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}