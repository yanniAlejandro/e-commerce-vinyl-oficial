import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore';
import { apiRequest } from '../../shared/api/client';
import { EmptyState } from '../../shared/components/EmptyState';
import { OrderStatusBadge } from '../../shared/components/OrderStatusBadge';
import { Spinner } from '../../shared/components/Spinner';
import type { Order } from '../../shared/types';
import { formatDate, formatPrice } from '../../shared/utils/format';

export function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiRequest<Order[]>('/orders')
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Spinner label="Cargando pedidos..." />;

  if (orders.length === 0) {
    return (
      <div className="container">
        <EmptyState
          title="Aún no tienes pedidos"
          description="Cuando compres tu primer vinilo, aparecerá aquí."
          action={<Link to="/catalogo" className="btn btn--primary">Explorar catálogo</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container orders-page">
      <header className="page-header">
        <p className="label">qtb</p>
        <h1>Mis pedidos</h1>
      </header>
      <ul className="orders-list">
        {orders.map((order) => (
          <li key={order.id} className="order-card">
            <div className="order-card__header">
              <div>
                <p className="order-card__id">Pedido #{order.id.slice(-8).toUpperCase()}</p>
                <p className="order-card__date">{formatDate(order.created_at)}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="order-card__meta">
              {order.items.length} artículo(s) · {formatPrice(order.total)}
            </p>
            <div className="order-card__actions">
              <Link to={`/pedidos/${order.id}`} className="btn btn--ghost btn--sm">
                Ver detalle
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
