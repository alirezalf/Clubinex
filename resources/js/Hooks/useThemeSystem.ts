import { useEffect, useLayoutEffect } from 'react';
import { generateColorShades, getContrastColor } from '@/Utils/ThemeUtils';

export interface ThemeSettings {
    primary_color?: string;
    header_bg?: string;
    sidebar_bg?: string;
    sidebar_text?: string;
    sidebar_texture?: string;
    radius_size?: string;
    sidebar_collapsed?: boolean;
    card_style?: string;
    card_shadow?: string;
    card_opacity?: string;
}

export function useThemeSystem(themeSettings?: ThemeSettings) {
    useLayoutEffect(() => {
        if (!themeSettings) return;

        const root = document.documentElement;
        const settings = themeSettings;

        // 1. Colors
        const hex = settings.primary_color || '#0284c7';
        const headerBg = (settings.header_bg as string) || 'rgba(255,255,255,0.8)';
        const sidebarBg = settings.sidebar_bg || '#ffffff';

        const shades = generateColorShades(hex);
        Object.entries(shades).forEach(([key, value]) => {
            root.style.setProperty(key, value as string);
        });

        // 2. Header Contrast
        const headerText = getContrastColor(headerBg, '#ffffff', '#1f2937');
        const headerTextMuted = getContrastColor(headerBg, 'rgba(255,255,255,0.7)', '#6b7280');
        const headerHover = getContrastColor(headerBg, 'rgba(255,255,255,0.1)', 'rgba(0,0,0,0.05)');

        // 3. Apply CSS Variables
        root.style.setProperty('--sidebar-bg', sidebarBg);
        root.style.setProperty('--sidebar-text', settings.sidebar_text || '#1f2937');
        root.style.setProperty('--sidebar-texture', settings.sidebar_texture || 'none');
        root.style.setProperty('--header-bg', headerBg);
        root.style.setProperty('--header-text', headerText);
        root.style.setProperty('--header-text-muted', headerTextMuted);
        root.style.setProperty('--header-hover', headerHover);
        root.style.setProperty('--radius-xl', settings.radius_size || '0.75rem');
        root.style.setProperty('--radius-2xl', `calc(${settings.radius_size || '0.75rem'} + 0.25rem)`);
        root.style.setProperty('--card-opacity', settings.card_opacity || '1');

        // 4. Apply Body Attributes (Global Scope)
        document.body.setAttribute('data-card-style', settings.card_style || 'default');
        document.body.setAttribute('data-card-shadow', settings.card_shadow || 'sm');

        // Log for debugging
        // console.log('Theme Applied:', settings);

    }, [themeSettings]);
}
