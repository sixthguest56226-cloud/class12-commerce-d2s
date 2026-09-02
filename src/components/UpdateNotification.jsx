import React, { useState, useEffect } from 'react';
import { DownloadCloud, X, RefreshCw } from 'lucide-react';
import {
  downloadAndActivateOtaBundle,
  getActiveOtaVersion,
  getDeferredOtaVersion,
  setDeferredOtaVersion,
  isNewerVersion,
} from '../utils/otaUpdater';

export const REMOTE_MANIFEST_URL = 'https://sixthguest56226-cloud.github.io/class12-commerce-d2s/version.json';
}

export default function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [remoteVersion, setRemoteVersion] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [dismissed, setDismissed] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const activeVersion = getActiveOtaVersion();

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
          const remoteVer = data.version;
          window.__OTA_REMOTE_VERSION__ = remoteVer;

          if (remoteVer && isNewerVersion(remoteVer, activeVersion)) {
            // Check if user already deferred this exact version
            const deferred = getDeferredOtaVersion();
            if (deferred && !isNewerVersion(remoteVer, deferred)) {
              console.log(`[OTA] Update v${remoteVer} is available but previously deferred by user.`);
              setUpdateAvailable(false);
              return;
            }

            setRemoteVersion(remoteVer);
            setReleaseNotes(data.releaseNotes || '');
            setUpdateAvailable(true);
          } else {
            setUpdateAvailable(false);
          }
        }
      } catch (err) {
        // Silent catch for offline status or network errors
      } finally {
        // Expose runtime diagnostics
        window.__OTA_DIAGNOSTICS__ = {
          activeVersion,
          remoteVersion: window.__OTA_REMOTE_VERSION__ || 'none',
          deferredVersion: getDeferredOtaVersion() || 'none',
          downloadStatus: window.__OTA_DOWNLOAD_STATUS__ || 'idle',
          activationStatus: window.__OTA_ACTIVATION_STATUS__ || 'idle',
          lastUpdateResult: localStorage.getItem('ota_last_result') || 'none',
          bootMode: window.__OTA_BOOT_MODE__ || 'BUILTIN',
        };
        console.log('[OTA Diagnostics]', window.__OTA_DIAGNOSTICS__);
      }
    }

    checkForUpdates();
    const interval = setInterval(checkForUpdates, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeVersion]);

  const handleLater = () => {
    if (remoteVersion) {
      setDeferredOtaVersion(remoteVersion);
    }
    setDismissed(true);
    console.log(`[OTA] Deferred update v${remoteVersion}. Will not prompt again on restart for this version.`);
  };

  const handleUpdateNow = async () => {
    setIsUpdating(true);
    try {
      // 1. If running inside Electron desktop app, invoke IPC live update
      if (window.electronAPI && typeof window.electronAPI.applyLiveUpdate === 'function') {
        const res = await window.electronAPI.applyLiveUpdate(remoteVersion);
        if (res && res.success) return;
      }

      // 2. For Android / Web: Download and store updated bundle in localStorage
      const otaRes = await downloadAndActivateOtaBundle(remoteVersion);
      if (otaRes && otaRes.success) {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (let registration of registrations) {
            await registration.unregister();
          }
        }
        // Reload to let bootApp() dynamically mount the updated bundle
        window.location.reload();
        return;
      } else {
        alert('Update could not be installed: ' + (otaRes.error || 'Network error'));
        setIsUpdating(false);
      }
    } catch (e) {
      console.error('[OTA] Activation error:', e);
      setIsUpdating(false);
    }
  };

  if (!updateAvailable || dismissed) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:max-w-md z-50 bg-[#101C2D] text-white border border-[#1E2E46] rounded-2xl p-4 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
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
          onClick={handleLater}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#142238] transition-colors"
          title="Later"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed font-medium">
        {releaseNotes || 'A new update for Class 12 Commerce is available. Your personal notes, streaks, and scores remain completely safe.'}
      </p>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleLater}
          className="flex-1 py-2 px-3 rounded-xl border border-[#1E2E46] text-xs font-semibold text-slate-300 hover:bg-[#142238] transition-colors cursor-pointer"
        >
          Later
        </button>
        <button
          onClick={handleUpdateNow}
          disabled={isUpdating}
          className="flex-1 py-2 px-3 rounded-xl bg-[#315E8C] hover:bg-[#25496F] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
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
