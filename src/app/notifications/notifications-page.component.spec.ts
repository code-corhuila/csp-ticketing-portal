import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { ApiError } from '../shell-contract';
import { Notification, NotificationPage } from './notification';
import { NotificationApiService } from './notification-api.service';
import { NotificationsPageComponent } from './notifications-page.component';

function notification(n: number, type: Notification['type'] = 'BOOKING_CONFIRMED'): Notification {
  return {
    id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`,
    type,
    message: `Message ${n}`,
    timestamp: `2026-11-07T15:${String(60 - n).padStart(2, '0')}:00Z`,
  };
}

function page(numbers: number[], pageNumber: number, totalPages: number): NotificationPage {
  return {
    data: numbers.map((n) => notification(n)),
    meta: { page: pageNumber, limit: 20, total: numbers.length, totalPages },
  };
}

const SHELL_ERROR: ApiError = {
  status: 503,
  code: 'SERVICE_UNAVAILABLE',
  message: 'unavailable',
  details: [],
  traceId: 'trace-1',
  userMessage: 'El servicio no está disponible. Intenta de nuevo.',
};

describe('NotificationsPageComponent', () => {
  let list: ReturnType<typeof vi.fn<(page: number, limit: number) => Observable<NotificationPage>>>;

  beforeEach(() => {
    list = vi.fn();
    TestBed.configureTestingModule({
      imports: [NotificationsPageComponent],
      providers: [{ provide: NotificationApiService, useValue: { list } }],
    });
  });

  function render() {
    const fixture = TestBed.createComponent(NotificationsPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  async function settle(fixture: ReturnType<typeof render>): Promise<HTMLElement> {
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  function messages(el: HTMLElement): string[] {
    return Array.from(el.querySelectorAll('.notification .message')).map((m) => m.textContent?.trim() ?? '');
  }

  function press(el: HTMLElement, selector: string): void {
    (el.querySelector(selector) as HTMLButtonElement).click();
  }

  it('shows a loading text while the first page is pending', () => {
    list.mockReturnValue(new Subject<NotificationPage>());

    const el: HTMLElement = render().nativeElement;

    expect(el.textContent).toContain('Cargando notificaciones');
  });

  it('requests the first page of 20', () => {
    list.mockReturnValue(of(page([1], 1, 1)));

    render();

    expect(list).toHaveBeenCalledWith(1, 20);
  });

  it('lists the notifications in the order received, each with its message and time', async () => {
    list.mockReturnValue(of(page([1, 2, 3], 1, 1)));

    const el = await settle(render());

    expect(messages(el)).toEqual(['Message 1', 'Message 2', 'Message 3']);
    const first = el.querySelector('.notification time') as HTMLTimeElement;
    expect(first.getAttribute('datetime')).toBe('2026-11-07T15:59:00Z');
    expect(first.textContent).toContain('7 nov 2026');
  });

  it('labels each notification type in Spanish', async () => {
    const types: Notification['type'][] = [
      'BOOKING_CONFIRMED',
      'TICKET_ISSUED',
      'RESERVATION_EXPIRED',
      'HOLD_EXPIRY_WARNING',
    ];
    list.mockReturnValue(
      of({
        data: types.map((t, i) => notification(i + 1, t)),
        meta: { page: 1, limit: 20, total: 4, totalPages: 1 },
      }),
    );

    const el = await settle(render());

    const labels = Array.from(el.querySelectorAll('.notification .type')).map((t) => t.textContent?.trim());
    expect(labels).toEqual(['Reserva confirmada', 'Boleta emitida', 'Reserva vencida', 'Aviso de vencimiento']);
  });

  it('shows the empty state in Spanish when there are no notifications', async () => {
    list.mockReturnValue(of(page([], 1, 0)));

    const el = await settle(render());

    expect(el.textContent).toContain('Aún no tienes notificaciones.');
    expect(el.querySelector('.load-more')).toBeNull();
  });

  it('offers load more while there are pages left', async () => {
    list.mockReturnValue(of(page([1, 2], 1, 2)));

    const el = await settle(render());

    expect(el.querySelector('.load-more')?.textContent).toContain('Cargar más');
  });

  it('appends the next page and hides load more on the last page', async () => {
    list.mockReturnValueOnce(of(page([1, 2], 1, 2)));
    const fixture = render();
    let el = await settle(fixture);
    list.mockReturnValueOnce(of(page([3, 4], 2, 2)));

    press(el, '.load-more');
    el = await settle(fixture);

    expect(list).toHaveBeenLastCalledWith(2, 20);
    expect(messages(el)).toEqual(['Message 1', 'Message 2', 'Message 3', 'Message 4']);
    expect(el.querySelector('.load-more')).toBeNull();
  });

  it('disables load more while the next page is pending', async () => {
    list.mockReturnValueOnce(of(page([1], 1, 2)));
    const fixture = render();
    let el = await settle(fixture);
    list.mockReturnValueOnce(new Subject<NotificationPage>());

    press(el, '.load-more');
    el = await settle(fixture);

    expect((el.querySelector('.load-more') as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows the userMessage of the shell error with a retry action', async () => {
    list.mockReturnValue(throwError(() => SHELL_ERROR));

    const el = await settle(render());

    expect(el.querySelector('[role="alert"]')?.textContent).toContain(SHELL_ERROR.userMessage);
    expect(el.querySelector('.retry')?.textContent).toContain('Reintentar');
  });

  it('falls back to a Spanish message when the error is not a shell error', async () => {
    list.mockReturnValue(throwError(() => new Error('boom')));

    const el = await settle(render());

    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Algo salió mal. Intenta de nuevo.');
  });

  it('retries the first page and lists the notifications when the retry succeeds', async () => {
    list.mockReturnValueOnce(throwError(() => SHELL_ERROR));
    const fixture = render();
    let el = await settle(fixture);
    list.mockReturnValueOnce(of(page([1], 1, 1)));

    press(el, '.retry');
    el = await settle(fixture);

    expect(list).toHaveBeenLastCalledWith(1, 20);
    expect(el.querySelector('[role="alert"]')).toBeNull();
    expect(messages(el)).toEqual(['Message 1']);
  });

  it('keeps the loaded notifications when a later page fails and retries that same page', async () => {
    list.mockReturnValueOnce(of(page([1], 1, 2)));
    const fixture = render();
    let el = await settle(fixture);
    list.mockReturnValueOnce(throwError(() => SHELL_ERROR));

    press(el, '.load-more');
    el = await settle(fixture);

    expect(messages(el)).toEqual(['Message 1']);
    expect(el.querySelector('[role="alert"]')?.textContent).toContain(SHELL_ERROR.userMessage);

    list.mockReturnValueOnce(of(page([2], 2, 2)));
    press(el, '.retry');
    el = await settle(fixture);

    expect(list).toHaveBeenLastCalledWith(2, 20);
    expect(messages(el)).toEqual(['Message 1', 'Message 2']);
    expect(el.querySelector('[role="alert"]')).toBeNull();
  });
});
