export const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface RequestOptions extends RequestInit {
    headers?: Record<string, string>;
}

async function fetchAPI(endpoint: string, options: RequestOptions = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    // If body is FormData, let the browser set Content-Type (including boundary)
    if (options.body instanceof FormData) {
        // Remove Content-Type so browser sets multipart/form-data
        delete (headers as any)['Content-Type'];
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, { ...config, cache: 'no-store' });

        // Handle 401 Unauthorized globally if needed (e.g., redirect to login)
        if (response.status === 401) {
            if (typeof window !== 'undefined') localStorage.removeItem('token');
            // window.location.href = '/login'; 
            // Better to handle this in UI or Context, but valid cleanup here.
        }

        // Try to parse JSON body; if none, fallback to empty object
        let data: any = {};
        try {
            data = await response.json();
        } catch (err) {
            // no JSON body
            data = {};
        }

        if (!response.ok) {
            const errMsg = data?.message || data?.error || response.statusText || 'API Error';
            throw new Error(errMsg);
        }

        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

export const api = {
    // Health
    checkHealth: () => fetchAPI('/health'),

    // Auth
    auth: {
        register: (email: string, password: string, role: string = 'user') =>
            fetchAPI('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password, role })
            }),
        login: (email: string, password: string) =>
            fetchAPI('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            }),
    },

    // Products
    products: {
        getAll: (query?: string) => fetchAPI(`/products${query ? `?search=${encodeURIComponent(query)}` : ''}`),
        getOne: (id: number | string) => fetchAPI(`/products/${id}`),
        // Admin only
        // `product` may be an object (JSON) or a FormData (for file uploads)
        create: (product: any) => {
            if (product instanceof FormData) return fetchAPI('/products', { method: 'POST', body: product });
            return fetchAPI('/products', { method: 'POST', body: JSON.stringify(product) });
        },
        update: (id: number | string, updates: any) => {
            if (updates instanceof FormData) return fetchAPI(`/products/${id}`, { method: 'PUT', body: updates });
            return fetchAPI(`/products/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
        },
        delete: (id: number | string) => fetchAPI(`/products/${id}`, { method: 'DELETE' }),
    },

    // Cart
    cart: {
        add: (productId: number | string, quantity: number = 1) =>
            fetchAPI('/cart', {
                method: 'POST',
                body: JSON.stringify({ productId, quantity })
            }),
        update: (productId: number | string, quantity: number) =>
            fetchAPI(`/cart/${productId}`, {
                method: 'PUT',
                body: JSON.stringify({ quantity })
            }),
        remove: (productId: number | string) =>
            fetchAPI(`/cart/${productId}`, {
                method: 'DELETE'
            }),
        get: () => fetchAPI('/cart'),
    },

    // AI Recommendations
    recommendations: {
        get: (userId: number | string) => fetchAPI(`/recommendations?userId=${userId}`),
    },
};

export function getImageUrl(path: string | undefined): string | undefined {
    if (!path) return undefined;
    const isAbsolute = path.startsWith('http') || path.startsWith('data:');
    if (isAbsolute) return path;

    // Remove /api suffix if present to get base URL
    // API_URL = http://localhost:4000 or http://localhost:4000/api
    // If API_URL has /api, strip it. If not, use as is.
    // If path starts with uploads/, we want {BASE_URL}/uploads/...

    let baseUrl = API_URL;
    if (baseUrl.endsWith('/api')) {
        baseUrl = baseUrl.slice(0, -4);
    }

    // Ensure no double slash
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
}
