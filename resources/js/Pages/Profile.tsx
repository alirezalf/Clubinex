import { Head, useForm } from '@inertiajs/react';
import React, { useRef, FormEvent, useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import type { PageProps, User } from '@/types';
import axios from 'axios';

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
    const { data, setData, post, processing, errors } = useForm({
        _method: 'POST',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        national_code: user.national_code || '',
        birth_date: user.birth_date || '',
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

    const calculateProgress = () => {
        const textFields = [
            data.first_name, 
            data.last_name, 
            data.national_code, 
            data.birth_date, 
            data.job, 
            data.province_id, 
            data.city_id, 
            data.address, 
            data.postal_code
        ];
        
        let filledCount = textFields.filter(f => f && f.toString().trim() !== '').length;
        const hasAvatar = data.avatar !== null || (user.avatar && user.avatar.trim() !== '');
        if (hasAvatar) filledCount++;

        const totalFields = textFields.length + 1;
        return Math.round((filledCount / totalFields) * 100);
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
                />

                {/* Inline Alerts Removed: Handled by global ToastContainer in Layout */}

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
                        />
                    </div>

                    <div className="space-y-6">
                        <PasswordForm />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}