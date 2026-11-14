/** Read model of an issued ticket, as the Ticketing API returns it (contract `Ticket`). */
export interface TicketConcession {
  name: string;
  quantity: number;
}

export interface Ticket {
  id: string;
  reservationId: string;
  showtimeId: string;
  movieTitle: string;
  roomName: string;
  /** ISO 8601 instant, UTC; null while the showtime has no confirmed start. */
  showtimeStartsAt: string | null;
  seatLabels: string[];
  concessions?: TicketConcession[] | null;
  qrPayload: string;
  /** Path of the PDF download, null until the PDF is rendered. */
  pdfUrl: string | null;
  deliveryStatus?: 'PENDING' | 'SENT' | 'FAILED';
  createdAt?: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Page<T> {
  data: T[];
  meta: PageMeta;
}
