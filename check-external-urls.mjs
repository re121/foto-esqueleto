#!/usr/bin/env node
// check-external-urls.mjs
// Scans apps/*/app.html, skeleton/*, and dist/*.html for external URL references
// that would violate R1 (self-contained) and R6 (no external requests / privacy).
//
// Flags occurrences of http:// or https:// appearing as actual network-triggering
// values: src=, href=, url(, @import, import "…", import '…', fetch(
//
// Exit code: 0 = clean, 1 = violations found.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('.', import.meta.url).pathname.replace(/\/$/, '');

// Collect files to check
const filesToCheck = [];

// apps/*/app.html
for (const name of readdirSync(join(ROOT, 'apps'))) {
  if (name.startsWith('_')) continue;
  const p = join(ROOT, 'apps', name, 'app.html');
  if (existsSync(p)) filesToCheck.push(p);
}

// skeleton/*  (all files)
for (const name of readdirSync(join(ROOT, 'skeleton'))) {
  filesToCheck.push(join(ROOT, 'skeleton', name));
}

// dist/*.html
if (existsSync(join(ROOT, 'dist'))) {
  for (const name of readdirSync(join(ROOT, 'dist'))) {
    if (name.endsWith('.html')) filesToCheck.push(join(ROOT, 'dist', name));
  }
}

// Patterns that indicate a network-triggering external URL reference:
//   src="https://…" | src='https://…'
//   href="https://…" | href='https://…'
//   url(https://…)   | url("https://…") | url('https://…')
//   @import "https://…" | @import 'https://…'
//   import "https://…" | import 'https://…"  (ES module)
//   fetch("https://…") | fetch('https://…')
//   action="https://…" (forms)
//   content="https://…" (meta refresh etc.)
const TRIGGER_RE = /(?:src|href|action|content)\s*=\s*['"]https?:\/\/|url\(\s*['"]?\s*https?:\/\/|@import\s+['"]https?:\/\/|(?<![:\w])import\s+['"]https?:\/\/|fetch\s*\(\s*['"]https?:\/\//gi;

// Also catch bare attribute values without quotes: src=https://…
const BARE_ATTR_RE = /(?:src|href|action)\s*=\s*https?:\/\//gi;

let violations = 0;

for (const file of filesToCheck) {
  const raw = readFileSync(file, 'utf8');

  // Strip block comments (HTML and CSS/JS) and // line comments so we don't
  // flag commented-out URLs. Preserve newlines so line numbers stay correct.
  // For // line comments we use a negative lookbehind to avoid stripping ://
  // inside actual URL strings.
  const blankPreserveNewlines = m => m.replace(/[^\n]/g, ' ');
  const stripped = raw
    .replace(/<!--[\s\S]*?-->/g, blankPreserveNewlines)    // HTML comments
    .replace(/\/\*[\s\S]*?\*\//g, blankPreserveNewlines)   // JS/CSS block comments
    .replace(/(?<![:\w])\/\/.*$/gm, blankPreserveNewlines); // JS // line comments

  const lines = stripped.split('\n');
  const rawLines = raw.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    TRIGGER_RE.lastIndex = 0;
    BARE_ATTR_RE.lastIndex = 0;

    const hasTrigger = TRIGGER_RE.test(line);
    BARE_ATTR_RE.lastIndex = 0;
    const hasBareTrigger = BARE_ATTR_RE.test(line);

    if (hasTrigger || hasBareTrigger) {
      const rel = file.replace(ROOT + '/', '');
      const display = rawLines[i].trim();
      console.error(`EXTERNAL URL  ${rel}:${i + 1}  ${display}`);
      violations++;
    }
  }
}

if (violations === 0) {
  console.log('✓ No external URL references found.');
  process.exit(0);
} else {
  console.error(`\n✗ ${violations} external URL reference(s) found — fix before deploying.`);
  process.exit(1);
}
