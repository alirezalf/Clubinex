import React from 'react';
import { Loader2 } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Props {
    wheel: any;
    prizes: any[];
    rotation: number;
    spinning: boolean;
    userPoints: number;
    onSpin: () => void;
    defaultColors: string[];
}

export default function WheelSpinner({ wheel, prizes, rotation, spinning, userPoints, onSpin, defaultColors }: Props) {
    // دریافت نام سایت از پراپ‌های سراسری
    const { site } = usePage<PageProps & { site: { name: string } }>().props;
    
    const numSegments = prizes.length;
    const segmentAngle = 360 / numSegments;

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="flex flex-col items-center justify-center relative">
            {/* Wheel Visuals */}
            <div className="relative mb-8 transform scale-90 sm:scale-100">
                {/* 1. Base/Stand */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-24 bg-gray-800 rounded-b-3xl z-0 shadow-xl opacity-90" style={{ perspective: '500px' }}>
                    <div className="w-full h-full bg-gradient-to-b from-gray-700 to-gray-900 rounded-b-3xl border-t-8 border-gray-600"></div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-64 h-8 bg-black/20 blur-xl rounded-full"></div>
                </div>

                {/* 2. Outer Ring */}
                <div className="relative w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] rounded-full bg-[#2c3e50] p-4 shadow-2xl border-b-8 border-r-8 border-black/20 z-10">
                    
                    {/* Lights */}
                    <style>{`
                        .wheel-light {
                            position: absolute;
                            width: 12px;
                            height: 12px;
                            border-radius: 50%;
                            background: #FFD700;
                            box-shadow: 0 0 5px #FFD700;
                            margin-top: -6px;
                            margin-left: -6px;
                            z-index: 15;
                        }
                    `}</style>
                    {Array.from({ length: 24 }).map((_, i) => {
                        const angle = (i * 360) / 24;
                        const radius = 48; // % from center
                        return (
                            <div
                                key={i}
                                className="wheel-light animate-pulse"
                                style={{
                                    left: `${50 + radius * Math.cos(angle * Math.PI / 180)}%`,
                                    top: `${50 + radius * Math.sin(angle * Math.PI / 180)}%`,
                                    animationDelay: `${i * 0.1}s`
                                }}
                            ></div>
                        );
                    })}

                    {/* 3. Inner Ring */}
                    <div className="w-full h-full rounded-full bg-white p-2 shadow-inner">
                        {/* 4. The SVG Wheel */}
                        <div 
                            className="w-full h-full relative overflow-hidden rounded-full"
                            style={{
                                transform: `rotate(${rotation}deg)`,
                                transition: spinning ? 'transform 5s cubic-bezier(0.1, 0, 0.2, 1)' : 'none'
                            }}
                        >
                            <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }} className="w-full h-full">
                                {prizes.map((prize, index) => {
                                    const startPercent = index / numSegments;
                                    const endPercent = (index + 1) / numSegments;
                                    const [startX, startY] = getCoordinatesForPercent(startPercent);
                                    const [endX, endY] = getCoordinatesForPercent(endPercent);
                                    const largeArcFlag = segmentAngle > 180 ? 1 : 0;
                                    const pathData = [
                                        `M ${startX} ${startY}`,
                                        `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                                        `L 0 0`,
                                    ].join(' ');

                                    const color = prize.color || defaultColors[index % defaultColors.length];

                                    return (
                                        <g key={prize.id}>
                                            <path d={pathData} fill={color} stroke="white" strokeWidth="0.02" />
                                            <g transform={`rotate(${(index * segmentAngle) + (segmentAngle / 2)} 0 0) translate(0.6 0)`}>
                                                <g transform="rotate(90)">
                                                    <text 
                                                        x="0" y="0" fill="white" textAnchor="middle" dominantBaseline="middle" 
                                                        fontSize="0.12" fontWeight="bold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                                                    >
                                                        {prize.title.length > 12 ? prize.title.substring(0, 10) + '..' : prize.title}
                                                    </text>
                                                    {prize.type === 'points' && (
                                                        <text x="0" y="0.15" fill="white" textAnchor="middle" fontSize="0.08" fontWeight="normal">
                                                            {prize.value}
                                                        </text>
                                                    )}
                                                </g>
                                            </g>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                    </div>
                </div>

                {/* 5. Pointer */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-30 filter drop-shadow-lg">
                    <div className="w-14 h-16 bg-red-600 relative clip-arrow flex items-center justify-center border-t-2 border-red-400">
                        <div className="w-4 h-4 bg-white rounded-full mt-[-25px] shadow-inner border border-gray-300"></div>
                    </div>
                </div>
                <style>{`.clip-arrow { clip-path: polygon(50% 100%, 0 0, 100% 0); }`}</style>

                {/* 6. Center Button (Dynamic Name) */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                    <div className="w-20 h-20 bg-white rounded-full shadow-[0_0_15px_rgba(0,0,0,0.3)] border-4 border-gray-100 flex items-center justify-center p-1">
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black rounded-full flex flex-col items-center justify-center text-white border-2 border-gray-600 shadow-inner overflow-hidden px-1">
                            <span className="text-[10px] font-bold text-yellow-400">باشگاه</span>
                            <span className="text-[11px] font-black tracking-widest truncate w-full text-center">
                                {site?.name || 'مشتریان'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="w-full max-w-sm flex flex-col gap-3 z-10">
                <button
                    onClick={onSpin}
                    disabled={spinning || userPoints < wheel.cost_per_spin}
                    className={`group relative w-full py-4 rounded-2xl font-black text-lg overflow-hidden transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl 
                        ${spinning || userPoints < wheel.cost_per_spin
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-red-500/30'
                        }`}
                >
                    <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 -skew-x-12"></div>
                    <div className="relative flex items-center justify-center gap-2">
                        {spinning ? (
                            <>
                                <Loader2 className="animate-spin" />
                                در حال چرخش...
                            </>
                        ) : (
                            <>
                                <span className="drop-shadow-md text-xl">شروع چرخش</span>
                                {wheel.cost_per_spin > 0 && (
                                    <span className="bg-black/20 px-2 py-0.5 rounded text-sm font-normal backdrop-blur-sm">
                                        {wheel.cost_per_spin} امتیاز
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </button>
                {userPoints < wheel.cost_per_spin && (
                    <div className="text-center text-red-500 text-xs font-bold bg-red-50 p-2 rounded-lg">
                        موجودی کافی نیست!
                    </div>
                )}
            </div>
        </div>
    );
}