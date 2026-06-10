import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore';
import { getDisplayItems, useCartStore } from '../../cart/store/cartStore';
import { apiRequest } from '../../shared/api/client';
import { AddressMapPicker } from '../../shared/components/AddressMapPicker';
import { Spinner } from '../../shared/components/Spinner';
import type { Order, ShippingAddress } from '../../shared/types';
import { formatPrice, generateIdempotencyKey } from '../../shared/utils/format';

const SHIPPING = 5.99;

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const cartState = useCartStore();
  const { fetchCart, syncGuestToServer } = useCartStore();
  const items = getDisplayItems(cartState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [address, setAddress] = useState<ShippingAddress>({
    full_name: user?.full_name || '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'ES',
    phone: '',
    latitude: null,
    longitude: null,
  });

  const addressQuery = useMemo(
    () =>
      [address.street, address.postal_code, address.city, address.state, address.country]
        .filter(Boolean)
        .join(', '),
    [address.street, address.postal_code, address.city, address.state, address.country],
  );

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    void syncGuestToServer().then(() => fetchCart());
  }, [user, navigate, syncGuestToServer, fetchCart]);

  const subtotal = cartState.subtotal;
  const total = Math.round((subtotal + SHIPPING) * 100) / 100;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (address.latitude == null || address.longitude == null) {
      setError('Selecciona la ubicación exacta en el mapa antes de confirmar.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const order = await apiRequest<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          shipping_address: {
            ...address,
            latitude: address.latitude,
            longitude: address.longitude,
          },
          idempotency_key: generateIdempotencyKey(),
        }),
      });
      navigate(`/pedidos/${order.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear pedido');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  if (items.length === 0) {
    return (
      <div className="container">
        <p>Tu carrito está vacío.</p>
        <Link to="/catalogo" className="btn btn--primary">Ir al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="container checkout-page">
      <h1>Checkout</h1>
      <p className="checkout-steps" aria-label="Pasos del checkout">
        <span className="active">1. Envío</span>
        <span>→</span>
        <span>2. Confirmación</span>
      </p>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Dirección de envío</h2>
          {error && <p className="error-msg" role="alert">{error}</p>}

          <div className="form-grid">
            <div className="form-group form-group--full">
              <label htmlFor="full_name">Nombre completo</label>
              <input
                id="full_name"
                required
                value={address.full_name}
                onChange={(e) => setAddress({ ...address, full_name: e.target.value })}
              />
            </div>
            <div className="form-group form-group--full">
              <label htmlFor="street">Dirección</label>
              <input
                id="street"
                required
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="city">Ciudad</label>
              <input
                id="city"
                required
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">Provincia</label>
              <input
                id="state"
                required
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="postal_code">Código postal</label>
              <input
                id="postal_code"
                required
                value={address.postal_code}
                onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Teléfono</label>
              <input
                id="phone"
                type="tel"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
              />
            </div>
          </div>

          <AddressMapPicker
            latitude={address.latitude ?? null}
            longitude={address.longitude ?? null}
            addressQuery={addressQuery}
            onChange={({ latitude, longitude }) =>
              setAddress((prev) => ({ ...prev, latitude, longitude }))
            }
          />

          <button type="submit" className="btn btn--primary btn--lg" disabled={submitting}>
            {submitting ? 'Procesando...' : 'Confirmar pedido (pago simulado)'}
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Tu pedido</h2>
          <ul>
            {items.map((item) => (
              <li key={item.product_id}>
                <span>{item.artist} — {item.name} × {item.quantity}</span>
                <span>{formatPrice(item.line_total)}</span>
              </li>
            ))}
          </ul>
          <dl>
            <div><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
            <div><dt>Envío</dt><dd>{formatPrice(SHIPPING)}</dd></div>
            <div className="checkout-summary__total"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
          </dl>
        </aside>
      </div>

      {submitting && <Spinner label="Creando pedido..." />}
    </div>
  );
}
