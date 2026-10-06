import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { QrCodeComponent } from './qr-code.component';
import { TicketService } from './ticket.service';

@Component({
  selector: 'app-ticket',
  imports: [QrCodeComponent],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.css',
})
export class TicketComponent {
  private readonly service = inject(TicketService);
  protected readonly ticket = toSignal(this.service.getTicket());
  protected readonly showtime = computed(() => {
    const t = this.ticket();
    return t
      ? new Intl.DateTimeFormat('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'UTC',
        }).format(new Date(t.showtimeStartsAt))
      : '';
  });
}
