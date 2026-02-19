import React from 'react';
import { Save, User as UserIcon, Store } from 'lucide-react';
import FormInput from '@/Components/Form/FormInput';
import FormSelect from '@/Components/Form/FormSelect';
import FormTextarea from '@/Components/Form/FormTextarea';
import PersianDatePicker from '@/Components/PersianDatePicker';

interface Props {
    data: any;
    setData: (field: string, value: any) => void;
    submit: (e: React.FormEvent) => void;
    processing: boolean;
    errors: any;
    provinces: { id: number, name: string }[];
    cities: { id: number, name: string }[];
    loadingCities: boolean;
}

export default function ProfileInfoForm({ data, setData, submit, processing, errors, provinces, cities, loadingCities }: Props) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <UserIcon size={20} className="text-primary-600" /> اطلاعات شخصی
                </h2>
            </div>

            <form onSubmit={submit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="نام" value={data.first_name} onChange={e => setData('first_name', e.target.value)} error={errors.first_name} />
                <FormInput label="نام خانوادگی" value={data.last_name} onChange={e => setData('last_name', e.target.value)} error={errors.last_name} />
                <FormInput label="کد ملی" value={data.national_code} onChange={e => setData('national_code', e.target.value)} error={errors.national_code} className="text-left dir-ltr" />
                
                <div>
                    <PersianDatePicker label="تاریخ تولد" value={data.birth_date} onChange={(date) => setData('birth_date', date)} error={errors.birth_date} placeholder="۱۴۰۰/۰۱/۰۱" />
                </div>
                
                <FormSelect label="جنسیت" value={data.gender} onChange={e => setData('gender', e.target.value)}>
                    <option value="male">آقا</option>
                    <option value="female">خانم</option>
                    <option value="other">سایر</option>
                </FormSelect>
                
                <FormInput label="ایمیل" type="email" value={data.email} onChange={e => setData('email', e.target.value)} error={errors.email} className="text-left dir-ltr" />
                <FormInput label="شغل" value={data.job} onChange={e => setData('job', e.target.value)} />
                <FormInput label="کد پستی" value={data.postal_code} onChange={e => setData('postal_code', e.target.value)} className="text-left dir-ltr" />
                
                {/* Location Fields Side by Side */}
                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormSelect label="استان" value={data.province_id} onChange={e => setData('province_id', e.target.value)}>
                        <option value="">انتخاب استان...</option>
                        {provinces.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </FormSelect>
                    
                    <FormSelect label="شهر" value={data.city_id} onChange={e => setData('city_id', e.target.value)} disabled={!data.province_id || loadingCities}>
                        <option value="">انتخاب شهر...</option>
                        {cities.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </FormSelect>
                </div>

                <div className="col-span-full">
                    <FormTextarea label="آدرس کامل" value={data.address} onChange={e => setData('address', e.target.value)} rows={2} />
                </div>

                {/* Agent Section */}
                <div className="col-span-full bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Store size={20} className="text-blue-600" />
                        <label className="font-bold text-blue-800 flex items-center gap-2 cursor-pointer select-none">
                            <input type="checkbox" checked={data.is_agent} onChange={e => setData('is_agent', e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                            من نماینده فروش هستم
                        </label>
                    </div>
                    {data.is_agent && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                            <FormInput label="کد نمایندگی" value={data.agent_code} onChange={e => setData('agent_code', e.target.value)} error={errors.agent_code} className="text-left dir-ltr" placeholder="AG-..." />
                            <FormInput label="نام فروشگاه" value={data.store_name} onChange={e => setData('store_name', e.target.value)} placeholder="فروشگاه موبایل ..." />
                        </div>
                    )}
                </div>

                <div className="col-span-full flex justify-end mt-2">
                    <button type="submit" disabled={processing} className="bg-primary-600 text-white px-6 py-2.5 rounded-xl hover:bg-primary-700 transition flex items-center gap-2 shadow-lg">
                        <Save size={18} /> ذخیره اطلاعات
                    </button>
                </div>
            </form>
        </div>
    );
}