import { Injectable } from '@angular/core';

/** Hands a downloaded file to the browser. Kept apart so the page can be tested without the DOM download. */
@Injectable({ providedIn: 'root' })
export class FileSaver {
  save(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
