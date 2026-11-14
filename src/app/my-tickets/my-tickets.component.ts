import { Component, computed, inject, signal } from '@angular/core';
import { ApiError, asApiError } from '../shell-contract';
import { QrCodeComponent } from '../ticket/qr-code.component';
import { FileSaver } from './data/file-saver';
import { TicketsApiService } from './data/tickets-api.service';
import { Ticket } from './model/ticket';

const PAGE_SIZE = 20;
const DATE_FORMAT = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });

/**
 * "My tickets" page (HU-FE-TICKETING-002): the tickets of the signed-in client from the Ticketing API.
 * There is no fallback to synthetic data: a failure shows the shell's userMessage and a retry action.
 */
@Component({
  selector: 'app-my-tickets',
  imports: [QrCodeComponent],
  templateUrl: './my-tickets.component.html',
  styleUrl: './my-tickets.component.css',
})
export class MyTicketsComponent {
  private readonly api = inject(TicketsApiService);
  private readonly saver = inject(FileSaver);

  protected readonly tickets = signal<Ticket[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<ApiError | null>(null);
  protected readonly pdfErrors = signal<Record<string, string>>({});
  private readonly page = signal(0);
  private readonly totalPages = signal(0);
  protected readonly hasMore = computed(() => this.page() < this.totalPages());

  constructor() {
    this.loadNext();
  }

  protected loadNext(): void {
    this.loading.set(true);
    this.error.set(null);
    const next = this.page() + 1;
    this.api.listMine(next, PAGE_SIZE).subscribe({
      next: (result) => {
        this.tickets.update((current) => [...current, ...result.data]);
        this.page.set(result.meta.page);
        this.totalPages.set(result.meta.totalPages);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(asApiError(err));
        this.loading.set(false);
      },
    });
  }

  protected showtime(ticket: Ticket): string {
    return ticket.showtimeStartsAt ? DATE_FORMAT.format(new Date(ticket.showtimeStartsAt)) : 'Hora por confirmar';
  }

  protected downloadPdf(ticket: Ticket): void {
    this.setPdfError(ticket.id, null);
    this.api.downloadPdf(ticket.id).subscribe({
      next: (blob) => this.saver.save(blob, `ticket-${ticket.id}.pdf`),
      error: (err: unknown) => this.setPdfError(ticket.id, asApiError(err).userMessage),
    });
  }

  private setPdfError(ticketId: string, message: string | null): void {
    this.pdfErrors.update(({ [ticketId]: _previous, ...rest }) => (message ? { ...rest, [ticketId]: message } : rest));
  }
}
