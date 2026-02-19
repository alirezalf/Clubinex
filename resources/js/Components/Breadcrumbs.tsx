import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, Home } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface Props {
    items?: BreadcrumbItem[];
}

export default function Breadcrumbs({ items = [] }: Props) {
    return (
        <nav className="flex mb-5" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 space-x-reverse">
                <li className="inline-flex items-center">
                    <Link 
                        href={route('dashboard')} 
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors"
                    >
                        <Home size={16} className="ml-2" />
                        خانه
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index}>
                        <div className="flex items-center">
                            <ChevronLeft size={16} className="text-gray-300 mx-1 rtl:rotate-0" />
                            {item.href ? (
                                <Link 
                                    href={item.href} 
                                    className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-sm font-medium text-gray-400 select-none">
                                    {item.label}
                                </span>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
