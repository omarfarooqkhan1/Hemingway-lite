const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  openFile: () => ipcRenderer.invoke("file:open"),
  saveAs: (payload) => ipcRenderer.invoke("file:saveAs", payload),
  saveFile: (payload) => ipcRenderer.invoke("file:save", payload)
});