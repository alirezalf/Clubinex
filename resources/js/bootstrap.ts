export {}; // Ensure it's a module

// Intercept window.fetch globally to handle CSRF 419 token expiration
const originalFetch = window.fetch;

window.fetch = async (...args) => {
    let response = await originalFetch(...args);

    // If CSRF token expired, fetch a new one and retry
    if (response.status === 419) {
        // Prevent infinite loops by attaching a custom flag on Request objects or via URL check
        const url = args[0] instanceof Request ? args[0].url : args[0];
        if (typeof url === 'string' && url.includes('/sanctum/csrf-cookie')) {
            return response;
        }

        // Fetch new token
        await originalFetch('/sanctum/csrf-cookie', {
            method: 'GET',
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });

        // Re-read XSRF token from cookie
        const match = document.cookie.match(new RegExp('(^|;\\s*)XSRF-TOKEN=([^;]*)'));
        const token = match ? decodeURIComponent(match[2]) : null;

        // If options were provided as second parameter, add the new token
        if (args[1]) {
            args[1].headers = {
                ...args[1].headers,
                'X-XSRF-TOKEN': token || ''
            };
        } else if (args[0] instanceof Request) {
            args[0].headers.set('X-XSRF-TOKEN', token || '');
        }

        // Retry original request
        response = await originalFetch(...args);
    }

    return response;
};
