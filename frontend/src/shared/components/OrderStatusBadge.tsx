import type { OrderStatus } from '../types';
import { getOrderStatusLabel, normalizeOrderStatus } from '../utils/orderStatus';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const normalized = normalizeOrderStatus(status);
  return (
    <span className={`order-status order-status--${normalized}`}>
      {getOrderStatusLabel(status)}
    </span>
  );
}
