import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TICKET_DATA } from './data/ticket.dataset';
import { QrCodeComponent } from './qr-code.component';
import { TicketComponent } from './ticket.component';

describe('TicketComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TicketComponent] }).compileComponents();
  });

  /** Renders twice: the signal resolves in an effect, a second CD pass paints it. */
  function render(): HTMLElement {
    const fixture = TestBed.createComponent(TicketComponent);
    fixture.detectChanges();
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  it('renders movie title, room, showtime, seat labels and reservation ID', () => {
    const el = render();

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
    fixture.detectChanges();

    expect(TICKET_DATA.seatLabels).toEqual(['A1', 'A2']);
    const seats = (fixture.nativeElement as HTMLElement).querySelectorAll('.seat');
    const labels: string[] = [];
    seats.forEach((s) => labels.push(s.textContent?.trim() ?? ''));
    expect(labels).toEqual(['A1', 'A2']);
  });

  it('binds the QR component input to the ticket qrPayload', () => {
    const fixture = TestBed.createComponent(TicketComponent);
    fixture.detectChanges();
    fixture.detectChanges();

    const qrNode = fixture.debugElement.query(By.directive(QrCodeComponent));
    expect(qrNode).toBeTruthy();
    expect((qrNode.componentInstance as QrCodeComponent).payload()).toBe(TICKET_DATA.qrPayload);
  });

  it('marks the ticket as synthetic until Cut 3 server-signs the payload', () => {
    const fixture = TestBed.createComponent(TicketComponent);
    fixture.detectChanges();
    fixture.detectChanges();

    const note: HTMLElement | null = fixture.nativeElement.querySelector('.synthetic-note');
    expect(note?.textContent).toContain('not valid for entry');
  });
});
