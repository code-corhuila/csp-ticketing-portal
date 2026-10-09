import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

const portalIndex = resolve(__dirname, '../src/index.html');
const shellStyles = resolve(__dirname, '../../../csp-front/src/styles.css');

function extractRootTokens(content) {
  const match = content.match(/:root\s*{([^}]+)}/);
  if (!match) return {};
  return Object.fromEntries(
    match[1]
      .split(';')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => {
        const parts = s.split(':').map(p => p.trim());
        return [parts[0], parts[1]];
      })
  );
}

console.log('🔍 Checking token mirror sync...\n');

if (!existsSync(shellStyles)) {
  console.log('❌ FAIL: csp-front not found at', shellStyles);
  console.log('   This check requires csp-front cloned alongside (standard sibling layout).');
  console.log('   In CI: ensure csp-front is checked out next to csp-ticketing-portal.');
  console.log('   Locally: clone csp-front as sibling or run from integrated workspace.');
  process.exit(1);
}

const portalContent = readFileSync(portalIndex, 'utf-8');
const shellContent = readFileSync(shellStyles, 'utf-8');

const portalTokens = extractRootTokens(portalContent);
const shellTokens = extractRootTokens(shellContent);

let hasMismatch = false;

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

// Check for tokens in shell not in portal (optional warning)
for (const key of Object.keys(shellTokens)) {
  if (!(key in portalTokens)) {
    console.log(`⚠️  EXTRA in shell (not in portal mirror): ${key} = ${shellTokens[key]}`);
  }
}

if (hasMismatch) {
  console.log('\n💥 Token mirror is OUT OF SYNC with shell.');
  process.exit(1);
} else {
  console.log('\n✅ Token mirror is IN SYNC with shell.');
  process.exit(0);
}