import React from 'react';

export default function SidebarStyles() {
    return (
        <style>{`
            /* اسکرول بار سفارشی */
            .scrollbar-thin {
                scrollbar-width: thin;
            }

            .scrollbar-thin::-webkit-scrollbar {
                width: 4px;
            }

            .scrollbar-thin::-webkit-scrollbar-track {
                background: transparent;
            }

            .scrollbar-thin::-webkit-scrollbar-thumb {
                background-color: color-mix(in srgb, var(--sidebar-text), transparent 70%);
                border-radius: 20px;
            }

            .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                background-color: color-mix(in srgb, var(--sidebar-text), transparent 50%);
            }

            /* انیمیشن‌ها */
            @keyframes shimmer {
                0% {
                    transform: translateX(-100%);
                }
                100% {
                    transform: translateX(100%);
                }
            }

            .animate-shimmer {
                animation: shimmer 2s infinite;
            }

            @keyframes pulse-glow {
                0%, 100% {
                    opacity: 0.5;
                }
                50% {
                    opacity: 1;
                }
            }

            .animate-pulse-glow {
                animation: pulse-glow 2s ease-in-out infinite;
            }

            /* بافت‌های سایدبار */
            :root[data-sidebar-texture="dots"] .sidebar-texture {
                background-image: radial-gradient(currentColor 1px, transparent 1px);
                background-size: 20px 20px;
            }

            :root[data-sidebar-texture="lines"] .sidebar-texture {
                background-image: repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%);
                background-size: 10px 10px;
            }

            :root[data-sidebar-texture="grid"] .sidebar-texture {
                background-image:
                    linear-gradient(currentColor 1px, transparent 1px),
                    linear-gradient(90deg, currentColor 1px, transparent 1px);
                background-size: 20px 20px;
            }

            :root[data-sidebar-texture="waves"] .sidebar-texture {
                background: radial-gradient(circle at 100% 50%, transparent 20%, currentColor 21%, currentColor 34%, transparent 35%, transparent),
                            radial-gradient(circle at 0% 50%, transparent 20%, currentColor 21%, currentColor 34%, transparent 35%, transparent) 0 -50px;
                background-size: 30px 100px;
            }

            :root[data-sidebar-texture="noise"] .sidebar-texture {
                background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E");
                background-repeat: repeat;
                background-size: 100px 100px;
            }

            /* بافت‌های تصویری */
            :root[data-sidebar-texture="sea"] .sidebar-texture {
                background-image: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80');
                background-size: cover;
                background-position: center;
                opacity: 0.15 !important;
            }

            :root[data-sidebar-texture="sunset"] .sidebar-texture {
                background-image: url('https://images.unsplash.com/photo-1472120435266-53107fd0c44a?auto=format&fit=crop&w=600&q=80');
                background-size: cover;
                background-position: center;
                opacity: 0.15 !important;
            }

            :root[data-sidebar-texture="space"] .sidebar-texture {
                background-image: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80');
                background-size: cover;
                background-position: center;
                opacity: 0.2 !important;
            }

            :root[data-sidebar-texture="forest"] .sidebar-texture {
                background-image: url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1000&q=80');
                background-size: cover;
                background-position: center;
                opacity: 0.15 !important;
            }

            :root[data-sidebar-texture="abstract"] .sidebar-texture {
                background-image: url('https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1000&q=80');
                background-size: cover;
                background-position: center;
                opacity: 0.1 !important;
            }

            :root[data-sidebar-texture="minimal"] .sidebar-texture {
                background-image: radial-gradient(circle at 30% 50%, currentColor 0.5px, transparent 0.5px);
                background-size: 15px 15px;
            }
        `}</style>
    );
}
