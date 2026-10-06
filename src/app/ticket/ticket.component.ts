import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { QrCodeComponent } from './qr-code.component';
import { TicketService } from './ticket.service';

@Component({
  selector: 'app-ticket',
  imports: [QrCodeComponent],
  template: `
    <section class="ticket">
      <header>
        <h1>{{ ticket().movieTitle }}</h1>
        <p class="reservation-id">Reservation {{ ticket().reservationId }}</p>
      </header>

      <dl>
        <div class="row">
          <dt>Room</dt>
          <dd>{{ ticket().roomName }}</dd>
        </div>
        <div class="row">
          <dt>Showtime</dt>
          <dd>{{ showtime() }}</dd>
        </div>
        <div class="row">
          <dt>Seats</dt>
          <dd>
            @for (seat of ticket().seatLabels; track seat) {
              <span class="seat">{{ seat }}</span>
            }
          </dd>
        </div>
      </dl>

      <app-qr-code [payload]="ticket().qrPayload" />
    </section>
  `,
  styles: `
    .ticket {
      max-width: 22rem;
      margin: 2rem auto;
      padding: 1.5rem;
      border: 1px solid #ddd;
      border-radius: 0.75rem;
      font-family: system-ui, sans-serif;
    }
    h1 {
      margin: 0;
      font-size: 1.5rem;
    }
    .reservation-id {
      color: #666;
      font-size: 0.85rem;
    }
    dl {
      margin: 1rem 0;
    }
    .row {
      display: flex;
      justify-content: space-between;
      padding: 0.35rem 0;
    }
    dt {
      color: #666;
    }
    .seat {
      display: inline-block;
      margin-left: 0.35rem;
      padding: 0.1rem 0.5rem;
      border-radius: 0.35rem;
      background: #eee;
      font-weight: 600;
    }
  `,
})
export class TicketComponent {
  private readonly service = inject(TicketService);
  protected readonly ticket = toSignal(this.service.getTicket(), { requireSync: true });
  protected readonly showtime = computed(() =>
    new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date(this.ticket().showtimeStartsAt)),
  );
}
