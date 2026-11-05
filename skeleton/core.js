/* foto-esqueleto — core.
 * One skeleton, many single-file photo tools.
 * An app only declares: title, inputs, controls and a render() function.
 * The skeleton supplies: layout, file/camera input, drag & drop, persisted
 * settings, render loop, export, theme and shared image utilities.
 * No dependencies, works offline, everything stays on the device.
 */
(function (global) {
  'use strict';

  const util = {
    /** Fit a w×h box into W×H, centred. Returns {x,y,w,h}. */
    fit(w, h, W, H, pad = 0) {
      const s = Math.min((W - 2 * pad) / w, (H - 2 * pad) / h);
      const dw = w * s, dh = h * s;
      return { x: (W - dw) / 2, y: (H - dh) / 2, w: dw, h: dh };
    },
    /** Luminance array (0–255) from ImageData. */
    gray(img) {
      const d = img.data, g = new Float32Array(img.width * img.height);
      for (let i = 0, j = 0; i < d.length; i += 4, j++) g[j] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      return g;
    },
    /** Sobel gradient magnitude of a gray array. */
    sobel(g, w, h) {
      const m = new Float32Array(w * h);
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const gx = -g[i - w - 1] - 2 * g[i - 1] - g[i + w - 1] + g[i - w + 1] + 2 * g[i + 1] + g[i + w + 1];
        const gy = -g[i - w - 1] - 2 * g[i - w] - g[i - w + 1] + g[i + w - 1] + 2 * g[i + w] + g[i + w + 1];
        m[i] = Math.sqrt(gx * gx + gy * gy);
      }
      return m;
    },
    hexToRgb(hex) {
      const n = parseInt(hex.replace('#', ''), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    },
  };

  const store = {
    load(id) { try { return JSON.parse(localStorage.getItem('fe:' + id)) || {}; } catch (e) { return {}; } },
    save(id, v) { try { localStorage.setItem('fe:' + id, JSON.stringify(v)); } catch (e) { /* private mode */ } },
  };

  function el(tag, attrs = {}, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') n.className = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v);
    }
    kids.flat().forEach(k => n.append(k instanceof Node ? k : document.createTextNode(k)));
    return n;
  }

  function create(cfg) {
    const inputs = Object.assign({ files: true, multiple: false, camera: false }, cfg.inputs);
    const saved = store.load(cfg.id);
    const params = {};
    (cfg.controls || []).forEach(c => { params[c.key] = c.key in saved ? saved[c.key] : c.value; });

    const state = { sources: [], video: null, stream: null, raf: 0 };
    const canvas = el('canvas', { width: 1200, height: 800 });
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // ---- layout
    const fileInput = el('input', { type: 'file', accept: 'image/*', class: 'fe-hidden' });
    if (inputs.multiple) fileInput.multiple = true;
    const status = el('div', { class: 'fe-status' });
    const drop = el('div', { class: 'fe-drop' },
      el('div', { style: 'font-size:40px' }, cfg.icon || '◐'),
      el('div', {}, cfg.dropText || (inputs.multiple ? 'Fotos hierher ziehen oder auswählen' : 'Foto hierher ziehen oder auswählen')),
    );
    const side = el('aside', { class: 'fe-side' },
      el('h1', { class: 'fe-title' }, cfg.title),
      cfg.subtitle ? el('p', { class: 'fe-sub' }, cfg.subtitle + (cfg.subtitleEn ? ' · ' + cfg.subtitleEn : '')) : '',
    );
    const btnRow = el('div', { class: 'fe-row' });
    if (inputs.files) btnRow.append(el('button', { class: 'fe-btn', onclick: () => fileInput.click() }, inputs.multiple ? 'Fotos…' : 'Foto…'));
    if (inputs.camera) btnRow.append(el('button', { class: 'fe-btn', onclick: toggleCamera }, 'Kamera'));
    side.append(btnRow, fileInput);

    (cfg.controls || []).forEach(c => side.append(control(c)));
    side.append(
      el('button', { class: 'fe-btn primary', onclick: exportImage }, cfg.exportLabel || 'Speichern'),
      el('button', { class: 'fe-btn', onclick: toggleTheme }, 'Hell / Dunkel'),
      status,
    );
    const stage = el('main', { class: 'fe-stage' }, canvas, drop);
    document.body.append(el('div', { class: 'fe-app' }, side, stage));
    document.title = cfg.title;
    try { if (localStorage.getItem('fe:theme') === 'light') document.documentElement.dataset.theme = 'light'; } catch (e) {}

    function control(c) {
      const out = el('span', {}, fmt(c, params[c.key]));
      const lab = el('label', {}, c.label, c.type === 'range' ? out : '');
      let input;
      if (c.type === 'select') {
        input = el('select', {}, ...c.options.map(o => el('option', { value: o.value }, o.label)));
        input.value = params[c.key];
      } else if (c.type === 'checkbox') {
        input = el('input', { type: 'checkbox' }); input.checked = !!params[c.key];
      } else {
        input = el('input', { type: c.type, min: c.min ?? '', max: c.max ?? '', step: c.step ?? '' });
        input.value = params[c.key];
      }
      input.addEventListener('input', () => {
        const v = c.type === 'checkbox' ? input.checked : (c.type === 'range' ? Number(input.value) : input.value);
        params[c.key] = v; out.textContent = fmt(c, v); store.save(cfg.id, params); draw();
      });
      if (c.type === 'checkbox') return el('div', { class: 'fe-group' }, el('label', { class: 'fe-check' }, input, c.label));
      return el('div', { class: 'fe-group' }, lab, input);
    }
    function fmt(c, v) { return c.type === 'range' ? (c.format ? c.format(v) : String(v)) : ''; }

    // ---- input
    fileInput.addEventListener('change', () => addFiles(fileInput.files));
    stage.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); });
    stage.addEventListener('dragleave', () => drop.classList.remove('over'));
    stage.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('over'); addFiles(e.dataTransfer.files); });

    async function addFiles(list) {
      const files = [...list].filter(f => f.type.startsWith('image/'));
      if (!files.length) return;
      stopCamera();
      const loaded = await Promise.all(files.map(async f => {
        const bmp = await createImageBitmap(f, { imageOrientation: 'from-image' });
        return { name: f.name, image: bmp, width: bmp.width, height: bmp.height };
      }));
      state.sources = inputs.multiple ? state.sources.concat(loaded) : loaded.slice(0, 1);
      fileInput.value = '';
      draw();
    }

    async function toggleCamera() {
      if (state.stream) return stopCamera();
      try {
        state.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 } } });
        state.video = el('video', { playsinline: '', muted: '' });
        state.video.srcObject = state.stream; await state.video.play();
        loop();
      } catch (e) { status.textContent = 'Kamera nicht verfügbar: ' + e.message; }
    }
    function stopCamera() {
      cancelAnimationFrame(state.raf);
      if (state.stream) state.stream.getTracks().forEach(t => t.stop());
      state.stream = null; state.video = null;
    }
    function loop() { draw(); state.raf = requestAnimationFrame(loop); }

    // ---- render
    function draw() {
      const has = state.sources.length || state.video;
      drop.classList.toggle('fe-hidden', !!has);
      canvas.classList.toggle('fe-hidden', !has);
      if (!has) return;
      const api = { canvas, ctx, sources: state.sources, video: state.video, params, util, setStatus: t => (status.textContent = t) };
      const size = cfg.size ? cfg.size(api) : defaultSize(api);
      if (canvas.width !== size.w || canvas.height !== size.h) { canvas.width = size.w; canvas.height = size.h; }
      cfg.render(api);
    }
    function defaultSize({ sources, video }) {
      const s = video ? { width: video.videoWidth, height: video.videoHeight } : sources[0];
      const k = Math.min(1, (cfg.maxSize || 1600) / Math.max(s.width, s.height));
      return { w: Math.round(s.width * k) || 1, h: Math.round(s.height * k) || 1 };
    }

    // ---- export
    function exportImage() {
      if (canvas.classList.contains('fe-hidden')) return;
      const type = cfg.exportType || 'image/png';
      canvas.toBlob(b => {
        const a = el('a', { href: URL.createObjectURL(b), download: (cfg.exportName || cfg.id) + (type === 'image/jpeg' ? '.jpg' : '.png') });
        document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      }, type, 0.92);
    }
    function toggleTheme() {
      const light = document.documentElement.dataset.theme !== 'light';
      document.documentElement.dataset.theme = light ? 'light' : '';
      try { localStorage.setItem('fe:theme', light ? 'light' : 'dark'); } catch (e) {}
    }

    return { draw, params, state, util };
  }

  global.FotoEsqueleto = { create, util };
})(window);
