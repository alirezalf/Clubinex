import React from 'react';
import { Share2 } from 'lucide-react';
import { InputGroup } from './SharedInputs';

export default function SocialSettings({ data, setData }: { data: any, setData: any }) {
    return (
        <div className="space-y-6 animate-in fade-in">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                <Share2 size={20} className="text-primary-600" />
                شبکه‌های اجتماعی
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup 
                    label="اینستاگرام" 
                    name="instagram" 
                    value={data.instagram} 
                    onChange={setData} 
                    dir="ltr" 
                    placeholder="https://instagram.com/..." 
                />
                <InputGroup 
                    label="تلگرام" 
                    name="telegram" 
                    value={data.telegram} 
                    onChange={setData} 
                    dir="ltr" 
                    placeholder="https://t.me/..." 
                />
                <InputGroup 
                    label="واتساپ" 
                    name="whatsapp" 
                    value={data.whatsapp} 
                    onChange={setData} 
                    dir="ltr" 
                    placeholder="https://wa.me/..." 
                />
                <InputGroup 
                    label="لینکدین" 
                    name="linkedin" 
                    value={data.linkedin} 
                    onChange={setData} 
                    dir="ltr" 
                    placeholder="https://linkedin.com/in/..." 
                />
            </div>
        </div>
    );
}