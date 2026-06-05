import React, { useState, Suspense, lazy } from 'react';
import { usePage } from '@inertiajs/react';
import { useThemeSystem } from '@/Hooks/useThemeSystem';

const ClassicLogin = lazy(() => import('./ClassicLogin'));
const ModernLogin = lazy(() => import('./ModernLogin'));
const MinimalLogin = lazy(() => import('./MinimalLogin'));

interface LoginProps {
    settings: any;
    captchaUrl: string | null;
}

export default function Login({ settings, captchaUrl: initialCaptchaUrl }: LoginProps) {
    const { themeSettings } = usePage<any>().props;
    useThemeSystem(themeSettings);

    const [mode, setMode] = useState<'mobile' | 'email' | 'register'>('mobile');
    const [captchaUrl, setCaptchaUrl] = useState<string | null>(initialCaptchaUrl);

    const refreshCaptcha = () => {
        // Only refresh if captcha is enabled
        const isCaptchaEnabled = settings.captcha_enabled === '1' || settings.captcha_enabled === true;
        if (isCaptchaEnabled) {
            setCaptchaUrl(`/captcha/flat?${Math.random()}`);
        }
    };

    // Determine which theme to render
    const theme = settings.login_theme || 'modern';

    const commonProps = {
        mode,
        setMode,
        captchaUrl,
        refreshCaptcha,
        settings
    };

    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            {theme === 'modern' ? <ModernLogin {...commonProps} /> :
             theme === 'minimal' ? <MinimalLogin {...commonProps} /> :
             <ClassicLogin {...commonProps} />}
        </Suspense>
    );
}
