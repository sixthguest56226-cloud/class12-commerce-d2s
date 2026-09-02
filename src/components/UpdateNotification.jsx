import React, { useState, useEffect } from 'react';
import { DownloadCloud, X, RefreshCw } from 'lucide-react';
import { downloadAndActivateOtaBundle } from '../utils/otaUpdater';

const CURRENT_APP_VERSION = '1.0.0';
const REMOTE_MANIFEST_URL = 'https://raw.githubusercontent.com/sixthguest56226-cloud/class12-commerce-d2s/main/public/version.json';

// Helper for strict semantic version comparison (e.g. "1.0.1" > "1.0.0")
export function isNewerVersion(remoteStr, currentStr) {
  if (!remoteStr || !currentStr) return false;
  const remoteParts = remoteStr.split('.').map(n => parseInt(n, 10) || 0);
  const currentParts = currentStr.split('.').map(n => parseInt(n, 10) || 0);
  const maxLength = Math.max(remoteParts.length, currentParts.length);

  for (let i = 0; i < maxLength; i++) {
    const r = remoteParts[i] || 0;
    const c = currentParts[i] || 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return false;
}

export default function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [remoteVersion, setRemoteVersion] = useState('');
  const [dismissed, setDismissed] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function checkForUpdates() {
      try {
        let res = null;
        try {
          res = await fetch(`${REMOTE_MANIFEST_URL}?t=${Date.now()}`, { cache: 'no-store' });
        } catch (e) {
          res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
        }

        if (res && res.ok) {
          const data = await res.json();
          if (data.version && isNewerVersion(data.version, CURRENT_APP_VERSION)) {
            setRemoteVersion(data.version);
            setUpdateAvailable(true);
          }
        }
      } catch (err) {
        // Silent catch for offline status or network errors
      }
    }

    checkForUpdates();
    const interval = setInterval(checkForUpdates, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateNow = async () => {
    setIsUpdating(true);
    try {
      // 1. If running inside Electron desktop app, invoke IPC live update
      if (window.electronAPI && typeof window.electronAPI.applyLiveUpdate === 'function') {
        const res = await window.electronAPI.applyLiveUpdate(remoteVersion);
        if (res && res.success) return;
      }

      // 2. For Android / Web: Download and store updated bundle locally
      const otaRes = await downloadAndActivateOtaBundle(remoteVersion);
      if (otaRes && otaRes.success) {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (let registration of registrations) {
            await registration.unregister();
          }
        }
        window.location.reload(true);
        return;
      }

      window.location.reload(true);
    } catch (e) {
      window.location.reload(true);
    }
  };

  if (!updateAvailable || dismissed) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:max-w-md z-50 bg-[#101C2D] dark:bg-[#101C2D] text-white border border-[#1E2E46] rounded-2xl p-4 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#315E8C]/20 border border-[#315E8C]/40 text-[#4FA19B] flex items-center justify-center shrink-0">
            <DownloadCloud className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#3E7C78]/20 text-[#4FA19B] border border-[#3E7C78]/30">
              New Update Available
            </span>
            <h4 className="font-bold text-sm text-slate-100 pt-0.5">
              Version {remoteVersion} is ready
            </h4>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#142238] transition-colors"
          title="Later"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed font-medium">
        A new update for Class 12 Commerce is available. Your personal notes, streaks, and scores will remain completely safe.
      </p>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => setDismissed(true)}
          className="flex-1 py-2 px-3 rounded-xl border border-[#1E2E46] text-xs font-semibold text-slate-300 hover:bg-[#142238] transition-colors"
        >
          Later
        </button>
        <button
          onClick={handleUpdateNow}
          disabled={isUpdating}
          className="flex-1 py-2 px-3 rounded-xl bg-[#315E8C] hover:bg-[#25496F] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
        >
          {isUpdating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <span>Update Now</span>
          )}
        </button>
      </div>
    </div>
  );
}
