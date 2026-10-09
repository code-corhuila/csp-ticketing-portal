import { describe, it, expect } from 'vitest';
import { extractRootBlocks, extractRootTokens } from '../scripts/check-token-mirror.mjs';

describe('extractRootBlocks', () => {
  it('extracts tokens from a single :root block', () => {
    const css = `
:root {
  --color-primary: #FF0000;
  --font-size: 1rem;
}
`;
    expect(extractRootBlocks(css)).toEqual([
      { tokens: { '--color-primary': '#FF0000', '--font-size': '1rem' } },
    ]);
  });

  it('extracts tokens from multiple :root blocks preserving order', () => {
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
    expect(extractRootBlocks(css)).toEqual([
      { tokens: { '--color-primary': '#FF0000' } },
      { tokens: { '--color-primary': '#CC0000', '--color-bg': '#000000' } },
    ]);
  });

  it('handles values with colons (urls, functions)', () => {
    const css = `
:root {
  --bg-image: url(https://cdn.example.com/image.png);
  --gradient: linear-gradient(135deg, #1e1b4b, #0f172a);
  --font-stack: system-ui, -apple-system, "Segoe UI", Roboto;
}
`;
    expect(extractRootBlocks(css)).toEqual([
      {
        tokens: {
          '--bg-image': 'url(https://cdn.example.com/image.png)',
          '--gradient': 'linear-gradient(135deg, #1e1b4b, #0f172a)',
          '--font-stack': 'system-ui, -apple-system, "Segoe UI", Roboto',
        },
      },
    ]);
  });

  it('handles extra whitespace and semicolons', () => {
    const css = `
:root {
  --color-primary: #FF0000 ;
  --font-size : 1.5rem ;
}
`;
    expect(extractRootBlocks(css)).toEqual([
      { tokens: { '--color-primary': '#FF0000', '--font-size': '1.5rem' } },
    ]);
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
    expect(extractRootBlocks(css)).toEqual([
      { tokens: { '--color-primary': '#FF0000', '--font-size': '1rem' } },
    ]);
  });

  it('returns empty array for no :root block', () => {
    const css = `.foo { color: red; }`;
    expect(extractRootBlocks(css)).toEqual([]);
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
    expect(extractRootBlocks(html)).toEqual([
      { tokens: { '--color-brand': '#8B5CF6' } },
    ]);
  });

  it('handles multiple themed blocks in different order', () => {
    const css = `
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #000000;
  }
}
:root {
  --color-primary: #FF0000;
}
@media (prefers-color-scheme: high-contrast) {
  :root {
    --color-border: #FFFFFF;
  }
}
`;
    expect(extractRootBlocks(css)).toEqual([
      { tokens: { '--color-bg': '#000000' } },
      { tokens: { '--color-primary': '#FF0000' } },
      { tokens: { '--color-border': '#FFFFFF' } },
    ]);
  });
});

describe('extractRootTokens', () => {
  it('merges all blocks (later overwrites earlier)', () => {
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
      '--color-primary': '#CC0000',
      '--color-bg': '#000000',
    });
  });
});