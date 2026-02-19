import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps } from '@/types';
import { Plus, MonitorPlay, Layers } from 'lucide-react';
import SliderCard from './Partials/SliderCard';
import ConfirmModal from '@/Components/ConfirmModal';

interface Slider {
    id: number;
    title: string;
    location_key: string;
    height_class: string;
    slides_count: number;
    is_active: boolean;
}

type Props = PageProps<{
    sliders: Slider[];
}>;

export default function SlidersIndex({ sliders }: Props) {
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        id: 0
    });

    const handleDelete = (id: number) => {
        setConfirmModal({ isOpen: true, id });
    };

    const confirmDelete = () => {
        router.delete(route('admin.sliders.destroy', confirmModal.id), {
            onFinish: () => setConfirmModal({ isOpen: false, id: 0 })
        });
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'مدیریت اسلایدرها' }]}>
            <Head title="مدیریت اسلایدرها" />

            {/* Inline Flash Alert Removed */}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <MonitorPlay className="text-primary-600" />
                    مدیریت اسلایدرها
                </h1>
                <Link 
                    href={route('admin.sliders.create')}
                    className="bg-primary-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition font-bold text-sm"
                >
                    <Plus size={20} />
                    اسلایدر جدید
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                {sliders.map((slider) => (
                    <SliderCard 
                        key={slider.id} 
                        slider={slider} 
                        onDelete={handleDelete} 
                    />
                ))}

                {sliders.length === 0 && (
                    <div className="col-span-full py-16 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
                        <Layers size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>هنوز اسلایدری تعریف نشده است.</p>
                        <Link href={route('admin.sliders.create')} className="text-primary-600 font-bold mt-2 inline-block hover:underline">
                            ایجاد اولین اسلایدر
                        </Link>
                    </div>
                )}
            </div>

            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: 0 })}
                onConfirm={confirmDelete}
                title="حذف اسلایدر"
                message="آیا از حذف این اسلایدر اطمینان دارید؟ تمام اسلایدهای داخل آن نیز حذف خواهند شد و این عملیات غیرقابل بازگشت است."
            />
        </DashboardLayout>
    );
}