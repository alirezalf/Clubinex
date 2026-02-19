import React from 'react';
import { Link } from '@inertiajs/react';
import { Slide } from './types';

interface Props {
    slide: Slide;
    isActive: boolean;
}

export default function SlideItem({ slide, isActive }: Props) {
    const textColor = slide.text_color && (slide.text_color.startsWith('#') || slide.text_color.startsWith('rgb'))
        ? slide.text_color 
        : undefined;
        
    const textClass = !textColor ? (slide.text_color || 'text-white') : '';

    const wrapperClass = (pos: string) => {
        const map: Record<string, string> = {
            'top-right': 'justify-start items-start text-right',
            'top-center': 'justify-center items-start text-center',
            'top-left': 'justify-end items-start text-left',
            'center-right': 'justify-start items-center text-right',
            'center-center': 'justify-center items-center text-center',
            'center-left': 'justify-end items-center text-left',
            'bottom-right': 'justify-start items-end text-right',
            'bottom-center': 'justify-center items-end text-center',
            'bottom-left': 'justify-end items-end text-left',
        };
        return map[pos] || map['center-center'];
    };

    const getBtnSizeClass = (size?: string) => {
        switch (size) {
            case 'sm': return 'px-4 py-1.5 text-xs';
            case 'lg': return 'px-8 py-3 text-lg';
            case 'xl': return 'px-10 py-4 text-xl';
            case 'md': default: return 'px-6 py-2.5 text-sm';
        }
    };

    const getAnimDuration = (speed?: string) => {
        switch (speed) {
            case 'slow': return 'duration-[1500ms]';
            case 'fast': return 'duration-300';
            case 'normal': default: return 'duration-700';
        }
    };

    const getAnimClass = (animName: string | undefined, isActive: boolean) => {
        if (!isActive) return 'opacity-0';
        const base = `animate-in fill-mode-forwards ${getAnimDuration(slide.anim_speed)}`;
        
        switch (animName) {
            case 'fade-in': return `${base} fade-in`;
            case 'fade-in-up': return `${base} fade-in slide-in-from-bottom-8`;
            case 'fade-in-down': return `${base} fade-in slide-in-from-top-8`;
            case 'slide-in-right': return `${base} fade-in slide-in-from-right-8`; 
            case 'slide-in-left': return `${base} fade-in slide-in-from-left-8`;
            case 'zoom-in': return `${base} zoom-in-50 fade-in`;
            case 'zoom-out': return `${base} zoom-in-110 fade-in`; 
            case 'bounce-in': return `${base} bounce-in fade-in`;
            case 'flip-x': return `${base} spin-in-x`;
            default: return `${base} fade-in`;
        }
    }

    const textAnimClass = getAnimClass(slide.text_anim_in, isActive);
    const btnAnimClass = getAnimClass(slide.btn_anim_in || 'fade-in-up', isActive) + ' delay-300'; 

    return (
        <div className="relative w-full h-full overflow-hidden select-none">
            {/* Background Layer */}
            {slide.image_path ? (
                <img 
                    src={slide.image_path} 
                    alt={slide.title || ''} 
                    className="w-full h-full object-cover absolute inset-0 z-0 pointer-events-none"
                />
            ) : (
                <div 
                    className="w-full h-full flex items-center justify-center relative z-0"
                    style={{ 
                        background: slide.bg_color || 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' 
                    }}
                >
                </div>
            )}
            
            {/* Watermark Text */}
            {slide.bg_text && (
                <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none overflow-hidden opacity-10">
                    <h1 className="text-[12vw] font-black text-white select-none whitespace-nowrap rotate-[-5deg] tracking-tighter">
                        {slide.bg_text}
                    </h1>
                </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-0"></div>

            {/* Content Layer */}
            <div className={`absolute inset-0 flex p-6 md:p-12 z-10 h-full w-full ${wrapperClass(slide.content_position)}`}>
                <div className={`max-w-3xl flex flex-col ${slide.content_position.includes('center') ? 'items-center' : (slide.content_position.includes('right') ? 'items-start' : 'items-end')}`}>
                    
                    <div 
                        className={`${textAnimClass} ${textClass}`}
                        style={{ color: textColor }} 
                    >
                        {slide.title && (
                            <h2 className={`font-black mb-4 drop-shadow-lg leading-tight ${slide.text_size || 'text-3xl'}`}>
                                {slide.title}
                            </h2>
                        )}
                        {slide.description && (
                            <p className="text-base md:text-lg opacity-95 drop-shadow-md leading-relaxed font-medium mb-6">
                                {slide.description}
                            </p>
                        )}
                    </div>

                    {/* Button */}
                    {slide.button_text && slide.btn_pos_type !== 'absolute' && (
                        <div className={`${btnAnimClass} mt-2`}>
                            <Link 
                                href={slide.button_link || '#'} 
                                className={`inline-block rounded-xl font-bold transition shadow-xl transform hover:scale-105 active:scale-95 ${getBtnSizeClass(slide.button_size)}`}
                                style={{ 
                                    backgroundColor: slide.button_bg_color || '#ffffff', 
                                    color: slide.button_color || '#000000' 
                                }}
                            >
                                {slide.button_text}
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Absolute Button */}
            {slide.button_text && slide.btn_pos_type === 'absolute' && (
                <div className={`absolute z-30 ${slide.btn_custom_pos || 'bottom-10 right-10'} ${btnAnimClass}`}>
                    <Link 
                        href={slide.button_link || '#'} 
                        className={`inline-block rounded-xl font-bold transition shadow-xl transform hover:scale-105 active:scale-95 ${getBtnSizeClass(slide.button_size)}`}
                        style={{ 
                            backgroundColor: slide.button_bg_color || '#ffffff', 
                            color: slide.button_color || '#000000' 
                        }}
                    >
                        {slide.button_text}
                    </Link>
                </div>
            )}
        </div>
    );
}