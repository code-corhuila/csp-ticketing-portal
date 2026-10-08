import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { QrCodeComponent } from './qr-code.component';
import { TicketService } from './ticket.service';

/**
 * Ticket screen. Styled after the ticket mockup (csp-docs/12-ux-ui/mockup/
 * index.html, HU-UI-002) with the design-system tokens (csp-docs/12-ux-ui/
 * design-system.md, HU-UI-001). The shell owns the tokens; this component
 * consumes them via var() where the design system defines them. Mockup-specific
 * values with no token (the card gradient) are documented as such.
 */
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