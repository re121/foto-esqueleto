// Inlines the skeleton into every app -> one self-contained HTML file per app in dist/.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
const css = readFileSync('skeleton/core.css', 'utf8');
const js = readFileSync('skeleton/core.js', 'utf8');
mkdirSync('dist', { recursive: true });
for (const name of readdirSync('apps')) {
  const src = `apps/${name}/app.html`;
  if (name.startsWith('_') || !existsSync(src)) continue;
  const html = readFileSync(src, 'utf8')
    .replace('<!--FE:CSS-->', `<style>\n${css}</style>`)
    .replace('<!--FE:JS-->', `<script>\n${js}</script>`);
  writeFileSync(`dist/${name}.html`, html);
  console.log('built', `dist/${name}.html`, Math.round(html.length / 1024) + ' KB');
}
