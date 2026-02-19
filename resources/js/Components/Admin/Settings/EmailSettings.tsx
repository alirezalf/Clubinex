import React from 'react';
import { Mail } from 'lucide-react';
import { InputGroup } from './SharedInputs';

export default function EmailSettings({ data, setData }: { data: any, setData: any }) {
    return (
        <div className="space-y-6 animate-in fade-in">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                <Mail size={20} className="text-primary-600" />
                تنظیمات ایمیل (SMTP)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup 
                    label="SMTP Host" 
                    name="mail_host" 
                    value={data.mail_host} 
                    onChange={setData} 
                    dir="ltr" 
                    placeholder="smtp.example.com" 
                />
                <InputGroup 
                    label="SMTP Port" 
                    name="mail_port" 
                    value={data.mail_port} 
                    onChange={setData} 
                    dir="ltr" 
                    placeholder="587" 
                />
                <InputGroup 
                    label="Username" 
                    name="mail_username" 
                    value={data.mail_username} 
                    onChange={setData} 
                    dir="ltr" 
                    placeholder="user@example.com" 
                />
                <InputGroup 
                    label="Password" 
                    name="mail_password" 
                    value={data.mail_password} 
                    onChange={setData} 
                    type="password" 
                    dir="ltr" 
                    placeholder="******" 
                />
                <InputGroup 
                    label="آدرس فرستنده" 
                    name="mail_from_address" 
                    value={data.mail_from_address} 
                    onChange={setData} 
                    dir="ltr" 
                    placeholder="noreply@example.com" 
                />
                <InputGroup 
                    label="نام فرستنده" 
                    name="mail_from_name" 
                    value={data.mail_from_name} 
                    onChange={setData} 
                    placeholder="Clubinex Support" 
                />
            </div>
        </div>
    );
}