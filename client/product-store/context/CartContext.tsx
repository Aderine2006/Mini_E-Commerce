'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';
import { CartItem } from '@/types';
import { useRouter } from 'next/navigation';

interface CartContextType {
    cart: CartItem[];
    cartCount: number;
    addToCart: (productId: number | string, quantity?: number) => Promise<void>;
    updateQuantity: (productId: number | string, quantity: number) => Promise<void>;
    removeFromCart: (productId: number | string) => Promise<void>;
    loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCart([]);
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const data = await api.cart.get();
            // API returns { items: [] }
            setCart(data.items || []);
        } catch (err) {
            console.error('Failed to fetch cart', err);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId: number | string, quantity: number = 1) => {
        if (!user) {
            router.push('/login');
            return;
        }

        try {
            await api.cart.add(productId, quantity);
            await fetchCart();
        } catch (err) {
            console.error('Failed to add to cart', err);
        }
    };

    const updateQuantity = async (productId: number | string, quantity: number) => {
        try {
            if (quantity < 1) return; // Prevent 0 or negative via update
            setLoading(true);
            await api.cart.update(productId, quantity);
            await fetchCart();
        } catch (err) {
            console.error('Failed to update cart', err);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (productId: number | string) => {
        try {
            setLoading(true);
            await api.cart.remove(productId);
            await fetchCart();
        } catch (err) {
            console.error('Failed to remove from cart', err);
        } finally {
            setLoading(false);
        }
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, cartCount, addToCart, updateQuantity, removeFromCart, loading }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
