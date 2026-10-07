import { Component, computed, input } from '@angular/core';
import qrcode from 'qrcode-generator';

interface QrCell {
  x: number;
  y: number;
}

/** Encodes `payload` as a real QR code client-side (no external QR service). */
@Component({
  selector: 'app-qr-code',
  template: `
    @if (failed()) {
      <span class="qr-unavailable" role="alert">QR code unavailable</span>
    } @else if (hasMatrix()) {
      <svg class="qr" role="img" aria-label="Ticket QR code" width="160" height="160"
           shape-rendering="crispEdges" [attr.viewBox]="viewBox()">
        @for (cell of darkCells(); track $index) {
          <rect [attr.x]="cell.x" [attr.y]="cell.y" width="1" height="1" />
        }
      </svg>
    }
  `,
  styles: `
    svg.qr { display: block; margin: 0 auto; background: #fff; }
    rect { fill: #111; }
    .qr-unavailable {
      font-family: var(--font-family-sans);
      font-size: var(--font-size-xs);
      color: var(--color-error);
    }
  `,
})
export class QrCodeComponent {
  readonly payload = input<string>('');
  /** Quiet zone in modules, per QR spec. */
  private readonly quietZone = 4;

  private readonly encode = computed(() => {
    const p = this.payload();
    if (!p) return { qr: null, failed: false };
    try {
      const qr = qrcode(0, 'M');
      qr.addData(p);
      qr.make();
      return { qr, failed: false };
    } catch {
      // Capacity tracking belongs server-side in Cut 3 (gateway-signed payloads);
      // here we surface a visible fallback instead of a blank box with no trail.
      console.error(`QrCodeComponent: payload overflow at ECC M (length ${p.length}).`);
      return { qr: null, failed: true };
    }
  });

  protected readonly failed = computed(() => this.encode().failed);
  protected readonly hasMatrix = computed(() => this.encode().qr !== null);

  protected readonly darkCells = computed<QrCell[]>(() => {
    const qr = this.encode().qr;
    if (!qr) return [];
    const cells: QrCell[] = [];
    const n = qr.getModuleCount();
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (qr.isDark(y, x)) cells.push({ x, y });
      }
    }
    return cells;
  });

  protected readonly viewBox = computed(() => {
    const n = this.encode().qr?.getModuleCount() ?? 0;
    const pad = this.quietZone * 2;
    return `${-this.quietZone} ${-this.quietZone} ${n + pad} ${n + pad}`;
  });
}
