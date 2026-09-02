// Real Over-The-Air (OTA) Bundle Manager for Class 12 Commerce Study
// Validated for Web, Windows Desktop (Electron), and Android (Capacitor)

export const BUILTIN_APP_VERSION = '1.0.0';
export const LIVE_BASE_URL = 'https://sixthguest56226-cloud.github.io/class12-commerce-d2s/';

export function isNewerVersion(remoteStr, currentStr) {
  if (!remoteStr || !currentStr) return false;
  const remoteParts = remoteStr.split('.').map((n) => parseInt(n, 10) || 0);
  const currentParts = currentStr.split('.').map((n) => parseInt(n, 10) || 0);
  const maxLength = Math.max(remoteParts.length, currentParts.length);

  for (let i = 0; i < maxLength; i++) {
    const r = remoteParts[i] || 0;
    const c = currentParts[i] || 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return false;
}

export function getActiveOtaVersion() {
  if (typeof window !== 'undefined' && window.__OTA_ACTIVE_VERSION__) {
    return window.__OTA_ACTIVE_VERSION__;
  }
  try {
    const stored = localStorage.getItem('ota_active_version');
    if (stored) return stored;
    const bundleRaw = localStorage.getItem('ota_active_bundle');
    if (bundleRaw) {
      const b = JSON.parse(bundleRaw);
      if (b && b.version) return b.version;
    }
  } catch (e) {}
  return BUILTIN_APP_VERSION;
}

export function getDeferredOtaVersion() {
  try {
    return localStorage.getItem('ota_deferred_version') || null;
  } catch (e) {
    return null;
  }
}

export function setDeferredOtaVersion(version) {
  try {
    localStorage.setItem('ota_deferred_version', version);
  } catch (e) {}
}

export function clearDeferredOtaVersion() {
  try {
    localStorage.removeItem('ota_deferred_version');
  } catch (e) {}
}

export function getOtaDiagnostics() {
  return {
    activeVersion: getActiveOtaVersion(),
    remoteVersion: window.__OTA_REMOTE_VERSION__ || 'unknown',
    deferredVersion: getDeferredOtaVersion() || 'none',
    downloadStatus: window.__OTA_DOWNLOAD_STATUS__ || 'idle',
    activationStatus: window.__OTA_ACTIVATION_STATUS__ || 'idle',
    lastUpdateResult: localStorage.getItem('ota_last_result') || 'none',
    bootMode: window.__OTA_BOOT_MODE__ || 'BUILTIN',
  };
}

/**
 * Downloads and validates a new production bundle, storing it in localStorage for dynamic booting.
 */
export async function downloadAndActivateOtaBundle(remoteVersion) {
  window.__OTA_DOWNLOAD_STATUS__ = 'downloading';
  window.__OTA_ACTIVATION_STATUS__ = 'pending';

  try {
    // 1. Fetch remote index.html with cache-busting
    const htmlUrl = `${LIVE_BASE_URL}index.html?t=${Date.now()}`;
    const htmlRes = await fetch(htmlUrl, { cache: 'no-store' });
    if (!htmlRes.ok) throw new Error(`Failed to fetch index.html: HTTP ${htmlRes.status}`);
    const htmlText = await htmlRes.text();

    // 2. Extract asset paths (JS and CSS)
    const jsMatches = Array.from(htmlText.matchAll(/(?:href|src)=["']\.\/assets\/([^"']+\.js)["']/g)).map((m) => m[1]);
    const cssMatches = Array.from(htmlText.matchAll(/(?:href|src)=["']\.\/assets\/([^"']+\.css)["']/g)).map((m) => m[1]);

    if (jsMatches.length === 0) {
      throw new Error('No production JavaScript bundle found in remote index.html');
    }

    // 3. Download the actual main JS bundle
    const jsUrl = `${LIVE_BASE_URL}assets/${jsMatches[0]}?t=${Date.now()}`;
    const jsRes = await fetch(jsUrl, { cache: 'no-store' });
    if (!jsRes.ok) throw new Error(`Failed to fetch JS bundle ${jsMatches[0]}: HTTP ${jsRes.status}`);
    const jsCode = await jsRes.text();

    if (!jsCode || jsCode.length < 5000) {
      throw new Error(`Downloaded JS bundle appears corrupt or too small (${jsCode?.length || 0} bytes)`);
    }

    // 4. Download CSS bundle if present
    let cssCode = '';
    if (cssMatches.length > 0) {
      const cssUrl = `${LIVE_BASE_URL}assets/${cssMatches[0]}?t=${Date.now()}`;
      const cssRes = await fetch(cssUrl, { cache: 'no-store' });
      if (cssRes.ok) {
        cssCode = await cssRes.text();
      }
    }

    window.__OTA_DOWNLOAD_STATUS__ = 'verified';

    // 5. Safely persist the new bundle into localStorage
    const bundleData = {
      version: remoteVersion,
      js: jsCode,
      css: cssCode,
      timestamp: Date.now(),
    };

    localStorage.setItem('ota_active_bundle', JSON.stringify(bundleData));
    localStorage.setItem('ota_active_version', remoteVersion);
    localStorage.setItem('ota_last_result', 'SUCCESS');
    clearDeferredOtaVersion();

    window.__OTA_ACTIVATION_STATUS__ = 'activated';
    console.log(`[OTA] Bundle v${remoteVersion} downloaded, verified, and saved to localStorage.`);
    return { success: true, version: remoteVersion };
  } catch (err) {
    console.error('[OTA] Bundle download failed:', err);
    window.__OTA_DOWNLOAD_STATUS__ = 'failed';
    window.__OTA_ACTIVATION_STATUS__ = 'failed';
    localStorage.setItem('ota_last_result', `FAILED: ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * Boots the application: checks for an active OTA bundle and dynamically runs it,
 * or falls back to mounting the built-in bundle.
 */
export async function bootApp(mountBuiltinCallback) {
  try {
    const raw = localStorage.getItem('ota_active_bundle');
    if (raw) {
      const bundle = JSON.parse(raw);
      if (bundle && bundle.js && bundle.version && bundle.version !== BUILTIN_APP_VERSION) {
        // Inject dynamic CSS
        if (bundle.css) {
          const style = document.createElement('style');
          style.id = 'ota-active-css';
          style.textContent = bundle.css;
          document.head.appendChild(style);
        }

        // Create Blob URL and dynamically import the updated module
        const blob = new Blob([bundle.js], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        window.__OTA_ACTIVE_VERSION__ = bundle.version;
        window.__OTA_BOOT_MODE__ = 'DYNAMIC';

        console.log(`[OTA] Booting dynamic OTA bundle v${bundle.version}...`);
        await import(/* @vite-ignore */ blobUrl);
        console.log(`[OTA] Dynamic bundle v${bundle.version} loaded and executing.`);
        return; // Early return: dynamic bundle mounted itself
      }
    }
  } catch (err) {
    console.warn('[OTA] Error booting dynamic bundle, falling back to built-in:', err);
  }

  // Fallback to built-in bundle
  window.__OTA_ACTIVE_VERSION__ = BUILTIN_APP_VERSION;
  window.__OTA_BOOT_MODE__ = 'BUILTIN';
  if (typeof mountBuiltinCallback === 'function') {
    mountBuiltinCallback();
  }
}
