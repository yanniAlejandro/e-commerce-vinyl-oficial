import type { Order } from '../types';
import { getOrderStatusLabel } from './orderStatus';
import { formatDate, formatPrice } from './format';

const DEFAULT_MANAGER_EMAIL = 'zummer.alternative@gmail.com';

interface DisputeMailParams {
  order: Order;
  customerName: string;
  customerEmail: string;
  message: string;
  managerEmail?: string;
  evidenceFileNames?: string[];
}

export function buildDisputeMailto({
  order,
  customerName,
  customerEmail,
  message,
  managerEmail = DEFAULT_MANAGER_EMAIL,
  evidenceFileNames = [],
}: DisputeMailParams): string {
  const orderRef = order.id.slice(-8).toUpperCase();
  const subject = `[qtb] Incidencia pedido #${orderRef}`;
  const evidenceLines =
    evidenceFileNames.length > 0
      ? [
          '',
          'Evidencia adjunta (añadir manualmente en el correo):',
          ...evidenceFileNames.map((name) => `- ${name}`),
        ]
      : [];

  const body = [
    'Hola,',
    '',
    'Reporto una incidencia con mi pedido:',
    '',
    `Referencia: #${orderRef}`,
    `ID completo: ${order.id}`,
    `Estado actual: ${getOrderStatusLabel(order.status)}`,
    `Cliente: ${customerName}`,
    `Email: ${customerEmail}`,
    `Total: ${formatPrice(order.total)}`,
    `Fecha: ${formatDate(order.created_at)}`,
    '',
    'Descripción del problema:',
    message,
    ...evidenceLines,
    '',
    'Gracias.',
  ].join('\n');

  return `mailto:${managerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
