// OTA Bundle Downloader & Local Storage Cache for Web / Capacitor Android

const BASE_URL = 'https://raw.githubusercontent.com/sixthguest56226-cloud/class12-commerce-d2s/main/dist/';

export async function downloadAndActivateOtaBundle(remoteVersion) {
  try {
    // 1. Fetch remote index.html
    const htmlRes = await fetch(`${BASE_URL}index.html?t=${Date.now()}`, { cache: 'no-store' });
    if (!htmlRes.ok) throw new Error(`HTTP ${htmlRes.status}`);
    const htmlText = await htmlRes.text();

    // 2. Extract asset filenames (JS & CSS)
    const matches = Array.from(htmlText.matchAll(/(?:href|src)=["']\.\/assets\/([^"']+)["']/g)).map(m => m[1]);
    const jsFiles = matches.filter(f => f.endsWith('.js'));
    const cssFiles = matches.filter(f => f.endsWith('.css'));

    // 3. Download JS and CSS content
    const jsContents = [];
    for (const file of jsFiles) {
      const res = await fetch(`${BASE_URL}assets/${file}?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        jsContents.push(await res.text());
      }
    }

    const cssContents = [];
    for (const file of cssFiles) {
      const res = await fetch(`${BASE_URL}assets/${file}?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        cssContents.push(await res.text());
      }
    }

    if (jsContents.length > 0) {
      // Store updated bundle in localStorage
      const bundleData = {
        version: remoteVersion,
        timestamp: Date.now(),
        js: jsContents.join('\n;\n'),
        css: cssContents.join('\n;\n')
      };
      localStorage.setItem('ota_active_bundle', JSON.stringify(bundleData));
      return { success: true };
    }
    return { success: false };
  } catch (err) {
    console.error('OTA Bundle Download failed:', err);
    return { success: false, error: err.message };
  }
}

export function initializeOtaBundle() {
  try {
    const raw = localStorage.getItem('ota_active_bundle');
    if (!raw) return;
    const bundle = JSON.parse(raw);
    if (!bundle || !bundle.js) return;

    // Inject CSS bundle if present
    if (bundle.css) {
      const styleEl = document.createElement('style');
      styleEl.id = 'ota-bundle-css';
      styleEl.textContent = bundle.css;
      document.head.appendChild(styleEl);
    }

    // Inject JS bundle if present
    const scriptEl = document.createElement('script');
    scriptEl.id = 'ota-bundle-js';
    scriptEl.textContent = bundle.js;
    document.body.appendChild(scriptEl);
    console.log(`Active OTA Bundle loaded (v${bundle.version})`);
  } catch (e) {
    console.warn('Could not initialize OTA bundle, using built-in bundle:', e);
  }
}
