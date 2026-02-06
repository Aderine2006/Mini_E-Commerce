const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

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

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);

        // Handle 401 Unauthorized globally if needed (e.g., redirect to login)
        if (response.status === 401) {
            if (typeof window !== 'undefined') localStorage.removeItem('token');
            // window.location.href = '/login'; 
            // Better to handle this in UI or Context, but valid cleanup here.
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API Error');
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
        getAll: () => fetchAPI('/products'),
        getOne: (id: number | string) => fetchAPI(`/products/${id}`),
        // Admin only
        create: (product: any) =>
            fetchAPI('/products', { method: 'POST', body: JSON.stringify(product) }),
        update: (id: number | string, updates: any) =>
            fetchAPI(`/products/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
        delete: (id: number | string) =>
            fetchAPI(`/products/${id}`, { method: 'DELETE' }),
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
