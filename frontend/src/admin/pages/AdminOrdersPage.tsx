import { useEffect, useState } from 'react';
import { apiRequest } from '../../shared/api/client';
import { DeliveryMap } from '../../shared/components/DeliveryMap';
import { OrderStatusBadge } from '../../shared/components/OrderStatusBadge';
import { Spinner } from '../../shared/components/Spinner';
import type { AdminOrder, OrderStatus } from '../../shared/types';
import { ACTIVE_ORDER_STATUSES, getOrderStatusLabel } from '../../shared/utils/orderStatus';
import { formatDate, formatPrice } from '../../shared/utils/format';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [couriers, setCouriers] = useState<Array<{ id: string; full_name: string; username: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | ''>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const params = filter ? `?status=${filter}` : '';
    const [data, courierList] = await Promise.all([
      apiRequest<AdminOrder[]>(`/admin/orders${params}`),
      apiRequest<Array<{ id: string; full_name: string; username: string | null }>>('/admin/couriers'),
    ]);
    setOrders(data);
    setCouriers(courierList);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [filter]);

  const assignCourier = async (orderId: string, courierId: string) => {
    if (!courierId) return;
    setAssigningId(orderId);
    try {
      const deadline = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      await apiRequest<AdminOrder>(`/admin/orders/${orderId}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ courier_id: courierId, delivery_deadline: deadline }),
      });
      await load();
    } finally {
      setAssigningId(null);
    }
  };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await apiRequest<AdminOrder>(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note: `Estado cambiado a ${getOrderStatusLabel(status)}` }),
      });
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Spinner label="Cargando pedidos..." />;

  return (
    <div className="container admin-page">
      <header className="page-header">
        <p className="label">Admin · qtb</p>
        <h1>Pedidos</h1>
        <p>{orders.length} pedidos{filter ? ` · filtro: ${getOrderStatusLabel(filter)}` : ''}</p>
      </header>

      <div className="admin-filters">
        <label htmlFor="status-filter" className="label">Filtrar por estado</label>
        <select id="status-filter" value={filter} onChange={(e) => setFilter(e.target.value as OrderStatus | '')}>
          <option value="">Todos</option>
          {ACTIVE_ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{getOrderStatusLabel(s)}</option>
          ))}
        </select>
      </div>

      <div className="admin-orders-list">
        {orders.length === 0 && <p className="admin-empty">No hay pedidos con ese filtro.</p>}
        {orders.map((order) => (
          <article key={order.id} className="admin-order-card">
            <div className="admin-order-card__header">
              <div>
                <p className="admin-order-card__ref">#{order.id.slice(-8).toUpperCase()}</p>
                <p className="admin-order-card__meta">
                  {formatDate(order.created_at)} · {order.customer_name} · {order.customer_email}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <p className="admin-order-card__items">
              {order.items.map((i) => `${i.artist} — ${i.name} ×${i.quantity}`).join(' · ')}
            </p>
            <p className="admin-order-card__total">{formatPrice(order.total)}</p>

            <address className="admin-order-card__address">
              {order.shipping_address.full_name}, {order.shipping_address.street},{' '}
              {order.shipping_address.postal_code} {order.shipping_address.city}
            </address>

            {order.shipping_address.latitude != null && order.shipping_address.longitude != null && (
              <DeliveryMap
                latitude={order.shipping_address.latitude}
                longitude={order.shipping_address.longitude}
                title="Ruta de entrega"
              />
            )}

            <div className="admin-order-card__status">
              <label htmlFor={`courier-${order.id}`} className="label">Asignar mensajero</label>
              <select
                id={`courier-${order.id}`}
                value={order.courier_id ?? ''}
                disabled={assigningId === order.id || couriers.length === 0}
                onChange={(e) => void assignCourier(order.id, e.target.value)}
              >
                <option value="">{order.courier_name ? order.courier_name : 'Sin asignar'}</option>
                {couriers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} {c.username ? `(@${c.username})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-order-card__status">
              <label htmlFor={`status-${order.id}`} className="label">Cambiar estado</label>
              <select
                id={`status-${order.id}`}
                value={order.status}
                disabled={updatingId === order.id}
                onChange={(e) => void updateStatus(order.id, e.target.value as OrderStatus)}
              >
                {ACTIVE_ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{getOrderStatusLabel(s)}</option>
                ))}
              </select>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
