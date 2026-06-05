import React, { useRef, useEffect, useState } from 'react';

interface Props {
    children: React.ReactNode;
    className?: string;
    pauseOnHover?: boolean;
    speed?: number; // pixels per second
    gap?: number;
}

export default function MarqueeText({ children, className = '', pauseOnHover = true, speed = 25, gap = 16 }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [scrollDistance, setScrollDistance] = useState(0);

    useEffect(() => {
        const checkOverflow = () => {
            if (containerRef.current && contentRef.current) {
                const cWidth = containerRef.current.clientWidth;
                const iWidth = contentRef.current.scrollWidth;

                if (iWidth > cWidth) {
                    setIsOverflowing(true);
                    setScrollDistance(iWidth - cWidth + gap);
                } else {
                    setIsOverflowing(false);
                    setScrollDistance(0);
                }
            }
        };

        // Check initially and also slightly delay to ensure fonts/layout are ready
        checkOverflow();
        const timeout = setTimeout(checkOverflow, 100);

        const resizeObserver = new ResizeObserver(() => checkOverflow());
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        if (contentRef.current) {
            resizeObserver.observe(contentRef.current);
        }

        return () => {
            clearTimeout(timeout);
            resizeObserver.disconnect();
        };
    }, [children, gap]);

    const duration = isOverflowing ? Math.max(scrollDistance / speed, 3) : 0;
    const isRtl = document.dir === 'rtl' || document.documentElement.dir === 'rtl' || true; // Persian standard app is RTL

    return (
        <div
            ref={containerRef}
            className={`overflow-hidden whitespace-nowrap w-full ${className}`}
        >
            <div
                ref={contentRef}
                className={`inline-block ${isOverflowing ? 'animate-marquee-scroll' : ''}`}
                style={{
                    '--scroll-dist': isRtl ? `${scrollDistance}px` : `-${scrollDistance}px`,
                    animationDuration: `${duration}s`,
                } as React.CSSProperties}
            >
                {children}
            </div>
            {isOverflowing && (
                <style>{`
                    @keyframes marquee-scroll {
                        0%, 15% { transform: translateX(0); }
                        45%, 55% { transform: translateX(var(--scroll-dist)); }
                        85%, 100% { transform: translateX(0); }
                    }
                    .animate-marquee-scroll {
                        animation: marquee-scroll linear infinite;
                    }
                    ${pauseOnHover ? `
                    .animate-marquee-scroll:hover {
                        animation-play-state: paused;
                    }
                    ` : ''}
                `}</style>
            )}
        </div>
    );
}
