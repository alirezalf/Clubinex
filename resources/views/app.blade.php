<!DOCTYPE html>
<html lang="fa" dir="rtl">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="robots" content="index, follow">
        <meta name="theme-color" content="{{ $themeSettings['primary_color'] ?? '#0284c7' }}">


        <title inertia>{{ config('app.name', 'Clubinex') }}</title>
        <meta name="description" content="{{ $site['description'] ?? 'باشگاه مشتریان پیشرفته با امکانات گیمیفیکیشن و فروشگاه جوایز' }}">
        <meta name="keywords" content="{{ \App\Models\SystemSetting::getValue('seo', 'meta_keywords') ?? 'باشگاه مشتریان, وفاداری, گیمیفیکیشن, جوایز' }}">
        <meta name="author" content="Clubinex Team">
        <link rel="canonical" href="{{ url()->current() }}">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="{{ config('app.name', 'Clubinex') }}">
        <meta property="og:description" content="{{ $site['description'] ?? '' }}">
        <meta property="og:image" content="{{ \App\Models\SystemSetting::getValue('seo', 'og_image') ?? asset('images/og-default.jpg') }}">
        <meta property="og:locale" content="fa_IR">
        <meta property="og:site_name" content="{{ $site['name'] ?? 'Clubinex' }}">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="{{ url()->current() }}">
        <meta property="twitter:title" content="{{ config('app.name', 'Clubinex') }}">
        <meta property="twitter:description" content="{{ $site['description'] ?? '' }}">
        <meta property="twitter:image" content="{{ \App\Models\SystemSetting::getValue('seo', 'og_image') ?? asset('images/og-default.jpg') }}">


        @if(isset($site['favicon']))
            <link rel="icon" href="{{ $site['favicon'] }}">
        @endif

        <!-- Fonts -->
        <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css" />

        <!-- Dynamic Theme Styles -->
       <style>
            :root {
                /* محاسبات رنگ در AppServiceProvider انجام شده است */
                --color-primary-50: rgb({{ $themeSettings['primary_rgb'] ?? '2 132 199' }} / 0.05);
                --color-primary-100: rgb({{ $themeSettings['primary_rgb'] ?? '2 132 199' }} / 0.1);
                --color-primary-200: rgb({{ $themeSettings['primary_rgb'] ?? '2 132 199' }} / 0.2);
                --color-primary-300: rgb({{ $themeSettings['primary_rgb'] ?? '2 132 199' }} / 0.3);
                --color-primary-400: rgb({{ $themeSettings['primary_rgb'] ?? '2 132 199' }} / 0.5);
                --color-primary-500: {{ $themeSettings['primary_color'] ?? '#0284c7' }}; /* Main Color */
                --color-primary-600: color-mix(in srgb, {{ $themeSettings['primary_color'] ?? '#0284c7' }}, black 10%);
                --color-primary-700: color-mix(in srgb, {{ $themeSettings['primary_color'] ?? '#0284c7' }}, black 20%);
                --color-primary-800: color-mix(in srgb, {{ $themeSettings['primary_color'] ?? '#0284c7' }}, black 30%);
                --color-primary-900: color-mix(in srgb, {{ $themeSettings['primary_color'] ?? '#0284c7' }}, black 40%);

                --radius-xl: {{ $themeSettings['radius_size'] ?? '0.75rem' }};
                --radius-2xl: calc({{ $themeSettings['radius_size'] ?? '0.75rem' }} + 0.25rem);

                /* New Variables for Theme Customization */
                --sidebar-bg: {{ $themeSettings['sidebar_bg'] ?? '#ffffff' }};
                --sidebar-text: {{ $themeSettings['sidebar_text'] ?? '#1f2937' }};
                --header-bg: {{ $themeSettings['header_bg'] ?? 'rgba(255,255,255,0.8)' }};
            }
        </style>

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
@php
    $organizationData = [
        "@context" => "https://schema.org",
        "@type" => "Organization",
        "name" => $site['name'] ?? 'Clubinex',
        "url" => url('/'),
        "logo" => $site['logo'] ?? '',
        "contactPoint" => [
            "@type" => "ContactPoint",
            "telephone" => $site['contact']['phone'] ?? '',
            "contactType" => "customer service"
        ]
    ];
@endphp

<script type="application/ld+json">
    {!! json_encode($organizationData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}
</script>

        
    </head>
    <body class="font-sans antialiased bg-gray-50 text-gray-800">
        @inertia
    </body>
</html>