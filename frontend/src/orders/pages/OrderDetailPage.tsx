import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore';
import { apiRequest } from '../../shared/api/client';
import { DeliveryMap } from '../../shared/components/DeliveryMap';
import { OrderStatusBadge } from '../../shared/components/OrderStatusBadge';
import { OrderStatusTimeline } from '../../shared/components/OrderStatusTimeline';
import { Spinner } from '../../shared/components/Spinner';
import type { Order } from '../../shared/types';
import { formatDate, formatPrice } from '../../shared/utils/format';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    apiRequest<Order>(`/orders/${id}`)
      .then(setOrder)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Cargando pedido..." />;
  if (error || !order || !user) {
    return (
      <div className="container">
        <p className="error-msg">{error || 'Pedido no encontrado'}</p>
        <Link to="/pedidos" className="btn btn--primary">Volver a pedidos</Link>
      </div>
    );
  }

  const history = order.status_history?.length
    ? order.status_history
    : [{ status: order.status, changed_at: order.created_at, note: '' }];

  return (
    <div className="container order-detail">
      <Link to="/pedidos" className="breadcrumb">← Mis pedidos</Link>

      <header className="order-detail__header">
        <div>
          <p className="label">Pedido #{order.id.slice(-8).toUpperCase()}</p>
          <h1>Detalle del pedido</h1>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      <OrderStatusTimeline history={history} currentStatus={order.status} />

      <div className="order-detail__grid">
        <section>
          <h2>Artículos</h2>
          <ul className="order-items">
            {order.items.map((item) => (
              <li key={item.product_id} className="order-item">
                <img src={item.image_url || '/qtb-mark.svg'} alt="" />
                <div className="order-item__info">
                  <p className="order-item__artist">{item.artist}</p>
                  <p>{item.name} × {item.quantity}</p>
                </div>
                <span className="order-item__price">{formatPrice(item.line_total)}</span>
              </li>
            ))}
          </ul>
        </section>

        <aside className="order-detail__summary">
          <h2>Resumen</h2>
          <dl>
            <div><dt>Fecha</dt><dd>{formatDate(order.created_at)}</dd></div>
            <div><dt>Actualizado</dt><dd>{formatDate(order.updated_at || order.created_at)}</dd></div>
            <div><dt>Referencia pago</dt><dd>{order.payment_reference}</dd></div>
            <div><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            <div><dt>Envío</dt><dd>{formatPrice(order.shipping)}</dd></div>
            <div><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
          </dl>

          <h3>Envío a</h3>
          <address>
            {order.shipping_address.full_name}<br />
            {order.shipping_address.street}<br />
            {order.shipping_address.postal_code} {order.shipping_address.city}<br />
            {order.shipping_address.state}, {order.shipping_address.country}
          </address>

          {order.shipping_address.latitude != null && order.shipping_address.longitude != null && (
            <DeliveryMap
              latitude={order.shipping_address.latitude}
              longitude={order.shipping_address.longitude}
              showRouteLinks={false}
            />
          )}
        </aside>
      </div>

      <section className="order-detail__support">
        <div>
          <h2>¿Algún problema?</h2>
          <p>Si necesitas reportar una incidencia con este pedido, envía evidencia y correo desde la vista dedicada.</p>
        </div>
        <Link to={`/pedidos/${order.id}/incidencia`} className="btn btn--outline">
          Reportar incidencia
        </Link>
      </section>
    </div>
  );
}
