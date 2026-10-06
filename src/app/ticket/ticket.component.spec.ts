import { TestBed } from '@angular/core/testing';
import { TICKET_DATA } from './data/ticket.dataset';
import { TicketComponent } from './ticket.component';

describe('TicketComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TicketComponent] }).compileComponents();
  });

  it('renders movie title, room, showtime, seat labels and reservation ID', () => {
    const fixture = TestBed.createComponent(TicketComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.textContent).toContain(TICKET_DATA.movieTitle);
    expect(el.textContent).toContain(TICKET_DATA.roomName);
    expect(el.textContent).toContain(TICKET_DATA.reservationId);
    expect(el.textContent).toContain('Oct 2, 2026');
    for (const seat of TICKET_DATA.seatLabels) {
      expect(el.textContent).toContain(seat);
    }
  });

  it('shows the seats selected during the booking step (A1, A2)', () => {
    const fixture = TestBed.createComponent(TicketComponent);
    fixture.detectChanges();

    expect(TICKET_DATA.seatLabels).toEqual(['A1', 'A2']);
    const seats = (fixture.nativeElement as HTMLElement).querySelectorAll('.seat');
    expect([...seats].map((s) => s.textContent?.trim())).toEqual(['A1', 'A2']);
  });

  it('renders the QR area encoded from qrPayload', () => {
    const fixture = TestBed.createComponent(TicketComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-qr-code svg rect')).toBeTruthy();
  });
});
