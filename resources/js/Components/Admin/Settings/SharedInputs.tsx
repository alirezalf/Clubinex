import React from 'react';

export const InputGroup = ({ label, name, value, onChange, type = 'text', dir = 'rtl', placeholder = '' }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {type === 'textarea' ? (
            <textarea value={value || ''} onChange={e => onChange(name, e.target.value)} className="w-full border border-gray-300 rounded-xl text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 px-4 py-3 transition-shadow" rows={3} placeholder={placeholder} />
        ) : (
            <input type={type} value={value || ''} onChange={e => onChange(name, e.target.value)} className={`w-full border border-gray-300 rounded-xl text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 px-4 py-3 transition-shadow ${dir === 'ltr' ? 'text-left' : 'text-right'}`} dir={dir} placeholder={placeholder} />
        )}
    </div>
);

export const ColorPicker = ({ label, value, onChange }: any) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="flex items-center gap-2 border border-gray-300 rounded-xl p-1.5 bg-white focus-within:ring-1 focus-within:ring-primary-500 transition-shadow">
                <input 
                    type="color" 
                    value={value && value.startsWith('#') ? value : '#000000'} 
                    onChange={e => onChange(e.target.value)} 
                    className="h-9 w-10 rounded-lg cursor-pointer border-none p-0 bg-transparent" 
                />
                <input 
                    type="text" 
                    value={value || ''} 
                    onChange={e => onChange(e.target.value)}
                    className="flex-1 border-none focus:ring-0 text-sm font-mono text-gray-600 uppercase"
                    placeholder="#RRGGBB or rgba(...)"
                />
            </div>
        </div>
    );
}

export const SidebarModeBtn = ({ label, active, onClick, icon: Icon }: any) => (
    <button 
        type="button"
        onClick={onClick}
        className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition ${active ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
    >
        <Icon size={16} />
        {label}
    </button>
);