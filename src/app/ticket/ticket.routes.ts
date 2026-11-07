import { Routes } from '@angular/router';
import { MyTicketsComponent } from '../my-tickets/my-tickets.component';

/** Exposed to the shell as './routes'. */
export const TICKETING_ROUTES: Routes = [{ path: '', component: MyTicketsComponent }];
