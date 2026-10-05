import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TICKET_ROUTES } from './ticket/ticket.routes';

/**
 * Standalone runs only. Deliberately NO provideHttpClient(): inside the shell the
 * portal uses the shell's client. To exercise the portal alone, run it through
 * the shell rather than giving it a client of its own.
 */
export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), provideRouter(TICKET_ROUTES)],
};
