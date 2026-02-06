'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl } from '@/lib/api';
import Link from 'next/link';
import { Loader2, Trash2, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const { cart, loading, addToCart, updateQuantity, removeFromCart } = useCart();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="flex-center" style={{ minHeight: '50vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Loader2 className="animate-spin" size={40} color="var(--primary)" />
            </div>
        );
    }

    const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    return (
        <div style={{ paddingBottom: '50px' }}>
            <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>Your Cart</h1>

            {cart.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '20px' }}>Your cart is empty.</p>
                    <Link href="/" className="btn btn-primary">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                    {/* Cart Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {cart.map((item) => (
                            <div key={item.product.id} className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: 'var(--radius-sm)',
                                    overflow: 'hidden',
                                    backgroundColor: 'white'
                                }}>
                                    {item.product.images?.[0] ? (
                                        <img
                                            src={getImageUrl(item.product.images[0])}
                                            alt={item.product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '5px' }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>
                                            {item.product.name.charAt(0)}
                                        </span>
                                    )}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h3>{item.product.name}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.product.category}</p>
                                    <p style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{item.product.price.toFixed(2)}</p>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: 'var(--radius-sm)' }}>
                                        <button
                                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                            className="time-transition hover:text-primary"
                                            disabled={loading || item.quantity <= 1}
                                            style={{ padding: '5px' }}
                                        >
                                            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>-</span>
                                        </button>
                                        <span style={{ fontWeight: 600 }}>{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                            className="time-transition hover:text-primary"
                                            disabled={loading}
                                            style={{ padding: '5px' }}
                                        >
                                            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span>
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.product.id)}
                                        className="time-transition hover:text-red-500"
                                        title="Remove"
                                        disabled={loading}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="glass-panel" style={{ padding: '30px', height: 'fit-content' }}>
                        <h3 style={{ marginBottom: '20px' }}>Order Summary</h3>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                            <span style={{ fontWeight: 600 }}>₹{total.toFixed(2)}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '1.2rem', fontWeight: 700 }}>
                            <span>Total</span>
                            <span style={{ color: 'var(--primary)' }}>₹{total.toFixed(2)}</span>
                        </div>

                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => alert('Checkout Simulation Successful!')}>
                            Checkout <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
