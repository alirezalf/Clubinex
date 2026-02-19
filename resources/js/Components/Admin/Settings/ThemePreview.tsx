import React from 'react';

export default function ThemePreview({ settings }: { settings: any }) {
    // Generate derived colors for preview
    const primary = settings.primary_color || '#0284c7';
    // Create a very light version of primary for preview using simple opacity
    // We bind directly to the hex value provided by the settings object
    
    // Helper to add alpha to hex
    const addAlpha = (hex: string, alpha: number) => {
        const _hex = hex.replace('#', '');
        if (_hex.length === 6) {
            const r = parseInt(_hex.substring(0, 2), 16);
            const g = parseInt(_hex.substring(2, 4), 16);
            const b = parseInt(_hex.substring(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return hex;
    };

    const primary50 = addAlpha(primary, 0.1); 
    
    // Inline styles for the preview container
    // We use the direct props to ensure reactivity
    const style = {
        '--preview-primary': primary,
        '--preview-primary-50': primary50,
        '--preview-sidebar-bg': settings.sidebar_bg,
        '--preview-sidebar-text': settings.sidebar_text,
        '--preview-header-bg': settings.header_bg,
        '--preview-radius': settings.radius_size,
        '--preview-texture': settings.sidebar_texture,
    } as React.CSSProperties;

    return (
        <div className="w-full h-full bg-gray-50 overflow-hidden flex text-right font-sans text-[10px]" style={style} dir="rtl">
            
            {/* Preview Sidebar */}
            <div 
                className="w-1/4 h-full flex flex-col border-l border-black/5 transition-colors duration-300 relative"
                style={{ backgroundColor: 'var(--preview-sidebar-bg)', color: 'var(--preview-sidebar-text)' }}
            >
                {/* Texture Layer */}
                <div className={`absolute inset-0 opacity-10 pointer-events-none sidebar-texture-${settings.sidebar_texture}`}></div>

                {/* Brand */}
                <div className="h-10 flex items-center px-3 gap-2 border-b border-black/5 relative z-10">
                    <div className="w-5 h-5 rounded flex items-center justify-center text-white font-bold text-[8px]" style={{ backgroundColor: 'var(--preview-primary)' }}>
                        C
                    </div>
                    <span className="font-bold opacity-90">Clubinex</span>
                </div>

                {/* Menu Items */}
                <div className="p-2 space-y-1 relative z-10">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`flex items-center gap-2 p-1.5 rounded ${i === 1 ? 'bg-[var(--preview-primary-50)]' : 'opacity-70'}`} style={{ borderRadius: 'var(--preview-radius)' }}>
                            <div className="w-3 h-3 rounded bg-current opacity-30" style={{ color: i === 1 ? 'var(--preview-primary)' : 'inherit' }}></div>
                            <div className="h-1.5 w-12 bg-current opacity-40 rounded-full" style={{ color: i === 1 ? 'var(--preview-primary)' : 'inherit' }}></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Preview Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Preview Header */}
                <div 
                    className="h-10 border-b border-gray-200/50 flex items-center justify-between px-3 backdrop-blur-sm transition-colors duration-300"
                    style={{ backgroundColor: 'var(--preview-header-bg)' }}
                >
                    <div className="h-1.5 w-16 bg-gray-200 rounded-full"></div>
                    <div className="flex gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                        <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                    </div>
                </div>

                {/* Preview Content Body */}
                <div className="p-3 space-y-3 overflow-y-auto">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white p-2 rounded shadow-sm border border-gray-100" style={{ borderRadius: 'var(--preview-radius)' }}>
                            <div className="w-6 h-6 rounded mb-1" style={{ backgroundColor: primary50, color: 'var(--preview-primary)' }}></div>
                            <div className="h-1 w-8 bg-gray-200 rounded-full mb-1"></div>
                            <div className="h-2 w-4 bg-gray-800 rounded-full"></div>
                        </div>
                        <div className="bg-white p-2 rounded shadow-sm border border-gray-100" style={{ borderRadius: 'var(--preview-radius)' }}>
                            <div className="w-6 h-6 rounded bg-green-50 mb-1"></div>
                            <div className="h-1 w-8 bg-gray-200 rounded-full mb-1"></div>
                            <div className="h-2 w-4 bg-gray-800 rounded-full"></div>
                        </div>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white p-3 rounded shadow-sm border border-gray-100" style={{ borderRadius: 'var(--preview-radius)' }}>
                        <div className="flex justify-between items-center mb-2">
                            <div className="h-2 w-20 bg-gray-200 rounded-full"></div>
                            <div className="h-4 w-10 rounded opacity-20" style={{ backgroundColor: 'var(--preview-primary)' }}></div>
                        </div>
                        <div className="space-y-1.5">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between p-1 hover:bg-gray-50 rounded">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-full bg-gray-100"></div>
                                        <div className="space-y-0.5">
                                            <div className="h-1.5 w-12 bg-gray-200 rounded-full"></div>
                                            <div className="h-1 w-8 bg-gray-100 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="h-1 w-4 bg-gray-200 rounded-full"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* CSS for Preview Textures (Injected locally for preview) */}
            <style>{`
                .sidebar-texture-dots { background-image: radial-gradient(currentColor 1px, transparent 1px); background-size: 8px 8px; }
                .sidebar-texture-lines { background-image: repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%); background-size: 6px 6px; }
                .sidebar-texture-grid { background-image: linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px); background-size: 10px 10px; }
                .sidebar-texture-hex { background-image: url("data:image/svg+xml,%3Csvg width='12' height='20' viewBox='0 0 24 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40c5.523 0 10-4.477 10-10V10c0-5.523-4.477-10-10-10s-10 4.477-10 10v20c0 5.523 4.477 10 10 10z' fill='currentColor' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E"); background-size: 12px 20px; }
                .sidebar-texture-sea { background-image: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80'); background-size: cover; opacity: 0.3; }
                .sidebar-texture-sunset { background-image: url('https://images.unsplash.com/photo-1472120435266-53107fd0c44a?auto=format&fit=crop&w=300&q=80'); background-size: cover; opacity: 0.3; }
                .sidebar-texture-space { background-image: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80'); background-size: cover; opacity: 0.3; }
                .sidebar-texture-forest { background-image: url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=300&q=80'); background-size: cover; opacity: 0.3; }
            `}</style>
        </div>
    );
}