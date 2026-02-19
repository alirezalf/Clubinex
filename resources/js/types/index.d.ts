
export interface User {
    id: number;
    first_name: string;
    last_name: string;
    mobile: string;
    email: string;
    avatar: string;
    email_verified_at: string;
    roles: string[];
    points: number;
    club?: { id: number, name: string, color: string };
    status?: { id: number, name: string, slug: string, color: string };
}

export interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    links: PaginationLinks[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
}

export interface Product {
    id: number;
    title: string;
    model_name: string;
    description: string;
    image_url?: string;
    display_image?: string;
    points_value: number;
    category?: { id: number, title: string };
    is_active: boolean;
    serials_count?: number;
    used_serials_count?: number;
}

export interface ProductRegistration {
    id: number;
    user: User;
    product_name: string;
    product_model: string;
    serial_code: string;
    status: 'pending' | 'approved' | 'rejected';
    status_farsi: string;
    created_at_jalali: string;
    admin_note?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash: {
        message: string | null;
        error: string | null;
    };
    ziggy: any;
};

declare global {
    function route(
        name?: string,
        params?: Record<string, string | number> | (string | number)[] | any,
        absolute?: boolean,
    ): any;
}
