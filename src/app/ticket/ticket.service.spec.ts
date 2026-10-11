import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { TICKET_DATA } from './data/ticket.dataset';
import { TicketService } from './ticket.service';

describe('TicketService', () => {
  let service: TicketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketService);
  });

  it('returns the synthetic ticket', async () => {
    const ticket = await firstValueFrom(service.getTicket());

    expect(ticket).toEqual(TICKET_DATA);
  });

  it('carries the booking-step selection in the seat labels', async () => {
    const ticket = await firstValueFrom(service.getTicket());

    expect(ticket.seatLabels).toEqual(['A1', 'A2']);
    expect(ticket.qrPayload).toBe('CSP-55555555-A1-A2');
  });
});
