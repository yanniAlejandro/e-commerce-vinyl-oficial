import type { StatusHistoryEntry } from '../types';
import { getOrderStatusLabel, normalizeOrderStatus } from '../utils/orderStatus';
import { formatDate } from '../utils/format';

interface OrderStatusTimelineProps {
  history: StatusHistoryEntry[];
  currentStatus: StatusHistoryEntry['status'];
}

const FLOW: Array<StatusHistoryEntry['status']> = ['pedido', 'recogida', 'cargado', 'entregado'];

export function OrderStatusTimeline({ history, currentStatus }: OrderStatusTimelineProps) {
  const normalized = normalizeOrderStatus(currentStatus);
  const isCancelled = normalized === 'cancelado';

  if (isCancelled) {
    return (
      <div className="status-timeline status-timeline--cancelled">
        <p className="label">Estado del envío</p>
        <p className="status-timeline__cancelled-msg">Pedido cancelado</p>
      </div>
    );
  }

  const currentIndex = FLOW.indexOf(normalized);

  return (
    <div className="status-timeline">
      <p className="label">Estado del envío</p>
      <ol className="status-timeline__steps">
        {FLOW.map((step, index) => {
          const done = index <= currentIndex;
          const entry = history.find((h) => normalizeOrderStatus(h.status) === step);
          return (
            <li
              key={step}
              className={`status-timeline__step ${done ? 'status-timeline__step--done' : ''} ${index === currentIndex ? 'status-timeline__step--current' : ''}`}
            >
              <span className="status-timeline__dot" aria-hidden="true" />
              <div>
                <strong>{getOrderStatusLabel(step)}</strong>
                {entry && done && (
                  <span className="status-timeline__date">{formatDate(entry.changed_at)}</span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
