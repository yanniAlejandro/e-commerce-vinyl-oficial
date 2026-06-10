export type OrderStatus =
  | 'pedido'
  | 'cargado'
  | 'entregado'
  | 'cancelado'
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface StatusHistoryEntry {
  status: OrderStatus;
  changed_at: string;
  note: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pedido: 'Pedido',
  cargado: 'Cargado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  pending: 'Pendiente',
  paid: 'Pagado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  'pedido',
  'cargado',
  'entregado',
  'cancelado',
];

export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function normalizeOrderStatus(status: OrderStatus): OrderStatus {
  const legacyMap: Partial<Record<OrderStatus, OrderStatus>> = {
    pending: 'pedido',
    paid: 'pedido',
    shipped: 'cargado',
    delivered: 'entregado',
    cancelled: 'cancelado',
  };
  return legacyMap[status] ?? status;
}
