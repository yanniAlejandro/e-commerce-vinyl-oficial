import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDisplayItems, useCartStore } from '../store/cartStore';
import { EmptyState } from '../../shared/components/EmptyState';
import { Spinner } from '../../shared/components/Spinner';
import { formatPrice } from '../../shared/utils/format';
import { useAuthStore } from '../../auth/store/authStore';

const SHIPPING = 5.99;

export function CartPage() {
  const { user } = useAuthStore();
  const cartState = useCartStore();
  const { fetchCart, updateQuantity, removeItem, isLoading } = cartState;
  const items = getDisplayItems(cartState);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart, user]);

  const subtotal = cartState.subtotal;
  const total = Math.round((subtotal + (items.length > 0 ? SHIPPING : 0)) * 100) / 100;

  if (isLoading && items.length === 0) {
    return <Spinner label="Cargando carrito..." />;
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <EmptyState
          title="Tu carrito está vacío"
          description="Explora el catálogo y encuentra tu próximo vinilo."
          action={<Link to="/catalogo" className="btn btn--primary">Ir al catálogo</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1>Tu carrito</h1>

      <div className="cart-layout">
        <ul className="cart-items" aria-label="Artículos del carrito">
          {items.map((item) => (
            <li key={item.product_id} className="cart-item">
              <img src={item.image_url || '/qtb-mark.svg'} alt="" />
              <div className="cart-item__info">
                <p className="cart-item__artist">{item.artist}</p>
                <h2>{item.name}</h2>
                <p className="cart-item__price">{formatPrice(item.price)}</p>
              </div>
              <div className="cart-item__qty">
                <label htmlFor={`qty-${item.product_id}`} className="sr-only">Cantidad</label>
                <input
                  id={`qty-${item.product_id}`}
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => void updateQuantity(item.product_id, Number(e.target.value))}
                />
              </div>
              <p className="cart-item__total">{formatPrice(item.line_total)}</p>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => void removeItem(item.product_id)}
                aria-label={`Eliminar ${item.name}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <aside className="cart-summary">
          <h2>Resumen</h2>
          <dl>
            <div><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
            <div><dt>Envío</dt><dd>{formatPrice(SHIPPING)}</dd></div>
            <div className="cart-summary__total"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
          </dl>

          {user ? (
            <Link to="/checkout" className="btn btn--primary btn--lg btn--block">
              Finalizar compra
            </Link>
          ) : (
            <div className="cart-summary__auth">
              <p>Inicia sesión para completar tu pedido.</p>
              <Link to="/login" className="btn btn--primary btn--block">Iniciar sesión</Link>
            </div>
          )}

          <Link to="/catalogo" className="btn btn--ghost btn--block">
            Seguir comprando
          </Link>
        </aside>
      </div>
    </div>
  );
}
