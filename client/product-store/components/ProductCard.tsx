'use client';

import { Product } from '@/types';
import Link from 'next/link';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart();
    const [adding, setAdding] = useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        setAdding(true);
        try {
            await addToCart(product.id);
        } catch (err) {
            // Error handling (e.g. redirect if not logged in is handled in context)
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="glass-panel" style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer',
            height: '100%'
        }}>
            <div style={{
                height: '200px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: 'var(--text-muted)'
            }}>
                {/* Placeholder for image */}
                {product.name.charAt(0)}
            </div>

            <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {product.category}
                </p>
                <Link href={`/products/${product.id}`}>
                    <h3 style={{ fontSize: '1.2rem', margin: '5px 0', color: 'var(--text-main)' }} className="hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                </Link>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    ₹{product.price.toFixed(2)}
                </p>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                <button
                    className="btn btn-outline"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={handleAddToCart}
                    disabled={adding}
                >
                    {adding ? <Loader2 className="animate-spin" size={18} /> : <ShoppingCart size={18} />}
                    {adding ? 'Adding...' : 'Add'}
                </button>

                {useAuth().user?.role === 'admin' && (
                    <button
                        className="btn btn-outline"
                        style={{ flex: 1, justifyContent: 'center', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                        onClick={(e) => { e.preventDefault(); alert('Edit Product Feature (Admin Only)'); }}
                    >
                        Edit
                    </button>
                )}
            </div>
        </div>
    );
}
