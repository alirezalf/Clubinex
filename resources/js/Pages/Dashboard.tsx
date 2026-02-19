import React from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps } from '@/types';
import AdminDashboard from './Dashboard/AdminDashboard';
import UserDashboard from './Dashboard/UserDashboard';

type DashboardProps = PageProps<{
    isAdmin: boolean;
    quickAccess: { pinned: string[], frequent: string[] };
    // Admin specific
    stats?: any;
    recentActivities?: any[];
    latestUsers?: any[];
    chartData?: any;
    // User specific
    userStats?: any; 
    recentTransactions?: any[];
}>;

export default function Dashboard(props: DashboardProps) {
    const { isAdmin } = props;

    return (
        <DashboardLayout breadcrumbs={[{ label: isAdmin ? 'داشبورد مدیریت' : 'داشبورد کاربری' }]}>
            <Head title={isAdmin ? 'پنل مدیریت' : 'داشبورد'} />
            {isAdmin ? <AdminDashboard {...props} /> : <UserDashboard {...props} />}
        </DashboardLayout>
    );
}