import { Routes } from '@angular/router';
import { Component } from '@angular/core';

/** Placeholder until the ticket page lands in the next pull request. */
@Component({
  selector: 'app-ticket-placeholder',
  template: '<p>Ticket portal</p>',
})
export class TicketPlaceholderComponent {}

/** Exposed to the shell as './routes'. */
export const TICKETING_ROUTES: Routes = [{ path: '', component: TicketPlaceholderComponent }];
