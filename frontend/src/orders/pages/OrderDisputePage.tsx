import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore';
import { apiRequest } from '../../shared/api/client';
import { DisputeForm } from '../../shared/components/DisputeForm';
import { OrderStatusBadge } from '../../shared/components/OrderStatusBadge';
import { Spinner } from '../../shared/components/Spinner';
import type { Order } from '../../shared/types';
import { formatDate, formatPrice } from '../../shared/utils/format';

export function OrderDisputePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [managerEmail, setManagerEmail] = useState('zummer.alternative@gmail.com');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiRequest<Order>(`/orders/${id}`),
      apiRequest<{ manager_email: string }>('/orders/support/contact').catch(() => ({
        manager_email: 'zummer.alternative@gmail.com',
      })),
    ])
      .then(([orderData, contact]) => {
        setOrder(orderData);
        setManagerEmail(contact.manager_email);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Cargando..." />;
  if (error || !order || !user) {
    return (
      <div className="container">
        <p className="error-msg">{error || 'Pedido no encontrado'}</p>
        <Link to="/pedidos" className="btn btn--primary">Volver a pedidos</Link>
      </div>
    );
  }

  return (
    <div className="container dispute-page">
      <Link to={`/pedidos/${order.id}`} className="breadcrumb">← Volver al pedido</Link>

      <header className="dispute-page__header">
        <div>
          <p className="label">Pedido #{order.id.slice(-8).toUpperCase()}</p>
          <h1>Reportar incidencia</h1>
          <p className="dispute-page__intro">
            Describe el problema, adjunta evidencia y envía el correo al encargado de qtb.
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      <div className="dispute-page__layout">
        <aside className="dispute-page__summary">
          <h2>Pedido afectado</h2>
          <dl>
            <div><dt>Fecha</dt><dd>{formatDate(order.created_at)}</dd></div>
            <div><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
            <div><dt>Artículos</dt><dd>{order.items.length}</dd></div>
          </dl>
          <ul className="dispute-page__items">
            {order.items.map((item) => (
              <li key={item.product_id}>
                {item.artist} — {item.name} × {item.quantity}
              </li>
            ))}
          </ul>
          <p className="dispute-page__contact">
            Correo del encargado: <span>{managerEmail}</span>
          </p>
        </aside>

        <DisputeForm
          order={order}
          customerName={user.full_name}
          customerEmail={user.email}
          managerEmail={managerEmail}
        />
      </div>
    </div>
  );
}
