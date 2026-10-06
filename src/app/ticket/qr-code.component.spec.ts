import { ComponentFixture, TestBed } from '@angular/core/testing';
import qrcode from 'qrcode-generator';
import { QrCodeComponent } from './qr-code.component';

/** Same encoder options as the component: auto version, ECC level M. */
function expectedDarkCells(payload: string): number {
  const qr = qrcode(0, 'M');
  qr.addData(payload);
  qr.make();
  let count = 0;
  const n = qr.getModuleCount();
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (qr.isDark(row, col)) count++;
    }
  }
  return count;
}

describe('QrCodeComponent', () => {
  let fixture: ComponentFixture<QrCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [QrCodeComponent] }).compileComponents();
    fixture = TestBed.createComponent(QrCodeComponent);
  });

  it('encodes and renders the payload as a real QR matrix', () => {
    fixture.componentRef.setInput('payload', 'CSP-55555555-A1-A2');
    fixture.detectChanges();

    const rects: NodeListOf<SVGRectElement> =
      fixture.nativeElement.querySelectorAll('svg rect');

    expect(rects.length).toBe(expectedDarkCells('CSP-55555555-A1-A2'));
    expect(rects.length).toBeGreaterThan(0);
  });

  it('renders a different matrix when the payload changes', () => {
    fixture.componentRef.setInput('payload', 'CSP-FIRST-PAYLOAD');
    fixture.detectChanges();
    const first = fixture.nativeElement.innerHTML;

    fixture.componentRef.setInput('payload', 'CSP-SECOND-PAYLOAD');
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).not.toBe(first);
  });
});
