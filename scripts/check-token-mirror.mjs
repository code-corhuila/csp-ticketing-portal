import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

export function extractRootBlocks(content) {
  const blocks = [];
  const rootRegex = /:root\s*{([^}]+)}/g;
  let match;
  while ((match = rootRegex.exec(content)) !== null) {
    const blockContent = match[1];
    const tokens = {};
    for (const line of blockContent.split(';')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx === -1) continue;
      const key = trimmed.slice(0, colonIdx).trim();
      const value = trimmed.slice(colonIdx + 1).trim();
      if (key) {
        tokens[key] = value;
      }
    }
    blocks.push({ tokens });
  }
  return blocks;
}

export function extractRootTokens(content) {
  const blocks = extractRootBlocks(content);
  const merged = {};
  for (const block of blocks) {
    Object.assign(merged, block.tokens);
  }
  return merged;
}

function runTokenSyncCheck() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = resolve(__filename, '..');

  const portalIndex = resolve(__dirname, '../src/index.html');
  // Configurable path to shell's styles.css
  const shellStyles = resolve(__dirname, process.env.CSP_FRONT_PATH ?? '../../../csp-front/src/styles.css');
  // Strict mode: fail if shell not found (default: true). Disable with TOKEN_MIRROR_STRICT=0
  const strictMode = process.env.TOKEN_MIRROR_STRICT !== '0';

  console.log('🔍 Checking token mirror sync...\n');

  if (!existsSync(shellStyles)) {
    if (strictMode) {
      console.log('❌ FAIL: csp-front not found at', shellStyles);
      console.log('   This check requires csp-front cloned alongside (standard sibling layout).');
      console.log('   In CI: ensure csp-front is checked out next to csp-ticketing-portal.');
      console.log('   Locally: clone csp-front as sibling or run from integrated workspace.');
      console.log('   Disable strict mode: TOKEN_MIRROR_STRICT=0');
      process.exit(1);
    } else {
      console.log('⚠️  SKIP: csp-front not found at', shellStyles);
      console.log('   (CI single-repo mode — set TOKEN_MIRROR_STRICT=1 to enforce)');
      console.log('   Expected at:', shellStyles);
      process.exit(0);
    }
  }

  const portalContent = readFileSync(portalIndex, 'utf-8');
  const shellContent = readFileSync(shellStyles, 'utf-8');

  const portalBlocks = extractRootBlocks(portalContent);
  const shellBlocks = extractRootBlocks(shellContent);

  // Compare blocks by index (base, dark, etc.)
  const maxBlocks = Math.max(portalBlocks.length, shellBlocks.length);
  for (let i = 0; i < maxBlocks; i++) {
    const pBlock = portalBlocks[i]?.tokens ?? {};
    const sBlock = shellBlocks[i]?.tokens ?? {};
    const blockLabel = i === 0 ? 'base' : `themed[${i}]`;

    // Check portal tokens against shell
    for (const [key, value] of Object.entries(pBlock)) {
      if (sBlock[key] !== value) {
        console.log(`❌ MISMATCH in ${blockLabel}: ${key}`);
        console.log(`   Portal: ${value}`);
        console.log(`   Shell:  ${sBlock[key] ?? 'NOT DEFINED'}`);
        process.exit(1);
      }
    }

    // Check shell tokens against portal
    for (const [key, value] of Object.entries(sBlock)) {
      if (!(key in pBlock)) {
        console.log(`❌ MISSING IN PORTAL in ${blockLabel}: ${key} = ${value}`);
        process.exit(1);
      }
    }
  }

  console.log('\n✅ Token mirror is IN SYNC with shell.');
  process.exit(0);
}

// Only run CLI when executed directly (not imported)
const scriptPath = fileURLToPath(import.meta.url);
const entryPath = resolve(process.argv[1]);
if (scriptPath === entryPath) {
  runTokenSyncCheck();
}