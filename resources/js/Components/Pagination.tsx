import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    className?: string;
}

export default function Pagination({ links, className = '' }: PaginationProps) {
    if (links.length <= 3) return null;

    return (
        <div className={`flex flex-wrap justify-center gap-1 mt-6 ${className}`}>
            {links.map((link, key) => {
                let label = link.label;
                
                // Replace text labels with icons if needed
                if (label.includes('Previous')) {
                    return link.url ? (
                        <Link 
                            key={key} 
                            href={link.url} 
                            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition"
                        >
                            <ChevronRight size={16} />
                        </Link>
                    ) : null;
                }
                
                if (label.includes('Next')) {
                    return link.url ? (
                        <Link 
                            key={key} 
                            href={link.url} 
                            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition"
                        >
                            <ChevronLeft size={16} />
                        </Link>
                    ) : null;
                }

                return link.url ? (
                    <Link
                        key={key}
                        href={link.url}
                        className={`px-3 py-1.5 min-w-[32px] text-center rounded-lg text-sm font-medium transition-colors ${
                            link.active
                                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                        dangerouslySetInnerHTML={{ __html: label }}
                    />
                ) : (
                    <span
                        key={key}
                        className="px-3 py-1.5 min-w-[32px] text-center rounded-lg text-sm text-gray-400 border border-transparent"
                        dangerouslySetInnerHTML={{ __html: label }}
                    />
                );
            })}
        </div>
    );
}
