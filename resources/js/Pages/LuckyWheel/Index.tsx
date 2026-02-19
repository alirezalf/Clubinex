import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps } from '@/types';
import axios from 'axios';
import { Dna, Trophy, History, Frown, Box, Sparkles, XCircle, Info } from 'lucide-react';
import WheelSpinner from './Partials/WheelSpinner';

interface Prize {
    id: number;
    title: string;
    color: string;
    icon: string | null;
    type: string;
    value: number; 
}

interface Wheel {
    id: number;
    title: string;
    description: string;
    cost_per_spin: number;
    prizes: Prize[];
}

interface SpinHistoryItem {
    id: number;
    prize_title: string;
    prize_type: string;
    is_win: boolean;
    created_at_jalali: string;
    redemption_status?: string;
    redemption_status_farsi?: string;
}

interface Props extends PageProps {
    wheel: Wheel | null;
    userPoints: number; // This comes from controller initial load
    spinHistory: SpinHistoryItem[];
}

export default function LuckyWheelIndex({ wheel, userPoints: initialPoints, spinHistory }: Props) {
    const { auth } = usePage<PageProps>().props;
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<{title: string, message: string, prize_type: string} | null>(null);
    
    // Sync local point state with global auth state to ensure sidebar/header are in sync
    const [userPoints, setUserPoints] = useState(auth.user.points || initialPoints || 0);
    
    const [rotation, setRotation] = useState(0);
    const [history, setHistory] = useState<SpinHistoryItem[]>(spinHistory);

    useEffect(() => {
        setHistory(spinHistory);
    }, [spinHistory]);

    // Keep local points in sync with auth props if they change externally
    useEffect(() => {
        if (auth.user.points !== undefined) {
             setUserPoints(auth.user.points);
        }
    }, [auth.user.points]);

    const defaultColors = ['#FF5252', '#FFC107', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#00BCD4', '#E91E63'];

    if (!wheel || wheel.prizes.length === 0) {
        return (
            <DashboardLayout breadcrumbs={[{ label: 'گردونه شانس' }]}>
                <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                    <Dna size={48} className="mb-4 text-gray-300" />
                    <p>در حال حاضر گردونه شانسی فعال نیست.</p>
                </div>
            </DashboardLayout>
        );
    }

    const spinWheel = async () => {
        if (spinning || userPoints < wheel.cost_per_spin) return;

        setSpinning(true);
        setResult(null);
        
        // Optimistic update for UI immediate feedback
        const tempPoints = userPoints - wheel.cost_per_spin;
        setUserPoints(tempPoints);

        try {
            const response = await axios.post(route('lucky-wheel.spin'));
            const { prize_id, prize_title, message, prize_type } = response.data;

            const prizeIndex = wheel.prizes.findIndex(p => p.id === prize_id);
            const numSegments = wheel.prizes.length;
            const segmentAngle = 360 / numSegments;
            const prizeCenterAngle = (prizeIndex * segmentAngle) + (segmentAngle / 2);
            const currentRotationMod = rotation % 360;
            const rounds = 8 * 360;
            const targetRotation = rotation + rounds + (360 - prizeCenterAngle - currentRotationMod);
            
            setRotation(targetRotation);

            setTimeout(() => {
                setSpinning(false);
                setResult({ title: prize_title, message, prize_type });
                
                // Critical: Reload page props to update sidebar/header points and history
                // This ensures all components reflect the true server state
                router.reload({ 
                    only: ['auth', 'userPoints', 'spinHistory'],
                    onSuccess: (page) => {
                         // Update local state from fresh server data
                         const newPoints = (page.props as PageProps).auth.user.points;
                         setUserPoints(newPoints);
                    }
                });
            }, 5500); 

        } catch (error: any) {
            setSpinning(false);
            // Revert optimistic update on error
            router.reload({ only: ['auth'] });
            alert(error.response?.data?.message || 'خطا در ارتباط با سرور');
        }
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'گردونه شانس' }]}>
            <Head title="گردونه شانس" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Wheel Area */}
                <div className="lg:col-span-8 flex flex-col items-center justify-center relative">
                    <div className="text-center mb-6 z-10">
                        <h1 className="text-3xl font-black text-gray-800 mb-2 flex items-center justify-center gap-2 drop-shadow-sm">
                            <Sparkles className="text-yellow-500 fill-yellow-500" />
                            {wheel.title}
                        </h1>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">{wheel.description}</p>
                    </div>

                    <WheelSpinner 
                        wheel={wheel}
                        prizes={wheel.prizes}
                        rotation={rotation}
                        spinning={spinning}
                        userPoints={userPoints}
                        onSpin={spinWheel}
                        defaultColors={defaultColors}
                    />

                    <div className="mt-6 flex justify-center items-center bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm">
                        <span className="text-gray-500 font-medium text-sm ml-2">موجودی شما:</span>
                        <div className="flex items-center gap-1 font-bold text-xl text-primary-600">
                            {userPoints.toLocaleString()} 
                            <Dna size={16} className="text-primary-400" />
                        </div>
                    </div>
                </div>

                {/* Sidebar: History & Guide */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Guide */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-6 border border-indigo-100">
                        <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                            <div className="bg-white p-1.5 rounded-lg shadow-sm"><Info size={18} className="text-indigo-600"/></div>
                            راهنما
                        </h4>
                        <ul className="space-y-3">
                            {[
                                `هزینه هر چرخش ${wheel.cost_per_spin} امتیاز است.`,
                                'جوایز امتیازی بلافاصله اضافه می‌شوند.',
                                'جوایز فیزیکی در بخش سوابق ثبت می‌شوند.',
                                'گزینه پوچ یعنی عدم برنده شدن.',
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3 text-sm text-indigo-800 items-start">
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0"></div>
                                    <span className="leading-snug opacity-90">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* History */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-[450px]">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <History size={20} className="text-gray-400" />
                            آخرین شانس‌ها
                        </h3>
                        
                        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                            {history.length > 0 ? (
                                <div className="space-y-3">
                                    {history.map((spin) => (
                                        <div key={spin.id} className="bg-gray-50/50 rounded-2xl p-3 border border-gray-100 hover:bg-gray-50 transition relative overflow-hidden group">
                                            {spin.is_win && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-400 rounded-l-full"></div>}
                                            
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`font-bold text-sm ${spin.is_win ? 'text-gray-800' : 'text-gray-400'}`}>
                                                    {spin.prize_title}
                                                </span>
                                                {spin.is_win ? (
                                                    <Trophy size={14} className="text-yellow-500 fill-yellow-500" />
                                                ) : (
                                                    <Frown size={14} className="text-gray-300" />
                                                )}
                                            </div>
                                            
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] text-gray-400">{spin.created_at_jalali}</span>
                                                
                                                {spin.prize_type === 'item' && spin.redemption_status && (
                                                    <span className="text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 bg-gray-100 text-gray-600">
                                                        {spin.redemption_status_farsi}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                                    <Box size={40} className="mb-2" />
                                    <p className="text-sm">تاریخچه‌ای موجود نیست</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Result Modal */}
            {result && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full text-center transform scale-100 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-100 via-transparent to-transparent"></div>
                        {result.prize_type !== 'empty' && (
                            <>
                                <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                            </>
                        )}

                        <div className="relative z-10">
                            <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-white 
                                ${result.prize_type === 'empty' ? 'bg-gray-100 text-gray-400' : 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'}`}
                            >
                                {result.prize_type === 'empty' ? <Frown size={56} /> : <Trophy size={56} className="animate-bounce" />}
                            </div>
                            
                            <h3 className="text-2xl font-black text-gray-800 mb-2">{result.title}</h3>
                            <p className="text-gray-600 mb-8 text-sm leading-relaxed">{result.message}</p>
                            
                            <button 
                                onClick={() => setResult(null)}
                                className="w-full bg-gray-900 text-white py-4 rounded-xl hover:bg-gray-800 font-bold transition shadow-lg flex items-center justify-center gap-2"
                            >
                                <XCircle size={18} />
                                بستن
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}