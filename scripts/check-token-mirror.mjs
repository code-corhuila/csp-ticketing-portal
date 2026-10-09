import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const BT = String.fromCharCode(96);

function splitDeclarations(block) {
  const out = [];
  let cur = '';
  let paren = 0;
  let inStr = false;
  let strChar = '';
  for (const ch of block) {
    if (!inStr && (ch === '"' || ch === "'" || ch === String.fromCharCode(96))) { inStr = true; strChar = ch; }
    else if (inStr && ch === strChar) { inStr = false; }
    if (!inStr && ch === '(') paren++;
    else if (!inStr && ch === ')') paren = Math.max(0, paren - 1);
    if (!inStr && ch === ';' && paren === 0) { out.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function parseTokens(block) {
  const tokens = {};
  for (const line of splitDeclarations(block)) {
    const i = line.indexOf(':');
    if (i > 0) tokens[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return tokens;
}

function findMatchingBrace(css, start, initialDepth = 1) {
  let depth = initialDepth;
  for (let i = start; i < css.length && i < start + 10000; i++) {
    const ch = css[i];
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) return i; }
  }
  return -1;
}

export function extractRootBlocks(css) {
  const rootRx = /:root\s*{/g;
  let mRoot;
  const rootBlocks = [];
  while ((mRoot = rootRx.exec(css)) !== null) {
    const start = mRoot.index;
    const braceStart = mRoot.index + mRoot[0].length;
    const braceEnd = findMatchingBrace(css, braceStart, 1);
    if (braceEnd !== -1) {
      const tokens = parseTokens(css.slice(mRoot.index + mRoot[0].length, braceEnd));
      rootBlocks.push({ start: mRoot.index, end: braceEnd, tokens });
    }
  }
  
  const mediaBlocks = [];
  const mediaRx = /@media\s+([^{]+)\s*{/g;
  let mMedia;
  while ((mMedia = mediaRx.exec(css)) !== null) {
    const mediaStart = mMedia.index;
    const braceStart = mMedia.index + mMedia[0].length;
    const braceEnd = findMatchingBrace(css, braceStart, 1);
    if (braceEnd !== -1) {
      mediaBlocks.push({ media: mMedia[1].trim(), start: mMedia.index, end: braceEnd });
    }
  }
  
  const blocks = [];
  for (const root of rootBlocks) {
    let media = '';
    for (const mb of mediaBlocks) {
      if (root.start >= mb.start && root.end <= mb.end) {
        media = mb.media;
        break;
      }
    }
    blocks.push({ media, tokens: root.tokens });
  }
  
  blocks.sort((a, b) => (a.media === '' ? -1 : b.media === '' ? 1 : a.media.localeCompare(b.media)));
  return blocks;
}

export function extractRootTokens(css) {
  const merged = {};
  for (const b of extractRootBlocks(css)) Object.assign(merged, b.tokens);
  return merged;
}

function runTokenSyncCheck() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = resolve(__filename, '..');
  const portalIndex = resolve(__dirname, '../src/index.html');
  const shellStyles = resolve(__dirname, process.env.CSP_FRONT_PATH ?? '../../../csp-front/src/styles.css');
  const strict = process.env.TOKEN_MIRROR_STRICT === '1';

  console.log('🔍 Checking token mirror sync...');
  if (!existsSync(shellStyles)) {
    if (process.env.TOKEN_MIRROR_STRICT === '1') {
      console.log('❌ FAIL: csp-front not found at', shellStyles);
      process.exit(1);
    }
    console.log('⚠️  SKIP: csp-front not found (set TOKEN_MIRROR_STRICT=1 to enforce)');
    process.exit(0);
  }

  const pBlocks = extractRootBlocks(readFileSync(resolve(__dirname, '../src/index.html'), 'utf-8'));
  const sBlocks = extractRootBlocks(readFileSync(shellStyles, 'utf-8'));

  const sMap = Object.fromEntries(sBlocks.map(b => [b.media, b.tokens]));
  for (const p of pBlocks) {
    const s = sMap[p.media] || {};
    for (const [k, v] of Object.entries(p.tokens)) {
      if (s[k] !== v) {
        console.log('❌ MISMATCH [' + (p.media || 'base') + ']: ' + k);
        console.log('   Portal: ' + v + '\n   Shell:  ' + (s[k] ?? 'NOT DEFINED'));
        process.exit(1);
      }
    }
    for (const [k, v] of Object.entries(s)) if (!(k in p.tokens)) {
      console.log('❌ MISSING IN PORTAL [' + (p.media || 'base') + ']: ' + k + ' = ' + v);
      process.exit(1);
    }
  }
  console.log('\n✅ Token mirror is IN SYNC with shell.');
  process.exit(0);
}
const scriptPath = fileURLToPath(import.meta.url);
const entryPath = resolve(process.argv[1]);
if (import.meta.main) {
  runTokenSyncCheck();
}