import axios from 'axios';
import { Package, User, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import FormInput from '@/Components/Form/FormInput';
import FormSelect from '@/Components/Form/FormSelect';
import FormFile from '@/Components/Form/FormFile';

interface Props {
    data: any;
    setData: (field: string, value: any) => void;
    errors: any;
    categories: { id: number; title: string }[];
    isAgent: boolean;
    agentInfo?: { store_name: string; mobile: string } | null;
    prefilledProduct?: {
        image: string;
        title: string;
        model_name: string;
    };
    editingRegistration?: {
        product_image_url: string;
        invoice_image_url: string;
    };
}

export default function AdvancedForm({
    data,
    setData,
    errors,
    categories,
    isAgent,
    agentInfo,
    prefilledProduct,
    editingRegistration,
}: Props) {
    // State for user lookups
    const [customerName, setCustomerName] = useState<string | null>(null);
    const [sellerName, setSellerName] = useState<string | null>(null);
    const [introducerName, setIntroducerName] = useState<string | null>(null);
    const [loadingLookup, setLoadingLookup] = useState<string | null>(null);

    // State for serial auto-generation toggle
    const [noSerial, setNoSerial] = useState(false);

    // Effect: Auto-fill seller info if agent
    useEffect(() => {
        if (isAgent && data.seller_user === 'owner' && agentInfo && !editingRegistration) {
            setData('seller_mobile_number', agentInfo.mobile);
        }
    }, [isAgent, data.seller_user, agentInfo, editingRegistration]);

    // Effect: Auto-fill serial based on model when model changes
    useEffect(() => {
        if (data.tool_model && !data.tool_serial && !noSerial && !editingRegistration) {
            setData('tool_serial', `${data.tool_model}-`);
        }
    }, [data.tool_model, data.tool_serial, noSerial, editingRegistration]);

    // Run lookup initially if editing
    useEffect(() => {
        if (editingRegistration) {
            if (data.customer_user === 'other' && data.customer_mobile_number) lookupUser(data.customer_mobile_number, 'customer');
            if (data.seller_user === 'other' && data.seller_mobile_number) lookupUser(data.seller_mobile_number, 'seller');
            if (data.introducer_user === 'other' && data.introducer_mobile_number) lookupUser(data.introducer_mobile_number, 'introducer');
        }
    }, []);

    const lookupUser = async (mobile: string, type: 'customer' | 'introducer' | 'seller') => {
        if (!mobile || mobile.length < 10) return;
        setLoadingLookup(type);
        try {
            const response = await axios.post(route('api.users.lookup'), { mobile });
            const name = response.data.found ? response.data.name : null;
            if (type === 'customer') setCustomerName(name);
            if (type === 'seller') setSellerName(name);
            if (type === 'introducer') setIntroducerName(name);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingLookup(null);
        }
    };

    const handleNoSerialChange = (checked: boolean) => {
        setNoSerial(checked);
        setData('tool_serial', checked ? '' : (data.tool_model ? `${data.tool_model}-` : ''));
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
            {/* Prefilled Product Alert */}
            {prefilledProduct && (
                <div className="flex items-center gap-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <div className="h-16 w-16 flex-shrink-0 rounded-lg border border-blue-100 bg-white p-1">
                        {prefilledProduct.image ? (
                            <img src={prefilledProduct.image} alt={prefilledProduct.title} className="h-full w-full rounded object-contain" />
                        ) : (
                            <Package className="h-full w-full text-blue-200" />
                        )}
                    </div>
                    <div>
                        <span className="mb-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-600">محصول انتخاب شده</span>
                        <h4 className="font-bold text-gray-800">{prefilledProduct.title}</h4>
                        <p className="mt-0.5 text-xs text-gray-500">{prefilledProduct.model_name}</p>
                    </div>
                </div>
            )}

            {/* Product Details */}
            <div>
                <h4 className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-2 font-bold text-gray-800">
                    <Package size={20} className="text-primary-600" /> مشخصات ابزار
                </h4>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormInput
                        label="نام ابزار *"
                        value={data.tool_name}
                        onChange={(e) => setData('tool_name', e.target.value)}
                        error={errors.tool_name}
                        readOnly={!!prefilledProduct}
                    />
                    <FormInput
                        label="مدل ابزار *"
                        value={data.tool_model}
                        onChange={(e) => setData('tool_model', e.target.value)}
                        error={errors.tool_model}
                        readOnly={!!prefilledProduct}
                    />
                    
                    <div>
                        <div className="mb-1 flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700">سریال ابزار <span className="text-red-500">*</span></label>
                            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-blue-600">
                                <input type="checkbox" checked={noSerial} onChange={(e) => handleNoSerialChange(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span>فاقد سریال (تولید خودکار)</span>
                            </label>
                        </div>
                        <FormInput
                            value={data.tool_serial}
                            onChange={(e) => setData('tool_serial', e.target.value)}
                            disabled={noSerial}
                            placeholder={noSerial ? 'تولید خودکار توسط سیستم' : 'شماره سریال روی بدنه'}
                            ltr
                            error={errors.tool_serial}
                        />
                         {noSerial && <p className="mt-1 text-[10px] text-gray-500">یک کد اختصاصی برای این فاکتور صادر می‌شود.</p>}
                    </div>

                    <FormSelect
                        label="دسته‌بندی *"
                        value={data.category_id}
                        onChange={(e) => setData('category_id', e.target.value)}
                        error={errors.category_id}
                        disabled={!!prefilledProduct}
                    >
                        <option value="">انتخاب کنید...</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </FormSelect>

                    <FormInput
                        label="برند سازنده"
                        value={data.tool_brand_name}
                        onChange={(e) => setData('tool_brand_name', e.target.value)}
                        readOnly={!!prefilledProduct}
                    />

                    <FormFile
                        label="تصویر ابزار (اختیاری)"
                        onChange={(file) => setData('tool_pic_file', file)}
                        error={errors.tool_pic_file}
                        currentFileName={data.tool_pic_file?.name}
                        previewUrl={editingRegistration?.product_image_url}
                    />
                </div>
            </div>

            {/* People Involved */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Customer */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <h5 className="mb-3 border-b border-gray-200 pb-2 text-sm font-bold text-gray-800">اطلاعات مشتری</h5>
                    <FormSelect
                        value={data.customer_user}
                        onChange={(e) => setData('customer_user', e.target.value)}
                        containerClass="mb-3"
                    >
                        <option value="owner">مشتری خودم هستم</option>
                        <option value="other">مشتری فرد دیگری است</option>
                    </FormSelect>
                    
                    {data.customer_user === 'other' && (
                        <div>
                            <FormInput
                                value={data.customer_mobile_number}
                                onChange={(e) => setData('customer_mobile_number', e.target.value)}
                                onBlur={() => lookupUser(data.customer_mobile_number, 'customer')}
                                placeholder="شماره موبایل مشتری"
                                ltr
                                suffix={loadingLookup === 'customer' ? <Loader2 size={16} className="animate-spin" /> : null}
                            />
                            {customerName && <div className="mt-2 flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs text-green-600"><User size={12} /> {customerName}</div>}
                        </div>
                    )}
                </div>

                {/* Seller */}
                <div className={`rounded-2xl border p-5 ${isAgent && data.seller_user === 'owner' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <h5 className="mb-3 border-b border-gray-200 pb-2 text-sm font-bold text-gray-800">اطلاعات فروشنده</h5>
                    <FormSelect
                        value={data.seller_user}
                        onChange={(e) => setData('seller_user', e.target.value)}
                        containerClass="mb-3"
                    >
                        <option value="none">انتخاب...</option>
                        {isAgent && <option value="owner">فروشنده خودم هستم (نماینده)</option>}
                        <option value="other">فروشنده فرد دیگری است</option>
                    </FormSelect>

                    {data.seller_user === 'other' && (
                        <div>
                            <FormInput
                                value={data.seller_mobile_number}
                                onChange={(e) => setData('seller_mobile_number', e.target.value)}
                                onBlur={() => lookupUser(data.seller_mobile_number, 'seller')}
                                placeholder="شماره موبایل فروشنده"
                                ltr
                                suffix={loadingLookup === 'seller' ? <Loader2 size={16} className="animate-spin" /> : null}
                            />
                            {sellerName && <div className="mt-2 flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs text-green-600"><User size={12} /> {sellerName} (عضو)</div>}
                        </div>
                    )}
                </div>

                {/* Introducer */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <h5 className="mb-3 border-b border-gray-200 pb-2 text-sm font-bold text-gray-800">اطلاعات معرف</h5>
                    <FormSelect
                        value={data.introducer_user}
                        onChange={(e) => setData('introducer_user', e.target.value)}
                        containerClass="mb-3"
                    >
                        <option value="none">انتخاب...</option>
                        <option value="owner">معرف خودم هستم</option>
                        <option value="other">معرف فرد دیگری است</option>
                    </FormSelect>
                    
                    {data.introducer_user === 'other' && (
                         <div>
                            <FormInput
                                value={data.introducer_mobile_number}
                                onChange={(e) => setData('introducer_mobile_number', e.target.value)}
                                onBlur={() => lookupUser(data.introducer_mobile_number, 'introducer')}
                                placeholder="شماره موبایل معرف"
                                ltr
                                suffix={loadingLookup === 'introducer' ? <Loader2 size={16} className="animate-spin" /> : null}
                            />
                            {introducerName && <div className="mt-2 flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs text-green-600"><User size={12} /> {introducerName} (عضو)</div>}
                         </div>
                    )}
                </div>
            </div>

            {/* Warranty & Invoice */}
            <div>
                <h4 className="mb-4 border-b border-gray-100 pb-2 font-bold text-gray-800">گارانتی و فاکتور</h4>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-3 block text-sm font-medium text-gray-700">وضعیت گارانتی</label>
                        <div className="space-y-3">
                            {[
                                { val: 'no_guarantee', label: 'ابزار بدون گارانتی (پیش‌فرض)' },
                                { val: 'reg_guarantee', label: 'درخواست شروع و فعال‌سازی گارانتی' },
                                { val: 'pre_guarantee', label: 'گارانتی ابزار از قبل فعال شده است' }
                            ].map(opt => (
                                <label key={opt.val} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${data.guarantee_status === opt.val ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input type="radio" checked={data.guarantee_status === opt.val} onChange={() => setData('guarantee_status', opt.val)} className="h-4 w-4 text-primary-600 focus:ring-primary-500" />
                                    <span className="text-sm font-medium">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                         <FormFile 
                            label="تصویر فاکتور خرید (الزامی) *"
                            onChange={(file) => setData('invoice_file', file)}
                            error={errors.invoice_file}
                            currentFileName={data.invoice_file?.name}
                            previewUrl={editingRegistration?.invoice_image_url}
                         />
                    </div>
                </div>
            </div>
        </div>
    );
}