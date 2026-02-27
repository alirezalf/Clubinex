import React, { useState } from 'react';
import {
    Save,
    User,
    Mail,
    Calendar,
    MapPin,
    Home,
    Briefcase,
    CreditCard,
    Phone,
    Store,
    Award,
    CheckCircle,
    AlertCircle,
    Info,
} from 'lucide-react';
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
    provinces: { id: number; name: string }[];
    cities: { id: number; name: string }[];
    loadingCities: boolean;
}

export default function ProfileInfoForm({
    data,
    setData,
    submit,
    processing,
    errors,
    provinces,
    cities,
    loadingCities,
}: Props) {
    const [activeTab, setActiveTab] = useState('personal'); // personal, location, agent

    // محاسبه درصد تکمیل اطلاعات شخصی
    // محاسبه درصد تکمیل اطلاعات شخصی
    const calculatePersonalCompletion = () => {
        const fields = [
            data.first_name,
            data.last_name,
            data.national_code,
            data.birth_date,
            data.job,
            data.province_id,
            data.city_id,
            data.address,
            data.postal_code,
        ];

        let filledCount = fields.filter(
            (f) => f && f.toString().trim() !== '',
        ).length;

        // آواتار رو هم حساب کن (اگه فایلی انتخاب شده یا قبلاً آواتار داشته)
        const hasAvatar = data.avatar !== null;
        if (hasAvatar) filledCount++;

        const totalFields = fields.length + 1; // +1 برای آواتار

        return Math.round((filledCount / totalFields) * 100);
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
            {/* هدر با گرادینت */}
            <div className="relative border-b border-gray-100 bg-gradient-to-l from-amber-50 to-transparent p-6">
                <div className="absolute top-0 left-0 h-40 w-40 -translate-x-20 -translate-y-20 rounded-full bg-amber-500/5" />
                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-amber-500 p-3 shadow-lg shadow-amber-500/20">
                            <User size={22} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">
                                اطلاعات شخصی
                            </h2>
                            <p className="text-sm text-gray-500">
                                اطلاعات خود را به‌روز نگه دارید
                            </p>
                        </div>
                    </div>

                    {/* نشان درصد تکمیل */}
                    <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                        <span className="text-sm text-gray-600">
                            تکمیل شده:
                        </span>
                        <span className="font-bold text-amber-600">
                            {calculatePersonalCompletion()}%
                        </span>
                    </div>
                </div>
            </div>

            {/* تب‌های ناوبری */}
            <div className="flex border-b border-gray-100 bg-gray-50/50 px-6">
                <button
                    onClick={() => setActiveTab('personal')}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all ${
                        activeTab === 'personal'
                            ? 'border-amber-500 text-amber-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <User size={16} />
                    اطلاعات فردی
                </button>
                <button
                    onClick={() => setActiveTab('location')}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all ${
                        activeTab === 'location'
                            ? 'border-amber-500 text-amber-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <MapPin size={16} />
                    آدرس و موقعیت
                </button>
                <button
                    onClick={() => setActiveTab('agent')}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all ${
                        activeTab === 'agent'
                            ? 'border-amber-500 text-amber-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Store size={16} />
                    نمایندگی
                </button>
            </div>

            <form onSubmit={submit} className="p-6">
                {/* تب اطلاعات فردی */}
                {activeTab === 'personal' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-5 duration-500">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <User size={16} className="text-gray-400" />
                                    نام
                                </label>
                                <FormInput
                                    value={data.first_name}
                                    onChange={(e) =>
                                        setData('first_name', e.target.value)
                                    }
                                    error={errors.first_name}
                                    placeholder="مثال: علی"
                                    className="bg-gray-50/50 transition-colors focus:bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <User size={16} className="text-gray-400" />
                                    نام خانوادگی
                                </label>
                                <FormInput
                                    value={data.last_name}
                                    onChange={(e) =>
                                        setData('last_name', e.target.value)
                                    }
                                    error={errors.last_name}
                                    placeholder="مثال: محمدی"
                                    className="bg-gray-50/50 transition-colors focus:bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <CreditCard
                                        size={16}
                                        className="text-gray-400"
                                    />
                                    کد ملی
                                </label>
                                <FormInput
                                    value={data.national_code}
                                    onChange={(e) =>
                                        setData('national_code', e.target.value)
                                    }
                                    error={errors.national_code}
                                    className="dir-ltr bg-gray-50/50 text-left transition-colors focus:bg-white"
                                    placeholder="۱۰ رقم بدون خط تیره"
                                    maxLength={10}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <Calendar
                                        size={16}
                                        className="text-gray-400"
                                    />
                                    تاریخ تولد
                                </label>
                                <PersianDatePicker
                                    value={data.birth_date}
                                    onChange={(date) =>
                                        setData('birth_date', date)
                                    }
                                    error={errors.birth_date}
                                    placeholder="۱۴۰۰/۰۱/۰۱"
                                    className="bg-gray-50/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <User size={16} className="text-gray-400" />
                                    جنسیت
                                </label>
                                <FormSelect
                                    value={data.gender}
                                    onChange={(e) =>
                                        setData('gender', e.target.value)
                                    }
                                    className="bg-gray-50/50"
                                >
                                    <option value="male">آقا</option>
                                    <option value="female">خانم</option>
                                    <option value="other">سایر</option>
                                </FormSelect>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <Mail size={16} className="text-gray-400" />
                                    ایمیل
                                </label>
                                <FormInput
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    error={errors.email}
                                    className="dir-ltr bg-gray-50/50 text-left transition-colors focus:bg-white"
                                    placeholder="example@domain.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <Briefcase
                                        size={16}
                                        className="text-gray-400"
                                    />
                                    شغل
                                </label>
                                <FormInput
                                    value={data.job}
                                    onChange={(e) =>
                                        setData('job', e.target.value)
                                    }
                                    placeholder="مثال: مهندس نرم‌افزار"
                                    className="bg-gray-50/50 transition-colors focus:bg-white"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* تب آدرس و موقعیت */}
                {activeTab === 'location' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-5 duration-500">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <MapPin
                                        size={16}
                                        className="text-gray-400"
                                    />
                                    استان
                                </label>
                                <FormSelect
                                    value={data.province_id}
                                    onChange={(e) =>
                                        setData('province_id', e.target.value)
                                    }
                                    className="bg-gray-50/50"
                                >
                                    <option value="">انتخاب استان...</option>
                                    {provinces.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </FormSelect>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <MapPin
                                        size={16}
                                        className="text-gray-400"
                                    />
                                    شهر
                                </label>
                                <FormSelect
                                    value={data.city_id}
                                    onChange={(e) =>
                                        setData('city_id', e.target.value)
                                    }
                                    disabled={
                                        !data.province_id || loadingCities
                                    }
                                    className="bg-gray-50/50"
                                >
                                    <option value="">
                                        {loadingCities
                                            ? 'در حال بارگذاری...'
                                            : 'انتخاب شهر...'}
                                    </option>
                                    {cities.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </FormSelect>
                                {loadingCities && (
                                    <div className="mt-1 flex items-center gap-2 text-xs text-amber-600">
                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                                        در حال دریافت شهرها...
                                    </div>
                                )}
                            </div>

                            <div className="col-span-full space-y-2">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <Home size={16} className="text-gray-400" />
                                    آدرس کامل
                                </label>
                                <FormTextarea
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
                                    rows={3}
                                    placeholder="استان، شهر، خیابان، پلاک، واحد"
                                    className="bg-gray-50/50 transition-colors focus:bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <CreditCard
                                        size={16}
                                        className="text-gray-400"
                                    />
                                    کد پستی
                                </label>
                                <FormInput
                                    value={data.postal_code}
                                    onChange={(e) =>
                                        setData('postal_code', e.target.value)
                                    }
                                    className="dir-ltr bg-gray-50/50 text-left transition-colors focus:bg-white"
                                    placeholder="۱۰ رقم"
                                    maxLength={10}
                                />
                            </div>
                        </div>

                        {/* نکته */}
                        <div className="mt-4 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                            <Info
                                size={16}
                                className="mt-0.5 flex-shrink-0 text-blue-500"
                            />
                            <p className="text-xs text-blue-700">
                                وارد کردن آدرس دقیق به ارسال سریع‌تر جوایز کمک
                                می‌کند
                            </p>
                        </div>
                    </div>
                )}

                {/* تب نمایندگی */}
                {activeTab === 'agent' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-5 duration-500">
                        <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50/50 p-5">
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-amber-500 p-2 shadow-lg shadow-amber-500/20">
                                    <Store size={20} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <label className="flex cursor-pointer items-center gap-2 select-none">
                                        <input
                                            type="checkbox"
                                            checked={data.is_agent}
                                            onChange={(e) =>
                                                setData(
                                                    'is_agent',
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-5 w-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                                        />
                                        <span className="font-bold text-gray-800">
                                            من نماینده فروش هستم
                                        </span>
                                    </label>
                                    <p className="mt-1 pr-7 text-sm text-gray-600">
                                        با فعال‌سازی این گزینه، می‌توانید به
                                        عنوان نماینده فروش فعالیت کنید
                                    </p>
                                </div>
                            </div>
                        </div>

                        {data.is_agent && (
                            <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                        <Award
                                            size={16}
                                            className="text-gray-400"
                                        />
                                        کد نمایندگی
                                    </label>
                                    <FormInput
                                        value={data.agent_code}
                                        onChange={(e) =>
                                            setData(
                                                'agent_code',
                                                e.target.value,
                                            )
                                        }
                                        error={errors.agent_code}
                                        className="dir-ltr bg-gray-50/50 text-left transition-colors focus:bg-white"
                                        placeholder="AG-12345"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                        <Store
                                            size={16}
                                            className="text-gray-400"
                                        />
                                        نام فروشگاه
                                    </label>
                                    <FormInput
                                        value={data.store_name}
                                        onChange={(e) =>
                                            setData(
                                                'store_name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="فروشگاه موبایل ..."
                                        className="bg-gray-50/50 transition-colors focus:bg-white"
                                    />
                                </div>

                                {/* مزایای نمایندگی */}
                                <div className="col-span-full mt-2 rounded-xl border border-green-100 bg-green-50 p-4">
                                    <h4 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-green-800">
                                        <CheckCircle
                                            size={16}
                                            className="text-green-600"
                                        />
                                        مزایای نمایندگی:
                                    </h4>
                                    <ul className="grid grid-cols-1 gap-2 text-sm text-green-700 md:grid-cols-2">
                                        <li className="flex items-center gap-2">
                                            <div className="h-1 w-1 rounded-full bg-green-500" />
                                            تخفیف ویژه روی محصولات
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="h-1 w-1 rounded-full bg-green-500" />
                                            پشتیبانی اختصاصی
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="h-1 w-1 rounded-full bg-green-500" />
                                            دریافت کمیسیون از فروش
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="h-1 w-1 rounded-full bg-green-500" />
                                            شرکت در دوره‌های آموزشی
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* دکمه ثبت - در همه تب‌ها نمایش داده می‌شود */}
                <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
                    <button
                        type="submit"
                        disabled={processing}
                        className="group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3 text-white shadow-lg shadow-amber-500/25 transition-all duration-200 hover:from-amber-600 hover:to-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {processing ? (
                            <>
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                <span>در حال ذخیره...</span>
                            </>
                        ) : (
                            <>
                                <Save
                                    size={18}
                                    className="transition-transform group-hover:scale-110"
                                />
                                <span>ذخیره اطلاعات</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
