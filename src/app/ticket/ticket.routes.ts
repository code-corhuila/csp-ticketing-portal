import { Routes } from '@angular/router';
import { MyTicketsComponent } from '../my-tickets/my-tickets.component';
import { NotificationsPageComponent } from '../notifications/notifications-page.component';

/** Exposed to the shell as './routes'. */
export const TICKETING_ROUTES: Routes = [
  { path: '', component: MyTicketsComponent },
  { path: 'notifications', component: NotificationsPageComponent },
];
