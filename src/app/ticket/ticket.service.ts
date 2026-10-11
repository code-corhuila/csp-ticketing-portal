import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TICKET_DATA, TicketData } from './data/ticket.dataset';

@Injectable({ providedIn: 'root' })
export class TicketService {
  /**
   * Cut 2: returns the burned-in synthetic dataset. Cut 3 keeps this signature;
   * it reads from the gateway through the shell's shared HTTP client (csp-front),
   * not a portal-local HttpClient call. The component then gains explicit
   * loading/error branches around the consumed signal.
   */
  getTicket(): Observable<TicketData> {
    return of(TICKET_DATA);
  }
}
