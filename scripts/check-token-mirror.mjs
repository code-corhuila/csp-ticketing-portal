import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

export function extractRootTokens(content) {
  const tokens = {};
  const rootRegex = /:root\s*{([^}]+)}/g;
  let match;
  while ((match = rootRegex.exec(content)) !== null) {
    const block = match[1];
    for (const line of block.split(';')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const parts = trimmed.split(':').map(p => p.trim());
      if (parts.length === 2) {
        tokens[parts[0]] = parts[1];
      }
    }
  }
  return tokens;
}

function runTokenSyncCheck() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = resolve(__filename, '..');

  const portalIndex = resolve(__dirname, '../src/index.html');
  // Configurable path to shell's styles.css
  const shellStyles = resolve(__dirname, process.env.CSP_FRONT_PATH ?? '../../../csp-front/src/styles.css');
  // Strict mode: fail if shell not found (default: false for CI single-repo)
  const strictMode = process.env.TOKEN_MIRROR_STRICT === '1';

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

  const portalTokens = extractRootTokens(portalContent);
  const shellTokens = extractRootTokens(shellContent);

  let hasMismatch = false;

  // Check portal tokens against shell (portal should match shell)
  for (const [key, value] of Object.entries(portalTokens)) {
    if (shellTokens[key] !== value) {
      console.log(`❌ MISMATCH: ${key}`);
      console.log(`   Portal: ${value}`);
      console.log(`   Shell:  ${shellTokens[key] ?? 'NOT DEFINED'}`);
      hasMismatch = true;
    } else {
      console.log(`✅ ${key}: ${value}`);
    }
  }

  // Check shell tokens against portal (shell should not have extra tokens that portal misses)
  for (const [key, value] of Object.entries(shellTokens)) {
    if (!(key in portalTokens)) {
      console.log(`❌ MISSING IN PORTAL: ${key} = ${value}`);
      hasMismatch = true;
    }
  }

  if (hasMismatch) {
    console.log('\n💥 Token mirror is OUT OF SYNC with shell.');
    process.exit(1);
  } else {
    console.log('\n✅ Token mirror is IN SYNC with shell.');
    process.exit(0);
  }
}

// Only run CLI when executed directly (not imported)
const scriptPath = fileURLToPath(import.meta.url);
const entryPath = resolve(process.argv[1]);
if (scriptPath === entryPath) {
  runTokenSyncCheck();
}