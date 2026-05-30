import { Head, useForm, Link } from '@inertiajs/react';
import React, { useRef, FormEvent, useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import type { PageProps, User } from '@/types';
import { http as axios } from '@/Utils/http';

// Partials
import UpgradeAlert from './Profile/Partials/UpgradeAlert';
import ProfileHeader from './Profile/Partials/ProfileHeader';
import ProfileInfoForm from './Profile/Partials/ProfileInfoForm';
import PasswordForm from './Profile/Partials/PasswordForm';

type Props = PageProps<{
    user: User & {
        club?: { name: string, color: string, id: number, next_club?: { id: number, name: string, min_points: number, benefits: string[] } };
        national_code?: string;
        job?: string;
        province_id?: number;
        city_id?: number;
        address?: string;
        postal_code?: string;
        birth_date?: string;
        gender?: string;
        current_points: number;
        is_agent?: boolean;
        agent_code?: string;
        store_name?: string;
        avatar?: string;
    };
    provinces: { id: number, name: string }[];
    initialCities: { id: number, name: string }[];
}>;

export default function Profile({ user, provinces, initialCities }: Props) {

    const formatDateForPicker = (date?: string) => {
        if (!date) return '';
        // تبدیل "2026-03-01T20:30:00.000000Z" به "2026-03-01 20:30:00"
        return date.replace('T', ' ').replace('.000000Z', '');
    };

    const { data, setData, post, processing, errors } = useForm({
        _method: 'POST',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        national_code: user.national_code || '',
        birth_date: formatDateForPicker(user.birth_date) || '',
        gender: user.gender || 'male',
        job: user.job || '',
        province_id: user.province_id || '',
        city_id: user.city_id || '',
        address: user.address || '',
        postal_code: user.postal_code || '',
        avatar: null as File | null,
        is_agent: user.is_agent || false,
        agent_code: user.agent_code || '',
        store_name: user.store_name || '',
    });

    const [cities, setCities] = useState(initialCities);
    const [loadingCities, setLoadingCities] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cascading effect for cities
    useEffect(() => {
        if (data.province_id && data.province_id != user.province_id) {
            setLoadingCities(true);
            axios.get(route('api.cities', data.province_id))
                .then(response => {
                    setCities(response.data);
                    setData('city_id', '');
                })
                .finally(() => setLoadingCities(false));
        } else if (!data.province_id) {
            setCities([]);
        }
    }, [data.province_id]);

    const submitInfo = (e: FormEvent) => {
        e.preventDefault();
        post(route('profile'), {
            forceFormData: true,
            onSuccess: () => {
                setData('avatar', null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('avatar', e.target.files[0]);
        }
    };

   const getMissingFields = () => {
    const fields = [
        { value: data.first_name, label: 'نام' },
        { value: data.last_name, label: 'نام خانوادگی' },
        { value: data.national_code, label: 'کد ملی' },
        { value: data.birth_date, label: 'تاریخ تولد' },
        { value: data.job, label: 'شغل' },
        { value: data.province_id, label: 'استان' },
        { value: data.city_id, label: 'شهر' },
        { value: data.address, label: 'آدرس' },
        { value: data.postal_code, label: 'کد پستی' }
    ];

    let missing = fields.filter(f => !f.value || f.value.toString().trim() === '').map(f => f.label);

    const hasAvatar = data.avatar !== null || (user.avatar && user.avatar.trim() !== '');
    if (!hasAvatar) missing.push('عکس پروفایل');

    return missing;
};

   const calculateProgress = () => {
    const missingCount = getMissingFields().length;
    const totalFields = 10; // 9 text fields + 1 avatar
    return Math.round(((totalFields - missingCount) / totalFields) * 100);
};

    return (
        <DashboardLayout breadcrumbs={[{ label: 'پروفایل کاربری' }]}>
            <Head title="پروفایل کاربری" />

            <div className="max-w-5xl mx-auto space-y-6">

                <UpgradeAlert user={user} />

                <ProfileHeader
                    user={user}
                    avatarData={data.avatar}
                    onFileChange={handleFileChange}
                    progress={calculateProgress()}
                    missingFields={getMissingFields()}
                />


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="lg:col-span-2 space-y-6">
                        <ProfileInfoForm
                            data={data}
                            setData={(field, value) => setData(field as any, value)}
                            submit={submitInfo}
                            processing={processing}
                            errors={errors}
                            provinces={provinces}
                            cities={cities}
                            loadingCities={loadingCities}
                            progress={calculateProgress()}
                        />
                    </div>

                    <div className="space-y-6">
                        <PasswordForm />

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">دستگاه‌های فعال</h3>
                            </div>
                            <p className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">
                                نشست‌ها و دستگاه‌هایی که هم‌اکنون به حساب شما متصل هستند را مشاهده و مدیریت کنید.
                            </p>
                            <Link href={route('profile.sessions')} className="w-full h-11 flex items-center justify-center rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition shadow-sm">
                                مدیریت دستگاه‌ها
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
