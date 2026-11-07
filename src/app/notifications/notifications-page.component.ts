import { Component, computed, inject, signal } from '@angular/core';
import { ApiError, asApiError } from '../shell-contract';
import { NOTIFICATION_TYPE_LABELS, Notification } from './notification';
import { NotificationApiService } from './notification-api.service';

const PAGE_SIZE = 20;

const TIME_FORMAT = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });

/** Route /dashboard/notifications: the signed-in client's notifications, newest first (HU-FE-TICKETING-003). */
@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.css',
})
export class NotificationsPageComponent {
  private readonly api = inject(NotificationApiService);

  protected readonly notifications = signal<Notification[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<ApiError | null>(null);
  private readonly loadedPages = signal(0);
  private readonly totalPages = signal(0);

  protected readonly firstLoad = computed(() => this.loading() && this.notifications().length === 0);
  protected readonly isEmpty = computed(
    () => !this.loading() && !this.error() && this.loadedPages() > 0 && this.notifications().length === 0,
  );
  protected readonly canLoadMore = computed(
    () => !this.error() && this.loadedPages() > 0 && this.loadedPages() < this.totalPages(),
  );

  constructor() {
    this.loadNextPage();
  }

  /** Loads the page after the last loaded one; after a failure the same page is requested again. */
  protected loadNextPage(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.list(this.loadedPages() + 1, PAGE_SIZE).subscribe({
      next: ({ data, meta }) => {
        this.notifications.update((current) => [...current, ...data]);
        this.loadedPages.set(meta.page);
        this.totalPages.set(meta.totalPages);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(asApiError(err));
        this.loading.set(false);
      },
    });
  }

  protected typeLabel(notification: Notification): string {
    return NOTIFICATION_TYPE_LABELS[notification.type];
  }

  protected time(notification: Notification): string {
    return TIME_FORMAT.format(new Date(notification.timestamp));
  }
}
