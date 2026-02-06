'use client';

import { useEffect, useState, use } from 'react';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { Loader2, ArrowLeft, ShoppingCart, Share2, Heart } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Recommendations from '@/components/Recommendations';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id } = use(params);

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            fetchProduct(id);
        }
    }, [id]);

    const { addToCart } = useCart();
    const [adding, setAdding] = useState(false);

    const handleAddToCart = async () => {
        if (!product) return;
        setAdding(true);
        try {
            await addToCart(product.id, 1);
        } catch (err) {
            // Error handled in context
        } finally {
            setAdding(false);
        }
    };

    const fetchProduct = async (productId: string) => {
        try {
            const data = await api.products.getOne(productId);
            setProduct(data.product);
        } catch (err) {
            setError('Failed to load product');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '50vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Loader2 className="animate-spin" size={40} color="var(--primary)" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <p style={{ color: 'red', marginBottom: '20px' }}>{error || 'Product not found'}</p>
                <Link href="/" className="btn btn-outline">
                    <ArrowLeft size={16} /> Back to Store
                </Link>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '80px' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '20px', color: 'var(--text-muted)' }}>
                <ArrowLeft size={16} /> Back
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
                {/* Left: Image Placeholder */}
                <div className="glass-panel" style={{
                    height: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '5rem',
                    color: 'var(--text-muted)',
                    background: product.images?.[0] ? 'white' : 'rgba(255,255,255,0.2)',
                    overflow: 'hidden'
                }}>
                    {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                        product.name.charAt(0)
                    )}
                </div>

                {/* Right: Details */}
                <div>
                    <span style={{ color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>
                        {product.category}
                    </span>
                    <h1 style={{ margin: '10px 0', fontSize: '2.5rem' }}>{product.name}</h1>
                    <p style={{ fontSize: '2rem', fontWeight: 700, margin: '20px 0', color: 'var(--primary)' }}>
                        ${product.price.toFixed(2)}
                    </p>

                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '30px' }}>
                        Experience the future with the {product.name}. Designed for performance and built with premium materials.
                        Perfect for your daily needs.
                    </p>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button
                            className="btn btn-primary"
                            style={{ flex: 1, height: '50px', fontSize: '1rem' }}
                            onClick={handleAddToCart}
                            disabled={adding}
                        >
                            {adding ? <Loader2 className="animate-spin" /> : <ShoppingCart size={20} />}
                            {adding ? 'Adding...' : 'Add to Cart'}
                        </button>
                        <button className="btn btn-outline" style={{ width: '50px', padding: 0 }}>
                            <Heart size={20} />
                        </button>
                    </div>

                    <div style={{ marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Keywords: {product.keywords.join(', ')}
                        </p>
                    </div>
                </div>
            </div>

            <Recommendations />
        </div>
    );
}
