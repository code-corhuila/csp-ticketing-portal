import { Routes } from '@angular/router';
import { NotificationsPageComponent } from '../notifications/notifications-page.component';
import { TicketComponent } from './ticket.component';

/** Exposed to the shell as './routes'. */
export const TICKETING_ROUTES: Routes = [
  { path: '', component: TicketComponent },
  { path: 'notifications', component: NotificationsPageComponent },
];
