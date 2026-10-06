import { Component, computed, input } from '@angular/core';
import qrcode from 'qrcode-generator';

interface QrCell {
  x: number;
  y: number;
}

/**
 * Encodes `payload` as a real QR code (client-side, no external QR service)
 * and renders the module matrix as crisp SVG squares.
 */
@Component({
  selector: 'app-qr-code',
  template: `
    <svg
      class="qr"
      role="img"
      aria-label="Ticket QR code"
      width="160"
      height="160"
      shape-rendering="crispEdges"
      [attr.viewBox]="viewBox()"
    >
      @for (cell of darkCells(); track $index) {
        <rect [attr.x]="cell.x" [attr.y]="cell.y" width="1" height="1" />
      }
    </svg>
  `,
  styles: `
    svg.qr {
      display: block;
      background: #fff;
    }
    rect {
      fill: #111;
    }
  `,
})
export class QrCodeComponent {
  readonly payload = input<string>('');
  /** Quiet zone in modules, per QR spec. */
  private readonly quietZone = 4;

  private readonly matrix = computed(() => {
    const payload = this.payload();
    if (!payload) return null;
    const qr = qrcode(0, 'M');
    qr.addData(payload);
    qr.make();
    return qr;
  });

  protected readonly darkCells = computed<QrCell[]>(() => {
    const qr = this.matrix();
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
    const n = this.matrix()?.getModuleCount() ?? 0;
    const pad = this.quietZone * 2;
    return `${-this.quietZone} ${-this.quietZone} ${n + pad} ${n + pad}`;
  });
}
