'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { Loader2 } from 'lucide-react';

import { useSearchParams } from 'next/navigation';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const search = searchParams.get('search');

  useEffect(() => {
    fetchProducts(search || '');
  }, [search]);

  const fetchProducts = async (query: string) => {
    try {
      setLoading(true);
      const data = await api.products.getAll(query);
      setProducts(data.products || []);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
      </div>
    );
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ paddingBottom: '50px' }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '10px' }}>Quality Products for You</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
          Get the Best
        </p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '30px'
      }}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '50px' }}>
          No products found.
        </div>
      )}
    </div>
  );
}
