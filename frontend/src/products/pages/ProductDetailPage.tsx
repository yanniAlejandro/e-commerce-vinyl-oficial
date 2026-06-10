import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCartStore } from '../../cart/store/cartStore';
import { apiRequest } from '../../shared/api/client';
import { Spinner } from '../../shared/components/Spinner';
import type { Product } from '../../shared/types';
import { formatPrice } from '../../shared/utils/format';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiRequest<Product>(`/products/${slug}`)
      .then(setProduct)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAdd = async () => {
    if (!product) return;
    setAdding(true);
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
      alert(err instanceof Error ? err.message : 'Error al añadir');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <Spinner label="Cargando disco..." />;
  if (error || !product) {
    return (
      <div className="container">
        <p className="error-msg">{error || 'Producto no encontrado'}</p>
        <Link to="/catalogo" className="btn btn--primary">Volver al catálogo</Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;

  return (
    <div className="container product-detail">
      <nav className="breadcrumb" aria-label="Miga de pan">
        <Link to="/catalogo">Catálogo</Link>
        <span aria-hidden="true"> / </span>
        <span>{product.name}</span>
      </nav>

      <div className="product-detail__grid">
        <div className="product-detail__image">
          <img
            src={product.image_url || '/qtb-mark.svg'}
            alt={`Portada de ${product.name}`}
          />
          <span className="product-detail__format">{product.format}</span>
        </div>

        <div className="product-detail__info">
          <p className="product-detail__artist">{product.artist}</p>
          <h1>{product.name}</h1>
          <p className="product-detail__price">{formatPrice(product.price)}</p>

          <dl className="product-detail__specs">
            <div><dt>Género</dt><dd>{product.genre}</dd></div>
            {product.year && <div><dt>Año</dt><dd>{product.year}</dd></div>}
            {product.label && <div><dt>Sello</dt><dd>{product.label}</dd></div>}
            <div><dt>Formato</dt><dd>{product.format}</dd></div>
            <div><dt>Stock</dt><dd>{outOfStock ? 'Agotado' : `${product.stock} unidades`}</dd></div>
            <div><dt>SKU</dt><dd>{product.sku}</dd></div>
          </dl>

          <p className="product-detail__description">{product.description}</p>

          {!outOfStock && (
            <div className="product-detail__actions">
              <label htmlFor="qty">Cantidad</label>
              <input
                id="qty"
                type="number"
                min={1}
                max={product.stock}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
              <button
                type="button"
                className="btn btn--primary btn--lg"
                disabled={adding}
                onClick={handleAdd}
              >
                {adding ? 'Añadiendo...' : 'Añadir al carrito'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
