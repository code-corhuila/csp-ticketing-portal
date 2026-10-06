/**
 * Cut 2 synthetic dataset, burned into the portal as a constant.
 *
 * The seat labels mirror what the client selected in the booking step; this is
 * what keeps HU-FE-TICKETING-001 scenario 3 valid while the flow spans both
 * portals. Cut 3 must server-sign this payload — the plain format is
 * synthetic-only and has no authenticity check.
 */
export interface TicketData {
  reservationId: string;
  movieTitle: string;
  roomName: string;
  /** ISO 8601 instant, UTC. */
  showtimeStartsAt: string;
  seatLabels: string[];
  qrPayload: string;
}

export const TICKET_DATA: TicketData = {
  reservationId: '55555555-5555-5555-5555-555555555555',
  movieTitle: 'The Silent Reel',
  roomName: 'Room 1',
  showtimeStartsAt: '2026-10-02T20:00:00Z',
  seatLabels: ['A1', 'A2'],
  qrPayload: 'CSP-55555555-A1-A2',
};
