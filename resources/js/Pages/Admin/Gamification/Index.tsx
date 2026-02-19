import { Head } from '@inertiajs/react';
import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps } from '@/types';
import WheelManager from './Partials/WheelManager';
import SurveyManager from './Partials/SurveyManager';

interface Prize {
    id: number;
    title: string;
    probability: number;
    is_active: number;
    stock?: number;
    value?: number;
    type?: string;
    color?: string;
}

interface Wheel {
    id: number;
    title: string;
    cost_per_spin: number;
    prizes: Prize[];
}

interface Survey {
    id: number;
    title: string;
    type: string;
    participants_count: number; 
    is_active: number;
    description: string;
    starts_at: string; 
    ends_at: string;
    duration_minutes: number;
    starts_at_jalali?: string;
    ends_at_jalali?: string;
    questions_count?: number;
    questions_sum_points?: number;
}

type Props = PageProps<{
    wheel: Wheel;
    surveys: Survey[];
}>;

export default function GamificationIndex({ wheel, surveys = [] }: Props) {
    return (
        <DashboardLayout breadcrumbs={[{ label: 'مدیریت بازی‌سازی' }]}>
            <Head title="بازی‌سازی" />

            {/* Inline Alerts Removed - Handled by ToastContainer */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Wheel Management */}
                <WheelManager wheel={wheel} />

                {/* Survey Management */}
                <SurveyManager surveys={surveys} />
                
            </div>
        </DashboardLayout>
    );
}