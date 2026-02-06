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
        delete headers['Content-Type'];
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
        get: () => fetchAPI('/cart'),
    },

    // AI Recommendations
    recommendations: {
        get: (userId: number | string) => fetchAPI(`/recommendations?userId=${userId}`),
    },
};
