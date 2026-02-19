import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps } from '@/types';
import { CheckCircle, ArrowRight, Save } from 'lucide-react';
import SimpleForm from './Partials/SimpleForm';
import AdvancedForm from './Partials/AdvancedForm';

interface Category {
    id: number;
    title: string;
}

interface PrefilledProduct {
    id: number;
    title: string;
    model_name: string;
    brand: string;
    category_id: number;
    image: string;
}

interface EditingRegistration {
    id: number;
    tool_name: string;
    tool_model: string;
    tool_brand_name: string;
    tool_serial: string;
    category_id: number;
    customer_user: string;
    customer_mobile_number: string;
    seller_user: string;
    seller_mobile_number: string;
    introducer_user: string;
    introducer_mobile_number: string;
    guarantee_status: string;
    product_image_url: string;
    invoice_image_url: string;
}

type CustomPageProps = PageProps<{
    categories: Category[];
    prefilledProduct?: PrefilledProduct;
    agentInfo?: { store_name: string, mobile: string } | null;
    editingRegistration?: EditingRegistration; // Added for edit mode
}>;

export default function ProductCreate({ categories, prefilledProduct, agentInfo, editingRegistration, flash }: CustomPageProps) {
    const { auth } = usePage<PageProps>().props;
    
    // اگر محصولی از قبل انتخاب شده باشد یا در حال ویرایش باشیم، مستقیماً به تب پیشرفته می‌رویم
    const initialMode = (prefilledProduct || editingRegistration) ? 'advanced' : 'simple';
    const [regMode, setRegMode] = useState<'simple' | 'advanced'>(initialMode);

    // Determine if the current user is an agent based on profile or role
    const user = auth.user as any; 
    const isAgent = user.is_agent || (user.roles && user.roles.includes('agent'));

    const { data, setData, post, processing, errors } = useForm({
        tool_name: editingRegistration?.tool_name || prefilledProduct?.title || '',
        tool_model: editingRegistration?.tool_model || prefilledProduct?.model_name || '',
        tool_brand_name: editingRegistration?.tool_brand_name || prefilledProduct?.brand || '',
        tool_serial: editingRegistration?.tool_serial || '',
        category_id: editingRegistration?.category_id || prefilledProduct?.category_id || '',
        tool_pic_file: null as File | null,
        invoice_file: null as File | null,
        
        customer_user: editingRegistration?.customer_user || 'owner',
        customer_mobile_number: editingRegistration?.customer_mobile_number || '',
        
        // Auto-select "owner" for seller if the user is an agent
        seller_user: editingRegistration?.seller_user || (isAgent ? 'owner' : 'none'),
        // If agent, pre-fill with their mobile number
        seller_mobile_number: editingRegistration?.seller_mobile_number || (isAgent ? user.mobile : ''),
        
        introducer_user: editingRegistration?.introducer_user || 'none',
        introducer_mobile_number: editingRegistration?.introducer_mobile_number || '',
        
        guarantee_status: editingRegistration?.guarantee_status || 'no_guarantee', // Default: No Warranty
        
        // فیلد تک برای ثبت سریع سریال
        serial_code: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingRegistration) {
            post(route('products.registrations.update', editingRegistration.id), {
                forceFormData: true,
            });
        } else {
            post(route('products.register'), {
                forceFormData: true,
            });
        }
    };

    return (
        <DashboardLayout breadcrumbs={[
            { label: 'محصولات', href: route('products.index') },
            { label: editingRegistration ? 'ویرایش درخواست ثبت' : 'ثبت محصول جدید' }
        ]}>
            <Head title={editingRegistration ? 'ویرایش محصول' : 'ثبت محصول'} />

            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                    <Link href={route('products.index')} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
                        <ArrowRight size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {editingRegistration ? 'ویرایش درخواست ثبت محصول' : 'ثبت محصول جدید'}
                    </h1>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {!editingRegistration && (
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-center">
                            <div className="bg-white p-1 rounded-xl flex shadow-sm border border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setRegMode('simple')}
                                    className={`px-6 py-2 rounded-lg text-sm font-medium transition ${regMode === 'simple' ? 'bg-primary-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    ثبت سریع (سریال)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRegMode('advanced')}
                                    className={`px-6 py-2 rounded-lg text-sm font-medium transition ${regMode === 'advanced' ? 'bg-primary-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    ثبت کامل (فاکتور)
                                </button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        {/* Simple Mode */}
                        {regMode === 'simple' && (
                            <SimpleForm 
                                data={data} 
                                setData={setData} 
                                errors={errors} 
                            />
                        )}

                        {/* Advanced Mode */}
                        {regMode === 'advanced' && (
                            <AdvancedForm 
                                data={data} 
                                setData={setData} 
                                errors={errors} 
                                categories={categories} 
                                isAgent={isAgent}
                                agentInfo={agentInfo}
                                prefilledProduct={prefilledProduct}
                                editingRegistration={editingRegistration} // Pass edit data to component
                            />
                        )}

                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                            <Link
                                href={route('products.index')}
                                className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium transition"
                            >
                                انصراف
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-lg transition flex items-center gap-2"
                            >
                                {processing ? 'در حال ارسال...' : (editingRegistration ? 'بروزرسانی درخواست' : 'ثبت نهایی')}
                                {editingRegistration ? <Save size={18} /> : <CheckCircle size={18} />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}