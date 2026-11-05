// Inlines the skeleton into every app -> one self-contained HTML file per app in dist/.
// Also generates dist/index.html: a darkroom landing page listing all apps.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
const css = readFileSync('skeleton/core.css', 'utf8');
const js = readFileSync('skeleton/core.js', 'utf8');
mkdirSync('dist', { recursive: true });

const apps = [];

for (const name of readdirSync('apps')) {
  const src = `apps/${name}/app.html`;
  if (name.startsWith('_') || !existsSync(src)) continue;
  const src_html = readFileSync(src, 'utf8');
  const html = src_html
    .replace('<!--FE:CSS-->', `<style>\n${css}</style>`)
    .replace('<!--FE:JS-->', `<script>\n${js}</script>`);
  writeFileSync(`dist/${name}.html`, html);
  console.log('built', `dist/${name}.html`, Math.round(html.length / 1024) + ' KB');

  // Extract title, subtitle, subtitleEn and icon from the app config block
  const titleMatch    = src_html.match(/\btitle\s*:\s*'([^']+)'/);
  const subMatch      = src_html.match(/\bsubtitle\s*:\s*'([^']+)'/);
  const subEnMatch    = src_html.match(/\bsubtitleEn\s*:\s*'([^']+)'/);
  const iconMatch     = src_html.match(/\bicon\s*:\s*'([^']+)'/);
  apps.push({
    file: `${name}.html`,
    title:      titleMatch  ? titleMatch[1]   : name,
    subtitle:   subMatch    ? subMatch[1]      : '',
    subtitleEn: subEnMatch  ? subEnMatch[1]    : '',
    icon:       iconMatch   ? iconMatch[1]     : '□',
  });
}

// Generate dist/index.html
const cards = apps.map(a => `
    <a class="card" href="${a.file}">
      <span class="icon">${a.icon}</span>
      <span class="card-title">${a.title}</span>
      <span class="card-sub">${a.subtitle}</span>${a.subtitleEn ? `
      <span class="card-sub-en">${a.subtitleEn}</span>` : ''}
    </a>`).join('');

const index = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>foto-esqueleto</title>
<style>
:root{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
*{box-sizing:border-box}
body{margin:0;background:#111;color:#eee;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:48px 24px}
header{text-align:center;margin-bottom:48px}
header h1{margin:0 0 8px;font-size:28px;font-weight:700;letter-spacing:.04em}
header p{margin:0;color:#999;font-size:15px}
.grid{display:flex;flex-wrap:wrap;gap:20px;justify-content:center;max-width:860px;width:100%}
.card{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
  text-decoration:none;color:#eee;
  background:#1c1c1c;border:1px solid #333;border-radius:14px;
  padding:32px 28px;width:240px;transition:border-color .15s,background .15s}
.card:hover{border-color:#c0392b;background:#242424}
.icon{font-size:36px;line-height:1}
.card-title{font-size:18px;font-weight:600}
.card-sub{font-size:13px;color:#999;text-align:center}
.card-sub-en{font-size:12px;color:#666;text-align:center;font-style:italic}
footer{margin-top:64px;font-size:12px;color:#555}
</style>
</head>
<body>
<header>
  <h1>foto-esqueleto</h1>
  <p>Kleine Foto-Werkzeuge — kein Install, kein Server, kein Upload.</p>
</header>
<div class="grid">${cards}
</div>
<footer>Fotos verlassen das Gerät nicht. · Photos never leave your device.</footer>
</body>
</html>`;

writeFileSync('dist/index.html', index);
console.log('built', 'dist/index.html', Math.round(index.length / 1024) + ' KB');
