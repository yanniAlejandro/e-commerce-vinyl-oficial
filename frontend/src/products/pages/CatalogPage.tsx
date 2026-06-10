import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCartStore } from '../../cart/store/cartStore';
import { ProductCard } from '../components/ProductCard';
import { ProductFilters } from '../components/ProductFilters';
import { apiRequest } from '../../shared/api/client';
import { EmptyState } from '../../shared/components/EmptyState';
import { Spinner } from '../../shared/components/Spinner';
import type { Category, ProductListResponse } from '../../shared/types';

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const addItem = useCartStore((s) => s.addItem);

  const search = searchParams.get('search') || '';
  const genre = searchParams.get('genre') || '';
  const category = searchParams.get('category') || '';
  const page = Number(searchParams.get('page') || '1');

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), page_size: '12' });
      if (search) params.set('search', search);
      if (genre) params.set('genre', genre);
      if (category) params.set('category', category);

      const result = await apiRequest<ProductListResponse>(`/products?${params}`);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [search, genre, category, page]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    void Promise.all([
      apiRequest<Category[]>('/categories'),
      apiRequest<string[]>('/products/genres'),
    ]).then(([cats, genreList]) => {
      setCategories(cats);
      setGenres(genreList);
    });
  }, []);

  const handleAddToCart = async (id: string, qty: number) => {
    const product = data?.items.find((p) => p.id === id);
    if (!product) return;
    try {
      await addItem({
        product_id: product.id,
        name: product.name,
        artist: product.artist,
        price: product.price,
        image_url: product.image_url,
        quantity: qty,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo añadir al carrito');
    }
  };

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0;

  return (
    <div className="container catalog-page">
      <header className="page-header">
        <p className="label">qtb shop</p>
        <h1>Catálogo</h1>
        <p>{data ? `${data.total} títulos` : 'Cargando...'}</p>
      </header>

      <div className="catalog-layout">
        <ProductFilters
          search={search}
          genre={genre}
          category={category}
          genres={genres}
          categories={categories}
          onSearchChange={(v) => updateParam('search', v)}
          onGenreChange={(v) => updateParam('genre', v)}
          onCategoryChange={(v) => updateParam('category', v)}
        />

        <div className="catalog-content">
          {loading && <Spinner label="Cargando discos..." />}
          {error && <p className="error-msg" role="alert">{error}</p>}

          {!loading && data && data.items.length === 0 && (
            <EmptyState
              title="No hay discos con esos filtros"
              description="Prueba con otros términos de búsqueda o categorías."
            />
          )}

          {!loading && data && data.items.length > 0 && (
            <>
              <div className="product-grid">
                {data.items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="pagination" aria-label="Paginación">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    disabled={page <= 1}
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.set('page', String(page - 1));
                      setSearchParams(next);
                    }}
                  >
                    Anterior
                  </button>
                  <span>Página {page} de {totalPages}</span>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    disabled={page >= totalPages}
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.set('page', String(page + 1));
                      setSearchParams(next);
                    }}
                  >
                    Siguiente
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
