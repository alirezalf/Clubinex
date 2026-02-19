import React, { useState } from 'react';
import { Plus, ImageIcon } from 'lucide-react';
import SlideModal from './SlideModal';
import SlideListItem from './SlideListItem';
import { router } from '@inertiajs/react';

interface Props {
    slider: any;
}

export default function SlideManager({ slider }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState<any>(null);

    const openModal = (slide: any = null) => {
        setEditingSlide(slide);
        setModalOpen(true);
    };

    const deleteSlide = (id: number) => {
        if (confirm('آیا از حذف این اسلاید اطمینان دارید؟')) {
            router.delete(route('admin.sliders.slides.destroy', id), { preserveScroll: true });
        }
    };

    const duplicateSlide = (id: number) => {
        if (confirm('از کپی این اسلاید مطمئن هستید؟')) {
            router.post(route('admin.sliders.slides.duplicate', id), {}, { preserveScroll: true });
        }
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4 shrink-0">
                <h2 className="font-bold text-lg text-gray-800">مدیریت اسلایدها</h2>
                <button 
                    onClick={() => openModal()} 
                    className="bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-green-700 transition shadow-lg shadow-green-500/20 active:scale-95"
                >
                    <Plus size={18} /> اسلاید جدید
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin space-y-3 min-h-[300px]">
                {slider.slides && slider.slides.length > 0 ? (
                    slider.slides.map((slide: any) => (
                        <SlideListItem 
                            key={slide.id} 
                            slide={slide} 
                            onEdit={openModal} 
                            onDelete={deleteSlide} 
                            onDuplicate={duplicateSlide} 
                        />
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-16 text-gray-400 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                        <ImageIcon size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium text-gray-600">هنوز اسلایدی اضافه نشده است.</p>
                        <p className="text-xs mt-1">برای شروع دکمه "اسلاید جدید" را بزنید.</p>
                    </div>
                )}
            </div>

            {modalOpen && (
                <SlideModal 
                    sliderId={slider.id} 
                    slide={editingSlide} 
                    onClose={() => setModalOpen(false)} 
                />
            )}
        </div>
    );
}