import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationPage } from './notification';

/**
 * Typed call to the notifications endpoint of the ticketing domain. The injected HttpClient is the
 * SHELL's: its interceptor completes the '/api/v1/...' path, attaches the token and the correlation id,
 * applies the timeout and normalises every error.
 */
@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private readonly http = inject(HttpClient);

  /** One page of the caller's notifications, newest first (page starts at 1). */
  list(page: number, limit: number): Observable<NotificationPage> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<NotificationPage>('/api/v1/ticketing/me/notifications', { params });
  }
}
