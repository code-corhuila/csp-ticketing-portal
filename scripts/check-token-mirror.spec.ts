import { describe, it, expect } from 'vitest';
import { extractRootTokens } from '../scripts/check-token-mirror.mjs';

describe('extractRootTokens', () => {
  it('extracts tokens from a single :root block', () => {
    const css = `
:root {
  --color-primary: #FF0000;
  --font-size: 1rem;
}
`;
    expect(extractRootTokens(css)).toEqual({
      '--color-primary': '#FF0000',
      '--font-size': '1rem',
    });
  });

  it('extracts tokens from multiple :root blocks (global flag)', () => {
    const css = `
:root {
  --color-primary: #FF0000;
}
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #CC0000;
    --color-bg: #000000;
  }
}
`;
    expect(extractRootTokens(css)).toEqual({
      '--color-primary': '#CC0000', // later block overwrites
      '--color-bg': '#000000',
    });
  });

  it('handles extra whitespace and semicolons', () => {
    const css = `
:root {
  --color-primary: #FF0000 ;
  --font-size : 1.5rem ;
}
`;
    expect(extractRootTokens(css)).toEqual({
      '--color-primary': '#FF0000',
      '--font-size': '1.5rem',
    });
  });

  it('ignores empty lines and malformed entries', () => {
    const css = `
:root {
  --color-primary: #FF0000;
  invalid-line
  ;
  --font-size: 1rem;
}
`;
    expect(extractRootTokens(css)).toEqual({
      '--color-primary': '#FF0000',
      '--font-size': '1rem',
    });
  });

  it('returns empty object for no :root block', () => {
    const css = `.foo { color: red; }`;
    expect(extractRootTokens(css)).toEqual({});
  });

  it('handles HTML with inline style block', () => {
    const html = `
<!doctype html>
<html>
<head>
  <style>
    :root {
      --color-brand: #8B5CF6;
    }
  </style>
</head>
</html>
`;
    expect(extractRootTokens(html)).toEqual({
      '--color-brand': '#8B5CF6',
    });
  });
});