import { Page, Ticket } from '../model/ticket';

/** Synthetic examples shaped like the `TicketListResponse` of the contract (csp-docs 07-api). */
export const TICKET_WITH_PDF: Ticket = {
  id: '11111111-1111-4111-8111-111111111111',
  reservationId: '22222222-2222-4222-8222-222222222222',
  showtimeId: '33333333-3333-4333-8333-333333333333',
  movieTitle: 'The Silent Reel',
  roomName: 'Room 3',
  showtimeStartsAt: '2026-11-20T20:30:00Z',
  seatLabels: ['A1', 'A2'],
  concessions: [{ name: 'Popcorn (large)', quantity: 2 }],
  qrPayload: 'CSP-TICKET-1',
  pdfUrl: '/api/v1/ticketing/me/tickets/11111111-1111-4111-8111-111111111111/pdf',
  deliveryStatus: 'SENT',
  createdAt: '2026-11-01T15:00:00Z',
};

export const TICKET_WITHOUT_PDF_OR_TIME: Ticket = {
  ...TICKET_WITH_PDF,
  id: '44444444-4444-4444-8444-444444444444',
  movieTitle: 'Midnight Frames',
  showtimeStartsAt: null,
  seatLabels: ['B4'],
  concessions: null,
  qrPayload: 'CSP-TICKET-2',
  pdfUrl: null,
  deliveryStatus: 'PENDING',
};

export function pageOf(data: Ticket[], page = 1, totalPages = 1): Page<Ticket> {
  return { data, meta: { page, limit: 20, total: data.length, totalPages } };
}
