import { ComponentFixture, TestBed } from '@angular/core/testing';
import qrcode from 'qrcode-generator';
import { QrCodeComponent } from './qr-code.component';

/** Rendered dark modules, as "x,y" keys. */
function renderedCells(fixture: ComponentFixture<QrCodeComponent>): Set<string> {
  const rects: NodeListOf<SVGRectElement> =
    fixture.nativeElement.querySelectorAll('svg rect');
  return new Set(Array.from(rects, (r) => `${r.getAttribute('x')},${r.getAttribute('y')}`));
}

/** Positional contract: every dark module of the expected QR matrix appears as
 * a rect at its module coordinates — and nothing else. Transposition-sensitive. */
function expectMatchesQrMatrix(fixture: ComponentFixture<QrCodeComponent>, payload: string): void {
  const qr = qrcode(0, 'M');
  qr.addData(payload);
  qr.make();
  const n = qr.getModuleCount();
  const cells = renderedCells(fixture);
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      expect(cells.has(`${col},${row}`)).toBe(qr.isDark(row, col));
    }
  }
}

/** Expected canvas: module grid plus the QR spec's 4-module quiet zone per side. */
function expectedViewBox(payload: string): string {
  const qr = qrcode(0, 'M');
  qr.addData(payload);
  qr.make();
  const n = qr.getModuleCount();
  return `-4 -4 ${n + 8} ${n + 8}`;
}

describe('QrCodeComponent', () => {
  let fixture: ComponentFixture<QrCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [QrCodeComponent] }).compileComponents();
    fixture = TestBed.createComponent(QrCodeComponent);
  });

  it('renders the payload as the correct QR matrix', () => {
    fixture.componentRef.setInput('payload', 'CSP-55555555-A1-A2');
    fixture.detectChanges();

    expectMatchesQrMatrix(fixture, 'CSP-55555555-A1-A2');
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe(expectedViewBox('CSP-55555555-A1-A2'));
  });

  it('re-renders a different, also-correct matrix when the payload changes', () => {
    fixture.componentRef.setInput('payload', 'CSP-FIRST-PAYLOAD');
    fixture.detectChanges();
    expectMatchesQrMatrix(fixture, 'CSP-FIRST-PAYLOAD');
    const first = fixture.nativeElement.innerHTML;

    fixture.componentRef.setInput('payload', 'CSP-SECOND-PAYLOAD');
    fixture.detectChanges();
    expectMatchesQrMatrix(fixture, 'CSP-SECOND-PAYLOAD');
    expect(fixture.nativeElement.innerHTML).not.toBe(first);
  });

  it('falls back to an empty render instead of crashing when the payload overflows', () => {
    fixture.componentRef.setInput('payload', 'x'.repeat(3000));

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.querySelectorAll('svg rect').length).toBe(0);
    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('unavailable');
  });

  it('renders nothing at all when no payload is set', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });
});
