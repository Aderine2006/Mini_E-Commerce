'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { Sparkles, Loader2 } from 'lucide-react';

export default function Recommendations() {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchRecommendations();
        }
    }, [user]);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            if (!user) return;
            const data = await api.recommendations.get(user.id);
            setProducts(data.products || []);
        } catch (err) {
            console.error('Failed to load recommendations', err);
        } finally {
            setLoading(false);
        }
    };

    if (!user || (!loading && products.length === 0)) {
        return null;
    }

    return (
        <section style={{ marginTop: '80px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Sparkles color="var(--accent)" />
                <h2 style={{ fontSize: '1.8rem' }}>Recommended for You</h2>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <Loader2 className="animate-spin" color="var(--primary)" />
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '20px'
                }}>
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </section>
    );
}
