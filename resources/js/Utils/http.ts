export function getXsrfToken() {
    const match = document.cookie.match(new RegExp('(^|;\\s*)XSRF-TOKEN=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
}

export async function request(method: string, url: string, data?: any, config: any = {}) {
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...config?.headers,
    };

    const token = getXsrfToken();
    if (token && method !== 'GET') {
        headers['X-XSRF-TOKEN'] = token;
    }

    const options: RequestInit = {
        method,
        headers,
    };

    if (data) {
        if (method === 'GET') {
            const params = new URLSearchParams(data).toString();
            url += (url.includes('?') ? '&' : '?') + params;
        } else {
            headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(data);
        }
    }

    const response = await fetch(url, options);

    let responseData;
    let contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
         responseData = await response.json();
    } else {
        responseData = await response.text();
    }

    if (!response.ok) {
        const error = new Error('HTTP Error') as any;
        error.response = { status: response.status, data: responseData, headers: response.headers };
        error.status = response.status;
        throw error;
    }

    return { data: responseData, status: response.status, headers: response.headers };
}

export const http = {
    get: (url: string, config?: any) => request('GET', url, config?.params, config),
    post: (url: string, data?: any, config?: any) => request('POST', url, data, config),
    put: (url: string, data?: any, config?: any) => request('PUT', url, data, config),
    delete: (url: string, config?: any) => request('DELETE', url, undefined, config),
    patch: (url: string, data?: any, config?: any) => request('PATCH', url, data, config),
};
