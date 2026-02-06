'use client';

import React, { useEffect, useState } from 'react';
import { api, API_URL } from '@/lib/api';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  keywords: string[];
  images?: string[];
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<any>({ name: '', price: '', category: '', keywords: '', images: [] });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.products.getAll();
      setProducts(data.products || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => setForm({ name: '', price: '', category: '', keywords: '', images: [] });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length) {
      const fileArray = Array.from(files);
      // store File objects for FormData upload and also keep preview URLs
      const previews = fileArray.map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
      setForm(prev => ({ ...prev, images: fileArray, previews }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If images are File objects, submit as multipart/form-data so multer handles files
    try {
      if (form.images && form.images.length && form.images[0] instanceof File) {
        const fd = new FormData();
        fd.append('name', form.name);
        fd.append('price', String(Number(form.price)));
        fd.append('category', form.category);
        fd.append('keywords', JSON.stringify(form.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)));
        for (let i = 0; i < form.images.length; i += 1) {
          fd.append('images', form.images[i]);
        }

        if (editingId) {
          await api.products.update(editingId, fd);
        } else {
          await api.products.create(fd);
        }
      } else {
        const payload: any = {
          name: form.name,
          price: Number(form.price),
          category: form.category,
          keywords: form.keywords.split(',').map((k: string) => k.trim()).filter(Boolean),
          images: form.images
        };

        if (editingId) {
          await api.products.update(editingId, payload);
        } else {
          await api.products.create(payload);
        }
      }
      await fetchProducts();
      resetForm();
      setEditingId(null);
    } catch (err: any) {
      setError(err?.message || 'Save failed');
    }
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: String(p.price),
      category: p.category,
      keywords: p.keywords.join(', '),
      images: (p as any).images || []
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.products.delete(id);
      await fetchProducts();
    } catch (err: any) {
      setError(err?.message || 'Delete failed');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px', paddingBottom: '80px' }}>
      <h1 style={{ marginBottom: '40px', textAlign: 'center' }}>Admin Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', alignItems: 'start' }}>
        {/* Add/Edit Product Form */}
        <div className="glass-panel animate-fade-in" style={{ padding: '30px', position: 'sticky', top: '100px' }}>
          <h2 style={{ marginBottom: '25px', fontSize: '1.8rem', color: 'var(--primary)' }}>
            {editingId ? 'Edit Product' : 'Add New Product'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Product Name</label>
              <input
                placeholder="e.g. Wireless Headphones"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                style={{ padding: '14px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Price (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  style={{ padding: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Category</label>
                <input
                  placeholder="e.g. Electronics"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                  style={{ padding: '14px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Keywords</label>
              <input
                placeholder="comma, separated, tags"
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                style={{ padding: '14px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ padding: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', width: '100%' }}
              />
              {((form.previews && form.previews.length > 0) || (form.images && form.images.length > 0)) && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                  {(form.previews && form.previews.length > 0) ? (
                    form.previews.map((p: any, i: number) => (
                      <img key={i} src={p.preview} alt={`Preview ${i}`} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                    ))
                  ) : (
                    form.images.map((src: any, i: number) => (
                      <img key={i} src={src} alt={`Preview ${i}`} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                    ))
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '14px' }}>
                {editingId ? 'Save Changes' : 'Create Product'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); resetForm(); }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              )}
            </div>
            {error && <div style={{ color: '#ef4444', background: '#fee2e2', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>{error}</div>}
          </form>
        </div>

        {/* Product List */}
        <div className="glass-panel animate-fade-in" style={{ padding: '30px', animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ fontSize: '1.8rem' }}>Product Inventory</h2>
            <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '5px 12px', borderRadius: '20px', fontWeight: 600, fontSize: '0.9rem' }}>
              {products.length} Items
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading inventory...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                    <th style={{ textAlign: 'left', padding: '15px', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 600 }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '15px', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 600 }}>Price</th>
                    <th style={{ textAlign: 'left', padding: '15px', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 600 }}>Category</th>
                    <th style={{ textAlign: 'left', padding: '15px', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 600 }}>Image</th>
                    <th style={{ textAlign: 'right', padding: '15px', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="hover-row" style={{ transition: 'background 0.2s' }}>
                      <td style={{ padding: '15px', borderBottom: '1px solid var(--border-color)', fontWeight: 500 }}>{p.name}</td>
                      <td style={{ padding: '15px', borderBottom: '1px solid var(--border-color)', fontFamily: 'monospace', fontSize: '1rem' }}>₹{p.price}</td>
                      <td style={{ padding: '15px', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.8rem', padding: '4px 8px', background: '#f3f4f6', borderRadius: '4px', color: '#4b5563' }}>
                          {p.category}
                        </span>
                      </td>
                      <td style={{ padding: '15px', borderBottom: '1px solid var(--border-color)', width: 100 }}>
                        {((p as any).images && (p as any).images.length > 0) ? (
                          <img
                            src={((p as any).images[0].startsWith('http') || (p as any).images[0].startsWith('data:')) ? (p as any).images[0] : `${API_URL}${(p as any).images[0].startsWith('/') ? (p as any).images[0] : `/${(p as any).images[0]}`}`}
                            alt={p.name}
                            style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6 }}
                          />
                        ) : (
                          <div style={{ width: 80, height: 60, background: '#f3f3f3', borderRadius: 6 }} />
                        )}
                      </td>
                      <td style={{ padding: '15px', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleEdit(p)} className="btn btn-outline" style={{ height: '32px', padding: '0 15px', fontSize: '0.8rem' }}>Edit</button>
                          <button onClick={() => handleDelete(p.id)} className="btn btn-danger" style={{ height: '32px', padding: '0 15px', fontSize: '0.8rem' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
