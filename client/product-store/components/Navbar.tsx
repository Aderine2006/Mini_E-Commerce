'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, User, LogOut, Search } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    };

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
                <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginRight: '20px' }}>
                    Product Store
                </Link>

                {/* Search Bar */}
                <div style={{ flex: 1, maxWidth: '600px', display: 'flex', borderRadius: '4px', overflow: 'hidden' }}>
                    <select style={{
                        padding: '0 10px',
                        background: '#f3f3f3',
                        border: '1px solid #ccc',
                        borderRight: 'none',
                        borderTopLeftRadius: '4px',
                        borderBottomLeftRadius: '4px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        outline: 'none',
                        color: '#555'
                    }}>
                        <option>All</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search Product Store"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: '1px solid #ccc',
                            outline: 'none',
                            fontSize: '0.9rem'
                        }}
                    />
                    <button
                        onClick={handleSearch}
                        style={{
                            background: 'var(--primary)',
                            border: 'none',
                            padding: '0 15px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}
                    >
                        <Search size={20} />
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: '20px' }}>
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
                            {user.role === 'admin' ? (
                                <span style={{
                                    background: 'var(--primary)',
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase'
                                }}>
                                    ADMIN
                                </span>
                            ) : (
                                <span style={{
                                    background: 'var(--accent)',
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase'
                                }}>
                                    USER
                                </span>
                            )}
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.email}</span>
                            <button onClick={logout} className="btn-outline" style={{ border: 'none', padding: '5px' }} title="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                            <Link href="/login" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Login</Link>
                            <Link href="/register" className="btn btn-primary" style={{ height: '36px', padding: '0 20px', fontSize: '0.9rem' }}>
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
