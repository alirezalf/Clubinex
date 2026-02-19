import React from 'react';
import { 
    PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { PieChart as PieIcon, MapPin, CheckCircle2 } from 'lucide-react';

interface Props {
    demographics: any;
    total: number;
    type: string;
}

export default function SurveyCharts({ demographics, total, type }: Props) {
    // Defensive check: if demographics is undefined, return early or handle it
    if (!demographics) {
        return <div className="text-center text-gray-400 p-8">داده‌های آماری در دسترس نیست.</div>;
    }

    const genderData = demographics.gender || {};
    const locationData = demographics.location || {};
    const scoresData = demographics.scores || {};

    const chartDataGender = [
        { name: 'آقا', value: genderData['male'] || 0, color: '#3b82f6' },
        { name: 'خانم', value: genderData['female'] || 0, color: '#ec4899' },
        { name: 'سایر/نامشخص', value: (genderData['other'] || 0) + (genderData['unknown'] || 0), color: '#9ca3af' },
    ].filter(item => item.value > 0);

    const chartDataLocation = Object.entries(locationData)
        .map(([name, value]) => ({ name, value }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 8); // Top 8 provinces

    const chartDataScores = [
        { name: 'قبول شده', value: scoresData.passed || 0, color: '#10b981' },
        { name: 'مردود', value: scoresData.failed || 0, color: '#ef4444' },
    ].filter(item => item.value > 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
            
            {/* Gender Distribution */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 self-start w-full border-b pb-2">
                    <PieIcon size={20} className="text-primary-600" />
                    تفکیک جنسیت
                </h3>
                
                {chartDataGender.length > 0 ? (
                    <div className="w-full h-64" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartDataGender}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartDataGender.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <ReTooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">داده‌ای برای نمایش وجود ندارد</div>
                )}
            </div>

            {/* Location Distribution */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
                    <MapPin size={20} className="text-orange-500" />
                    پراکندگی استانی
                </h3>

                {chartDataLocation.length > 0 ? (
                    <div className="w-full h-64 text-xs" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartDataLocation} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                                <ReTooltip cursor={{fill: '#f3f4f6'}} />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} name="تعداد" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">داده‌ای برای نمایش وجود ندارد</div>
                )}
            </div>

            {/* Pass/Fail (Quiz Only) */}
            {type === 'quiz' && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:col-span-2">
                    <div className="flex justify-between items-center border-b pb-2 mb-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <CheckCircle2 size={20} className="text-green-600" />
                            وضعیت قبولی
                        </h3>
                        <span className="text-sm bg-blue-50 text-blue-800 px-3 py-1 rounded-full font-bold">
                            میانگین نمرات: {scoresData.avg_score}
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-around gap-8">
                        <div className="w-full md:w-1/2 h-64" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartDataScores}
                                        cx="50%"
                                        cy="50%"
                                        startAngle={180}
                                        endAngle={0}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartDataScores.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <ReTooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-1/2 space-y-4">
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex justify-between items-center">
                                <span className="text-green-800 font-bold">تعداد قبول‌شدگان</span>
                                <span className="text-2xl font-black text-green-600">{scoresData.passed}</span>
                            </div>
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex justify-between items-center">
                                <span className="text-red-800 font-bold">تعداد مردودین</span>
                                <span className="text-2xl font-black text-red-600">{scoresData.failed}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}