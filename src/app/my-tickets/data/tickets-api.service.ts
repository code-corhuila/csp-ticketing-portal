import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Page, Ticket } from '../model/ticket';

/** Outbound adapter to the Ticketing API through the gateway, using the shell's shared HTTP client. */
@Injectable({ providedIn: 'root' })
export class TicketsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1/ticketing/me/tickets';

  listMine(page = 1, limit = 20): Observable<Page<Ticket>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<Page<Ticket>>(this.base, { params });
  }

  downloadPdf(ticketId: string): Observable<Blob> {
    return this.http.get(`${this.base}/${encodeURIComponent(ticketId)}/pdf`, { responseType: 'blob' });
  }
}
