import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TICKET_WITH_PDF, TICKET_WITHOUT_PDF_OR_TIME, pageOf } from '../testing/ticket.fixtures';
import { TicketsApiService } from './tickets-api.service';

describe('TicketsApiService', () => {
  let service: TicketsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(TicketsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests my tickets through the gateway with pagination', () => {
    let result: unknown;
    service.listMine(2, 50).subscribe((page) => (result = page));

    const request = http.expectOne((r) => r.url === '/api/v1/ticketing/me/tickets');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('limit')).toBe('50');
    const body = pageOf([TICKET_WITH_PDF, TICKET_WITHOUT_PDF_OR_TIME], 2, 3);
    request.flush(body);

    expect(result).toEqual(body);
  });

  it('keeps the nullable fields of the contract as they arrive', () => {
    let tickets: unknown[] = [];
    service.listMine().subscribe((page) => (tickets = page.data));

    http.expectOne((r) => r.url === '/api/v1/ticketing/me/tickets')
      .flush(pageOf([TICKET_WITHOUT_PDF_OR_TIME]));

    expect(tickets[0]).toMatchObject({ showtimeStartsAt: null, concessions: null, pdfUrl: null });
  });

  it('downloads the PDF of a ticket as a blob from the download path', () => {
    let blob: Blob | undefined;
    service.downloadPdf(TICKET_WITH_PDF.id).subscribe((b) => (blob = b));

    const request = http.expectOne(`/api/v1/ticketing/me/tickets/${TICKET_WITH_PDF.id}/pdf`);
    expect(request.request.method).toBe('GET');
    expect(request.request.responseType).toBe('blob');
    request.flush(new Blob(['%PDF-1.4'], { type: 'application/pdf' }));

    expect(blob?.type).toBe('application/pdf');
  });

  it('encodes the ticket id in the PDF path', () => {
    service.downloadPdf('a/b').subscribe();

    http.expectOne('/api/v1/ticketing/me/tickets/a%2Fb/pdf').flush(new Blob());
  });
});
