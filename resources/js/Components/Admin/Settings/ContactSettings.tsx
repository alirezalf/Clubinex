import React from 'react';
import { Phone } from 'lucide-react';
import { InputGroup } from './SharedInputs';

export default function ContactSettings({ data, setData }: { data: any, setData: any }) {
    return (
        <div className="space-y-6 animate-in fade-in">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                <Phone size={20} className="text-primary-600" />
                اطلاعات تماس
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup 
                    label="تلفن تماس" 
                    name="admin_mobile" 
                    value={data.admin_mobile} 
                    onChange={setData} 
                    dir="ltr" 
                    placeholder="09123456789" 
                />
                <InputGroup 
                    label="ایمیل پشتیبانی" 
                    name="support_email" 
                    value={data.support_email} 
                    onChange={setData} 
                    dir="ltr" 
                    placeholder="support@example.com" 
                />
            </div>
            <InputGroup 
                label="آدرس پستی" 
                name="address" 
                value={data.address} 
                onChange={setData} 
                type="textarea" 
                placeholder="استان، شهر، خیابان..." 
            />
        </div>
    );
}