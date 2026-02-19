import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { X, Save } from 'lucide-react';
import FormInput from '@/Components/Form/FormInput';
import FormSelect from '@/Components/Form/FormSelect';
import FormTextarea from '@/Components/Form/FormTextarea';
import FormFile from '@/Components/Form/FormFile';

export default function CreateProductModal({ isOpen, onClose, categories, product }: any) {
    if (!isOpen) return null;

    const isEditing = !!product;

    const { data, setData, post, processing, reset, errors, clearErrors, transform } = useForm({
        title: '',
        category_id: '',
        points_value: '',
        model_name: '',
        brand: '',
        description: '',
        is_active: true,
        image: null as File | null,
    });

    useEffect(() => {
        if (product) {
            setData({
                title: product.title || '',
                category_id: product.category_id || '',
                points_value: product.points_value || 0,
                model_name: product.model_name || '',
                brand: product.brand || '',
                description: product.description || '',
                is_active: Boolean(product.is_active),
                image: null
            });
        } else {
            reset();
        }
        clearErrors();
    }, [product, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditing) {
            transform((data) => ({ ...data, _method: 'PUT' }));
            post(route('admin.products.update', product.id), { forceFormData: true, onSuccess: () => { onClose(); reset(); } });
        } else {
            post(route('admin.products.store'), { onSuccess: () => { onClose(); reset(); } });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            {/* max-w reduced to 3xl and added overflow control */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                    <h3 className="font-bold text-base text-gray-800">{isEditing ? 'ویرایش محصول' : 'افزودن محصول جدید'}</h3>
                    <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-3">
                            <FormInput 
                                label="نام محصول" 
                                value={data.title} 
                                onChange={e => setData('title', e.target.value)} 
                                error={errors.title} 
                                required 
                                className="py-2 text-sm"
                            />
                            
                            <div className="grid grid-cols-2 gap-3">
                                <FormSelect
                                    label="دسته‌بندی"
                                    value={data.category_id}
                                    onChange={e => setData('category_id', e.target.value)}
                                    error={errors.category_id}
                                    className="py-2 text-sm"
                                >
                                    <option value="">انتخاب...</option>
                                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </FormSelect>
                                
                                <FormInput 
                                    label="امتیاز" 
                                    type="number" 
                                    value={data.points_value} 
                                    onChange={e => setData('points_value', e.target.value)} 
                                    error={errors.points_value} 
                                    required 
                                    className="py-2 text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <FormInput 
                                    label="نام مدل" 
                                    value={data.model_name} 
                                    onChange={e => setData('model_name', e.target.value)} 
                                    className="py-2 text-sm"
                                />
                                <FormInput 
                                    label="برند" 
                                    value={data.brand} 
                                    onChange={e => setData('brand', e.target.value)} 
                                    className="py-2 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <FormTextarea 
                                label="توضیحات" 
                                value={data.description} 
                                onChange={e => setData('description', e.target.value)} 
                                rows={3} 
                                className="h-24 resize-none text-sm"
                            />
                            
                            <div className="h-32">
                                <FormFile 
                                    label="تصویر محصول" 
                                    onChange={(file) => setData('image', file)} 
                                    error={errors.image}
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2 bg-gray-50 p-2 rounded-lg border border-gray-100 mt-8">
                                <input type="checkbox" id="is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer" />
                                <label htmlFor="is_active" className="text-xs text-gray-700 select-none font-bold cursor-pointer">محصول فعال و قابل مشاهده باشد</label>
                            </div>
                        </div>
                    </div>
                </form>
                
                <div className="flex justify-end gap-2 p-4 border-t border-gray-100 bg-gray-50 shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg border border-gray-200 transition font-medium text-sm">انصراف</button>
                    <button onClick={handleSubmit} disabled={processing} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-md flex items-center gap-2 transition font-bold text-sm">
                        <Save size={16} />
                        {isEditing ? 'ذخیره تغییرات' : 'ایجاد محصول'}
                    </button>
                </div>
            </div>
        </div>
    );
}