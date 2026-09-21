import { Link } from '@inertiajs/react';
import { ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function LandingHero() {
    const slides = [
        {
            id: 1,
            title: "مشتریان خود را به هواداران وفادار تبدیل کنید",
            desc: "پلتفرم جامع باشگاه مشتریان Clubinex با امکانات گیمیفیکیشن و قرعه‌کشی.",
            bg: "bg-gradient-to-br from-indigo-900 via-primary-900 to-purple-900",
        },
        {
            id: 2,
            title: "افزایش فروش با گردونه شانس و جوایز",
            desc: "با ایجاد هیجان و رقابت، مشتریان را به خرید بیشتر و بازگشت مجدد تشویق کنید.",
            bg: "bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900",
        },
        {
            id: 3,
            title: "مدیریت هوشمند و گزارش‌های دقیق",
            desc: "رفتار مشتریان را تحلیل کنید و کمپین‌های تبلیغاتی هدفمند بسازید.",
            bg: "bg-gradient-to-br from-rose-900 via-pink-900 to-orange-900",
        }
    ];

    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000); 
        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <section className="relative overflow-hidden h-[600px] lg:h-[700px] text-white">
            {slides.map((slide, index) => (
                <div 
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center justify-center ${
                        index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    } ${slide.bg}`}
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
                        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 relative z-20 text-center">
                        <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold mb-6 border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            🎉 نسخه جدید Clubinex منتشر شد
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            {slide.title}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                            {slide.desc}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                            <Link href={route('login')} className="w-full sm:w-auto px-8 py-4 bg-white text-primary-900 rounded-2xl font-bold text-lg hover:bg-gray-100 shadow-xl transition flex items-center justify-center gap-2">
                                شروع رایگان
                                <ArrowLeft size={20} />
                            </Link>
                            <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-transparent text-white border border-white/30 rounded-2xl font-bold text-lg hover:bg-white/10 transition flex items-center justify-center">
                                مشاهده دمو
                            </a>
                        </div>
                    </div>
                </div>
            ))}

            {/* Controls */}
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition md:left-10">
                <ChevronRight size={24} />
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition md:right-10">
                <ChevronLeft size={24} />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                            index === current ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
                        }`}
                    />
                ))}
            </div>
        </section>
    );
}