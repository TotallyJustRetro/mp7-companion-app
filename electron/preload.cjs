const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('companionDesktop', {
  getVersion: () => ipcRenderer.invoke('app:version'),
  getPlatform: () => ipcRenderer.invoke('app:platform'),
});
