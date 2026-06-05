import React, { Suspense, lazy } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps } from '@/types';
import { Loader2 } from 'lucide-react';

const AdminDashboard = lazy(() => import('./Dashboard/AdminDashboard'));
const UserDashboard = lazy(() => import('./Dashboard/UserDashboard'));

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
        <DashboardLayout
            breadcrumbs={[{
                label: isAdmin ? 'داشبورد مدیریت' : 'داشبورد کاربری'
            }]}
        >
            <Head title={isAdmin ? 'پنل مدیریت' : 'داشبورد'} />

            {/* محتوای داشبورد با انیمیشن */}
            <div className="animate-in fade-in duration-500">
                <Suspense fallback={<div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
                    {isAdmin ? (
                        <AdminDashboard {...(props as any)} />
                    ) : (
                        <UserDashboard {...(props as any)} />
                    )}
                </Suspense>
            </div>
        </DashboardLayout>
    );
}
