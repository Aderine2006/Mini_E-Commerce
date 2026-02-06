'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, User, LogOut } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();

    return (
        <nav style={{
            height: 'var(--header-height)',
            borderBottom: '1px solid var(--border-color)',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            marginBottom: '40px'
        }}>
            <div className="container" style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Product Store
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Link href="/cart" className="time-transition hover:text-primary" style={{ position: 'relative' }}>
                        <ShoppingCart />
                        {cartCount > 0 && (
                            <span style={{ position: 'absolute', top: -8, right: -8, background: 'var(--accent)', color: 'white', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.email}</span>
                            <button onClick={logout} className="btn-outline" style={{ border: 'none', padding: '5px' }} title="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Link href="/login" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Login</Link>
                            <Link href="/register" className="btn btn-primary" style={{ height: '36px', padding: '0 16px', fontSize: '0.8rem' }}>
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
