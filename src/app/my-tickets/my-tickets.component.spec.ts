import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject, of, throwError } from 'rxjs';
import { QrCodeComponent } from '../ticket/qr-code.component';
import { ApiError } from '../shell-contract';
import { FileSaver } from './data/file-saver';
import { TicketsApiService } from './data/tickets-api.service';
import { Page, Ticket } from './model/ticket';
import { MyTicketsComponent } from './my-tickets.component';
import { TICKET_WITHOUT_PDF_OR_TIME, TICKET_WITH_PDF, pageOf } from './testing/ticket.fixtures';

const shellError: ApiError = {
  status: 503,
  code: 'HTTP_503',
  message: 'Service Unavailable',
  details: [],
  traceId: 'trace-1',
  userMessage: 'El servicio no está disponible. Intenta de nuevo. (referencia trace-1)',
};

describe('MyTicketsComponent', () => {
  let api: { listMine: ReturnType<typeof vi.fn>; downloadPdf: ReturnType<typeof vi.fn> };
  let saver: { save: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = { listMine: vi.fn(), downloadPdf: vi.fn() };
    saver = { save: vi.fn() };
    TestBed.configureTestingModule({
      imports: [MyTicketsComponent],
      providers: [
        { provide: TicketsApiService, useValue: api },
        { provide: FileSaver, useValue: saver },
      ],
    });
  });

  function render(): { el: HTMLElement; detect: () => void } {
    const fixture = TestBed.createComponent(MyTicketsComponent);
    fixture.detectChanges();
    return { el: fixture.nativeElement, detect: () => fixture.detectChanges() };
  }

  function click(el: HTMLElement, selector: string, index = 0): void {
    (el.querySelectorAll<HTMLButtonElement>(selector)[index]).click();
  }

  it('shows a loading text while the request is pending', () => {
    api.listMine.mockReturnValue(new Subject<Page<Ticket>>());

    const { el } = render();

    expect(el.textContent).toContain('Cargando tus tickets');
  });

  it('requests the first page when it opens', () => {
    api.listMine.mockReturnValue(of(pageOf([])));

    render();

    expect(api.listMine).toHaveBeenCalledWith(1, 20);
  });

  it('shows movie, room, showtime, seats and concessions of each ticket', () => {
    api.listMine.mockReturnValue(of(pageOf([TICKET_WITH_PDF])));

    const { el } = render();

    expect(el.textContent).toContain('The Silent Reel');
    expect(el.textContent).toContain('Room 3');
    expect(el.textContent).toContain('20 nov 2026');
    expect(el.textContent).toContain('A1');
    expect(el.textContent).toContain('A2');
    expect(el.textContent).toContain('Popcorn (large)');
    expect(el.textContent).toContain('2');
  });

  it('binds the QR component to the payload of each ticket', () => {
    api.listMine.mockReturnValue(of(pageOf([TICKET_WITH_PDF, TICKET_WITHOUT_PDF_OR_TIME])));
    const fixture = TestBed.createComponent(MyTicketsComponent);
    fixture.detectChanges();

    const payloads = fixture.debugElement
      .queryAll(By.directive(QrCodeComponent))
      .map((node) => (node.componentInstance as QrCodeComponent).payload());

    expect(payloads).toEqual(['CSP-TICKET-1', 'CSP-TICKET-2']);
  });

  it('does not render a concessions block when the ticket has none', () => {
    api.listMine.mockReturnValue(of(pageOf([TICKET_WITHOUT_PDF_OR_TIME])));

    const { el } = render();

    expect(el.querySelector('.concessions')).toBeNull();
  });

  it('shows an empty state in Spanish when the client has no tickets', () => {
    api.listMine.mockReturnValue(of(pageOf([])));

    const { el } = render();

    expect(el.querySelector('.empty')?.textContent).toContain('Aún no tienes tickets');
    expect(el.querySelector('.ticket')).toBeNull();
  });

  it('shows "Hora por confirmar" when showtimeStartsAt is null', () => {
    api.listMine.mockReturnValue(of(pageOf([TICKET_WITHOUT_PDF_OR_TIME])));

    const { el } = render();

    expect(el.textContent).toContain('Hora por confirmar');
  });

  it('shows that the PDF is being prepared when pdfUrl is null', () => {
    api.listMine.mockReturnValue(of(pageOf([TICKET_WITHOUT_PDF_OR_TIME])));

    const { el } = render();

    expect(el.textContent).toContain('El PDF se está preparando');
    expect(el.querySelector('.download')).toBeNull();
  });

  it('downloads the PDF through the API and hands it to the browser', () => {
    const blob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
    api.listMine.mockReturnValue(of(pageOf([TICKET_WITH_PDF])));
    api.downloadPdf.mockReturnValue(of(blob));
    const { el } = render();

    click(el, '.download');

    expect(api.downloadPdf).toHaveBeenCalledWith(TICKET_WITH_PDF.id);
    expect(saver.save).toHaveBeenCalledWith(blob, `ticket-${TICKET_WITH_PDF.id}.pdf`);
  });

  it('shows the userMessage of the shell error when the PDF download fails', () => {
    api.listMine.mockReturnValue(of(pageOf([TICKET_WITH_PDF])));
    api.downloadPdf.mockReturnValue(throwError(() => shellError));
    const { el, detect } = render();

    click(el, '.download');
    detect();

    expect(el.querySelector('.pdf-error')?.textContent).toContain(shellError.userMessage);
    expect(saver.save).not.toHaveBeenCalled();
  });

  it('shows the userMessage of the shell error with a retry action when the list fails', () => {
    api.listMine.mockReturnValue(throwError(() => shellError));

    const { el } = render();

    expect(el.querySelector('[role="alert"]')?.textContent).toContain(shellError.userMessage);
    expect(el.querySelector('.retry')?.textContent).toContain('Reintentar');
  });

  it('never shows synthetic tickets when the list fails', () => {
    api.listMine.mockReturnValue(throwError(() => shellError));

    const { el } = render();

    expect(el.querySelector('.ticket')).toBeNull();
    expect(el.textContent).not.toContain('El Carrete Silencioso');
  });

  it('asks again when the client retries and shows the tickets', () => {
    api.listMine
      .mockReturnValueOnce(throwError(() => shellError))
      .mockReturnValueOnce(of(pageOf([TICKET_WITH_PDF])));
    const { el, detect } = render();

    click(el, '.retry');
    detect();

    expect(api.listMine).toHaveBeenCalledTimes(2);
    expect(el.querySelector('[role="alert"]')).toBeNull();
    expect(el.textContent).toContain('The Silent Reel');
  });

  it('normalizes a failure that is not a shell error', () => {
    api.listMine.mockReturnValue(throwError(() => new Error('boom')));

    const { el } = render();

    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Algo salió mal. Intenta de nuevo.');
  });

  it('loads the next page and appends its tickets', () => {
    api.listMine
      .mockReturnValueOnce(of(pageOf([TICKET_WITH_PDF], 1, 2)))
      .mockReturnValueOnce(of(pageOf([TICKET_WITHOUT_PDF_OR_TIME], 2, 2)));
    const { el, detect } = render();

    click(el, '.more');
    detect();

    expect(api.listMine).toHaveBeenLastCalledWith(2, 20);
    expect(el.querySelectorAll('.ticket').length).toBe(2);
    expect(el.querySelector('.more')).toBeNull();
  });

  it('offers no next page when the last page is loaded', () => {
    api.listMine.mockReturnValue(of(pageOf([TICKET_WITH_PDF], 1, 1)));

    const { el } = render();

    expect(el.querySelector('.more')).toBeNull();
  });
});
