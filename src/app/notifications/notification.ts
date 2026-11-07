/** Read model of GET /api/v1/ticketing/me/notifications (ticketing-fulfillment-service.yaml, Notification). */
export type NotificationType =
  | 'BOOKING_CONFIRMED'
  | 'TICKET_ISSUED'
  | 'RESERVATION_EXPIRED'
  | 'HOLD_EXPIRY_WARNING';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  /** RFC 3339 instant. */
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationPage {
  data: Notification[];
  meta: PageMeta;
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  BOOKING_CONFIRMED: 'Reserva confirmada',
  TICKET_ISSUED: 'Boleta emitida',
  RESERVATION_EXPIRED: 'Reserva vencida',
  HOLD_EXPIRY_WARNING: 'Aviso de vencimiento',
};
