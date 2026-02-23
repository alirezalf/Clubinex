import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import ClassicLogin from './ClassicLogin';
import ModernLogin from './ModernLogin';
import MinimalLogin from './MinimalLogin';

interface LoginProps {
    settings: any;
    captchaUrl: string | null;
}

export default function Login({ settings, captchaUrl: initialCaptchaUrl }: LoginProps) {
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

    if (theme === 'modern') {
        return <ModernLogin {...commonProps} />;
    }

    if (theme === 'minimal') {
        return <MinimalLogin {...commonProps} />;
    }

    return <ClassicLogin {...commonProps} />;
}
