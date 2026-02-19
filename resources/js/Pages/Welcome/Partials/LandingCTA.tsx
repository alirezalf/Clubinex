import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function LandingCTA() {
    return (
        <section className="py-20 relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-6">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">آماده شروع هستید؟</h2>
                    <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto relative z-10">
                        همین حالا به جمع هزاران کسب‌وکار موفق بپیوندید و فروش خود را متحول کنید.
                    </p>
                    <Link href={route('login')} className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition relative z-10">
                        ساخت حساب کاربری
                        <ArrowLeft size={18} />
                    </Link>
                </div>
            </div>
        </section>
    );
}