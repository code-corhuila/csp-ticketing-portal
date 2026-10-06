import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TICKET_DATA, TicketData } from './data/ticket.dataset';

@Injectable({ providedIn: 'root' })
export class TicketService {
  /** Cut 2: burned-in dataset. Cut 3: same signature, HTTP via the shell's client. */
  getTicket(): Observable<TicketData> {
    return of(TICKET_DATA);
  }
}
