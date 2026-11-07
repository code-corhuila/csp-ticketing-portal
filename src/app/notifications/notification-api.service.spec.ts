import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NotificationApiService } from './notification-api.service';
import { NotificationPage } from './notification';

/** Response shaped like NotificationListResponse in ticketing-fulfillment-service.yaml. */
const CONTRACT_RESPONSE: NotificationPage = {
  data: [
    {
      id: '3f1c7a2e-5b9d-4c1e-8a47-0d6b2e9f1a10',
      type: 'TICKET_ISSUED',
      message: 'Your ticket is ready.',
      timestamp: '2026-11-07T15:30:00Z',
      metadata: { reservationId: '7c9e6679-7425-40de-944b-e07fc1f90ae7' },
    },
    {
      id: '9b2d4e6f-1a3c-4b5d-9e7f-2c4a6b8d0e12',
      type: 'HOLD_EXPIRY_WARNING',
      message: 'Your seats expire soon.',
      timestamp: '2026-11-07T15:20:00Z',
    },
  ],
  meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
};

describe('NotificationApiService', () => {
  let service: NotificationApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(NotificationApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the page and limit from the notifications endpoint of the gateway', () => {
    service.list(2, 10).subscribe();

    const request = http.expectOne(
      (r) =>
        r.url === '/api/v1/ticketing/me/notifications' &&
        r.params.get('page') === '2' &&
        r.params.get('limit') === '10',
    );
    expect(request.request.method).toBe('GET');
    request.flush(CONTRACT_RESPONSE);
  });

  it('returns the data and meta of the contract response untouched', () => {
    let page: NotificationPage | undefined;
    service.list(1, 20).subscribe((p) => (page = p));

    http.expectOne((r) => r.url === '/api/v1/ticketing/me/notifications').flush(CONTRACT_RESPONSE);

    expect(page).toEqual(CONTRACT_RESPONSE);
  });

  it('propagates a failed request to the subscriber', () => {
    let failed = false;
    service.list(1, 20).subscribe({ error: () => (failed = true) });

    http
      .expectOne((r) => r.url === '/api/v1/ticketing/me/notifications')
      .flush({}, { status: 500, statusText: 'Server Error' });

    expect(failed).toBe(true);
  });
});
