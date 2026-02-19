import React, { useState, useEffect, useRef } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import gregorian from 'react-date-object/calendars/gregorian';
import gregorian_en from 'react-date-object/locales/gregorian_en';
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import { Calendar as CalendarIcon, ChevronDown, Check, X, Clock } from 'lucide-react';
import clsx from 'clsx';

interface PersianDatePickerProps {
    value?: string; // Expecting YYYY-MM-DD HH:mm:ss (Gregorian) from DB
    onChange: (date: string) => void; 
    label?: string;
    error?: string;
    placeholder?: string;
    withTime?: boolean; // New prop to enable time selection
}

export default function PersianDatePicker({ value, onChange, label, error, placeholder = "انتخاب تاریخ", withTime = false }: PersianDatePickerProps) {
    // When value comes from DB (e.g., 1990-01-01), we need to create a DateObject with Gregorian calendar first
    // so it knows how to interpret the string, then it can display in Persian.
    const datePickerValue = value 
        ? new DateObject({ 
            date: value, 
            format: withTime ? "YYYY-MM-DD HH:mm:ss" : "YYYY-MM-DD", 
            calendar: gregorian, 
            locale: gregorian_en 
          }) 
        : null;

    const handleDesktopChange = (date: DateObject | null) => {
        if (date) {
            // Convert selected Persian date to Gregorian string for DB
            date.convert(gregorian, gregorian_en);
            const format = withTime ? "YYYY-MM-DD HH:mm:ss" : "YYYY-MM-DD";
            const gregorianDate = date.format(format);
            onChange(gregorianDate);
        } else {
            onChange('');
        }
    };

    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            
            <div className="relative">
                <DatePicker
                    value={datePickerValue}
                    onChange={handleDesktopChange}
                    calendar={persian}
                    locale={persian_fa}
                    calendarPosition="bottom-right"
                    inputClass={clsx(
                        "w-full border rounded-xl px-4 py-2.5 outline-none transition-shadow text-sm cursor-pointer",
                        error ? "border-red-300 focus:ring-2 focus:ring-red-200" : "border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    )}
                    containerClassName="w-full"
                    placeholder={placeholder}
                    format={withTime ? "YYYY/MM/DD HH:mm" : "YYYY/MM/DD"}
                    plugins={withTime ? [
                        <TimePicker position="bottom" hideSeconds />
                    ] : []}
                    portal
                    zIndex={9999}
                />
                <div className="absolute left-3 top-2.5 pointer-events-none text-gray-400">
                    {withTime ? <Clock size={18} /> : <CalendarIcon size={18} />}
                </div>
            </div>
            
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}