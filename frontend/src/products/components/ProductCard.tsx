import { Link } from 'react-router-dom';
import type { Product } from '../../shared/types';
import { formatPrice } from '../../shared/utils/format';

interface ProductCardProps {
  product: Product;
  onAddToCart: (id: string, qty: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const outOfStock = product.stock <= 0;

  return (
    <article className="product-card">
      <Link to={`/producto/${product.slug}`} className="product-card__media">
        <img
          src={product.image_url || '/qtb-mark.svg'}
          alt={`${product.artist} — ${product.name}`}
          loading="lazy"
        />
        <div className="product-card__overlay">
          <span>Ver</span>
        </div>
        <span className="product-card__format label">{product.format}</span>
      </Link>

      <div className="product-card__body">
        <p className="product-card__artist label">{product.artist}</p>
        <h3 className="product-card__title">
          <Link to={`/producto/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="product-card__row">
          <span className="product-card__price">{formatPrice(product.price)}</span>
          <button
            type="button"
            className="product-card__add"
            disabled={outOfStock}
            onClick={() => onAddToCart(product.id, 1)}
            aria-label={`Añadir ${product.name} al carrito`}
          >
            {outOfStock ? 'Agotado' : 'Añadir +'}
          </button>
        </div>
      </div>
    </article>
  );
}
