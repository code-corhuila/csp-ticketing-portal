import { NotificationsPageComponent } from '../notifications/notifications-page.component';
import { TICKETING_ROUTES } from './ticket.routes';

describe('TICKETING_ROUTES', () => {
  it('serves the notifications page at /dashboard/notifications', () => {
    const route = TICKETING_ROUTES.find((r) => r.path === 'notifications');

    expect(route?.component).toBe(NotificationsPageComponent);
  });
});
