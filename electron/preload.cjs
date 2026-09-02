const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  applyLiveUpdate: (remoteVersion) => ipcRenderer.invoke('apply-live-update', remoteVersion)
});
