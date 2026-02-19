import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { SliderSettings } from './types';
import SlideItem from './SlideItem';

interface Props {
    slider: SliderSettings | null;
    className?: string;
}

export default function Slider({ slider, className = '' }: Props) {
    const slides = slider?.active_slides || [];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const timeoutRef = useRef<any>(null);

    // Default Settings
    const slidesPerView = slider?.slides_per_view ? parseInt(slider.slides_per_view.toString()) : 1;
    const totalSlides = slides.length;
    const gap = slider?.gap || 0;
    const isLoop = slider?.loop !== false; // Default to true if undefined
    
    // اگر اسلایدری وجود نداشت یا اسلایدی نداشت، پلیس‌هولدر را نمایش بده (برای پیش‌نمایش در ادمین)
    if (!slider || slides.length === 0) {
        const radius = slider?.border_radius || 'rounded-2xl';
        const height = slider?.height_class || 'h-64';
        return (
            <div className={`relative overflow-hidden group bg-gray-200 ${height} ${radius} ${className}`}>
                <img 
                    alt="Placeholder" 
                    className="w-full h-full object-cover absolute inset-0 z-0 opacity-80" 
                    src="https://placehold.co/1200x400/ea580c/FFF?text=Noruz+Festival" 
                />
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <span className="bg-black/50 text-white px-4 py-2 rounded text-sm backdrop-blur-sm">
                        منتظر محتوا...
                    </span>
                </div>
            </div>
        );
    }

    // Auto Play
    useEffect(() => {
        resetTimeout();
        
        // Stop auto play if we reached the end and loop is disabled
        if (!isLoop && currentIndex >= totalSlides - slidesPerView) {
            return;
        }

        if (slider && totalSlides > slidesPerView) {
            timeoutRef.current = setTimeout(() => {
                handleNext();
            }, slider.interval || 5000);
        }
        return () => resetTimeout();
    }, [currentIndex, slider]);

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    const isCarousel = (slider?.effect === 'slide' || slidesPerView > 1);

    const handleNext = () => {
        if (isCarousel) {
            setCurrentIndex((prev) => {
               const maxIndex = Math.max(0, totalSlides - slidesPerView);
               if (prev >= maxIndex) {
                   return isLoop ? 0 : prev; // Loop or stop
               }
               return prev + 1;
            });
        } else {
            setCurrentIndex((prev) => {
                if (prev === totalSlides - 1) {
                    return isLoop ? 0 : prev;
                }
                return prev + 1;
            });
        }
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 800); 
    };

    const handlePrev = () => {
        if (isCarousel) {
            const maxIndex = Math.max(0, totalSlides - slidesPerView);
            setCurrentIndex((prev) => {
                if (prev <= 0) {
                    return isLoop ? maxIndex : 0;
                }
                return prev - 1;
            });
        } else {
            setCurrentIndex((prev) => {
                if (prev === 0) {
                    return isLoop ? totalSlides - 1 : 0;
                }
                return prev - 1;
            });
        }
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 800);
    };

    const getRadiusClass = () => slider.border_radius || 'rounded-2xl';
    
    const dir = slider.direction || 'ltr'; 
    const isRtl = dir === 'rtl';

    return (
        <div 
            className={`relative overflow-hidden shadow-lg group bg-gray-900 ${slider.height_class} ${getRadiusClass()} ${className}`}
            style={{ 
                perspective: '1200px', 
                overflowAnchor: 'none',
                borderWidth: slider.border_width || '0',
                borderColor: slider.border_color || 'transparent',
                borderStyle: slider.border_width && slider.border_width !== '0' ? 'solid' : 'none',
                // اعمال رنگ پس‌زمینه به کانتینر اصلی (که در فاصله بین اسلایدها دیده می‌شود)
                backgroundColor: slider.gap_color || 'transparent'
            }} 
            dir={dir}
        >
            {/* --- CAROUSEL / SLIDE MODE --- */}
            {isCarousel ? (
                <div 
                    className="flex h-full transition-transform ease-out duration-700 will-change-transform"
                    style={{ 
                        gap: `${gap}px`,
                        // محاسبه دقیق حرکت اسلایدر با در نظر گرفتن فاصله (gap)
                        // در حالت RTL جهت حرکت مثبت است (اگر کانتینر راست چین باشد) اما معمولا translate منفی است
                        // فرض بر استاندارد LTR برای اسلایدرها:
                        transform: `translateX(calc(${isRtl ? '' : '-'}${currentIndex} * ((100% - ${(slidesPerView - 1) * gap}px) / ${slidesPerView} + ${gap}px)))`,
                        
                        width: '100%',
                        direction: dir as "ltr" | "rtl"
                    }}
                >
                    {slides.map((slide) => (
                        <div 
                            key={slide.id} 
                            className="relative h-full shrink-0 overflow-hidden"
                            style={{ 
                                // محاسبه عرض هر اسلاید با کسر فاصله‌ها
                                width: `calc((100% - ${(slidesPerView - 1) * gap}px) / ${slidesPerView})`
                            }}
                            dir="rtl" // محتوای داخلی همیشه راست‌چین (فارسی) باشد
                        >
                            <SlideItem slide={slide} isActive={true} /> 
                        </div>
                    ))}
                </div>
            ) : (
                /* --- ABSOLUTE STACK MODE (Effects) --- */
                <div className="relative w-full h-full" dir="rtl">
                    {slides.map((slide, index) => {
                        const isActive = index === currentIndex;
                        const effect = slider.effect || 'fade';
                        
                        let effectClass = '';
                        let effectStyle: React.CSSProperties = {};

                        if (effect === 'fade') {
                            effectClass = isActive ? 'opacity-100 z-10' : 'opacity-0 z-0';
                        } else if (effect === 'cube') {
                            effectClass = isActive 
                                ? 'opacity-100 scale-100 z-10 rotate-0' 
                                : 'opacity-0 scale-75 z-0 rotate-y-90'; 
                        } else if (effect === 'coverflow') {
                             effectClass = isActive 
                                ? 'opacity-100 scale-100 z-10' 
                                : 'opacity-0 scale-90 z-0 blur-sm';
                        } 
                        else if (effect === 'zoom') {
                            effectClass = isActive ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-110';
                        } else if (effect === 'cards') {
                            const offset = index - currentIndex;
                            const isVisible = Math.abs(offset) <= 2;
                            effectClass = isVisible ? 'transition-all duration-700 ease-out' : 'hidden';
                            
                            if (isActive) {
                                effectStyle = { zIndex: 10, transform: 'translateX(0) scale(1)', opacity: 1 };
                            } else if (offset < 0) { 
                                effectStyle = { zIndex: 5, transform: 'translateX(10%) scale(0.9) rotateY(10deg)', opacity: 0 };
                            } else { 
                                effectStyle = { zIndex: 9 - Math.abs(offset), transform: `translateX(${-5 * offset}%) scale(${1 - (0.1 * Math.abs(offset))})`, opacity: 1 - (0.3 * Math.abs(offset)) };
                            }
                        } else if (effect === 'rotate') {
                            effectClass = isActive ? 'opacity-100 z-10 rotate-0 scale-100' : 'opacity-0 z-0 rotate-12 scale-110';
                        } else if (effect === 'parallax') {
                             effectClass = isActive ? 'opacity-100 z-10 translate-y-0' : 'opacity-0 z-0 translate-y-full';
                        } else {
                            effectClass = isActive ? 'opacity-100 z-10' : 'opacity-0 z-0';
                        }

                        return (
                            <div 
                                key={slide.id}
                                className={clsx(
                                    "absolute inset-0 transition-all ease-in-out duration-1000",
                                    effectClass
                                )}
                                style={effectStyle}
                            >
                                <SlideItem slide={slide} isActive={isActive} />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Controls */}
            {totalSlides > slidesPerView && (
                <>
                    {/* Prev Button */}
                    {(isLoop || currentIndex > 0) && (
                        <button onClick={handlePrev} className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/50 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition border border-white/10 hover:scale-110`}>
                            {isRtl ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
                        </button>
                    )}
                    
                    {/* Next Button */}
                    {(isLoop || currentIndex < totalSlides - slidesPerView) && (
                        <button onClick={handleNext} className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/50 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition border border-white/10 hover:scale-110`}>
                            {isRtl ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
                        </button>
                    )}
                    
                    {/* Indicators (Dots) - only for reasonable amount of slides */}
                    {totalSlides < 15 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                            {Array.from({ length: isCarousel ? Math.ceil(totalSlides - slidesPerView + 1) : totalSlides }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        index === currentIndex ? 'bg-white w-8' : 'bg-white/40 w-4 hover:bg-white/60'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}