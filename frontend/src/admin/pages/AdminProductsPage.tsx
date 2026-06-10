import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../shared/api/client';
import { Spinner } from '../../shared/components/Spinner';
import { CoverUpload } from '../components/CoverUpload';
import type { Category, Product, ProductCreatePayload, VinylFormat } from '../../shared/types';
import { formatPrice } from '../../shared/utils/format';

const FORMATS: VinylFormat[] = ['LP', 'EP', 'Single'];

const emptyForm: ProductCreatePayload = {
  name: '',
  slug: '',
  sku: '',
  artist: '',
  description: '',
  price: 0,
  stock: 0,
  genre: '',
  year: null,
  label: '',
  format: 'LP',
  image_url: '',
  category_id: '',
};

interface ProductFormProps {
  initial?: Product;
  categories: Category[];
  onSave: (payload: ProductCreatePayload & { is_active?: boolean }) => Promise<void>;
  onCancel: () => void;
}

function ProductForm({ initial, categories, onSave, onCancel }: ProductFormProps) {
  const [form, setForm] = useState<ProductCreatePayload>(() =>
    initial
      ? {
          name: initial.name,
          slug: initial.slug,
          sku: initial.sku,
          artist: initial.artist,
          description: initial.description,
          price: initial.price,
          stock: initial.stock,
          genre: initial.genre,
          year: initial.year,
          label: initial.label,
          format: initial.format,
          image_url: initial.image_url,
          category_id: initial.category_id,
        }
      : emptyForm,
  );
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave({ ...form, is_active: isActive });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h2>{initial ? 'Editar disco' : 'Nuevo disco'}</h2>
      {error && <p className="error-msg">{error}</p>}

      <div className="admin-form__grid">
        <div className="form-group">
          <label htmlFor="name">Nombre</label>
          <input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label htmlFor="artist">Artista</label>
          <input id="artist" required value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} />
        </div>
        <div className="form-group">
          <label htmlFor="slug">Slug</label>
          <input id="slug" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </div>
        <div className="form-group">
          <label htmlFor="sku">SKU</label>
          <input id="sku" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        </div>
        <div className="form-group">
          <label htmlFor="price">Precio</label>
          <input id="price" type="number" min={0.01} step={0.01} required value={form.price || ''} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        </div>
        <div className="form-group">
          <label htmlFor="stock">Stock</label>
          <input id="stock" type="number" min={0} required value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
        </div>
        <div className="form-group">
          <label htmlFor="genre">Género</label>
          <input id="genre" required value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} />
        </div>
        <div className="form-group">
          <label htmlFor="format">Formato</label>
          <select id="format" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value as VinylFormat })}>
            {FORMATS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="category">Categoría</label>
          <select id="category" required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            <option value="">Seleccionar</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="year">Año</label>
          <input id="year" type="number" value={form.year ?? ''} onChange={(e) => setForm({ ...form, year: e.target.value ? Number(e.target.value) : null })} />
        </div>
        <div className="form-group">
          <label htmlFor="label">Sello</label>
          <input id="label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        </div>
        <div className="form-group form-group--full">
          <CoverUpload
            value={form.image_url}
            onChange={(url) => setForm({ ...form, image_url: url })}
          />
        </div>
        <div className="form-group form-group--full">
          <label htmlFor="description">Descripción</label>
          <textarea id="description" rows={3} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        {initial && (
          <div className="form-group form-group--full">
            <label className="admin-checkbox">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Activo en tienda
            </label>
          </div>
        )}
      </div>

      <div className="admin-form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const [prods, cats] = await Promise.all([
      apiRequest<Product[]>('/admin/products'),
      apiRequest<Category[]>('/categories'),
    ]);
    setProducts(prods);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async (payload: ProductCreatePayload & { is_active?: boolean }) => {
    await apiRequest<Product>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setCreating(false);
    await load();
  };

  const handleUpdate = async (payload: ProductCreatePayload & { is_active?: boolean }) => {
    if (!editing) return;
    const { is_active, ...rest } = payload;
    await apiRequest<Product>(`/admin/products/${editing.id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...rest, is_active }),
    });
    setEditing(null);
    await load();
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Retirar "${product.name}" de la tienda?`)) return;
    await apiRequest<Product>(`/admin/products/${product.id}`, { method: 'DELETE' });
    await load();
  };

  if (loading) return <Spinner label="Cargando catálogo admin..." />;

  return (
    <div className="container admin-page">
      <header className="page-header admin-page__header">
        <div>
          <p className="label">Admin · qtb</p>
          <h1>Discos</h1>
        </div>
        {!creating && !editing && (
          <button type="button" className="btn btn--primary" onClick={() => setCreating(true)}>
            + Añadir disco
          </button>
        )}
      </header>

      {creating && (
        <ProductForm
          categories={categories}
          onSave={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}

      {editing && (
        <ProductForm
          initial={editing}
          categories={categories}
          onSave={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      )}

      {!creating && !editing && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Portada</th>
                <th>Disco</th>
                <th>Artista</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={!p.is_active ? 'admin-table__row--inactive' : ''}>
                  <td>
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="admin-table__thumb" />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.artist}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td>{p.stock}</td>
                  <td>{p.is_active ? 'Activo' : 'Retirado'}</td>
                  <td className="admin-table__actions">
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditing(p)}>Editar</button>
                    {p.is_active && (
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => void handleDelete(p)}>Retirar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
