import { Head } from '@inertiajs/react';
import React from 'react';
import DynamicSlider from '@/Components/DynamicSlider';
import GuestLayout from '@/Layouts/GuestLayout';
import LandingCTA from './Welcome/Partials/LandingCTA';
import LandingFeatures from './Welcome/Partials/LandingFeatures';
import LandingHero from './Welcome/Partials/LandingHero';

interface SeoData {
    title: string;
    description: string;
}

export default function Welcome({ seo, slider }: { seo: SeoData, slider: any }) {
    return (
        <GuestLayout>
            <Head>
                <title>{seo.title}</title>
                <meta name="description" content={seo.description} />
            </Head>

            {/* Dynamic Slider or Fallback */}
            {slider ? (
                <DynamicSlider slider={slider} className="rounded-none h-[600px] lg:h-[700px]" />
            ) : (
                <LandingHero />
            )}

            <LandingFeatures />

            <LandingCTA />
        </GuestLayout>
    );
}