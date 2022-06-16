const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  send: (channel, ...args) => {
    ipcRenderer.send(channel, ...args);
  },
  invoke: (channel, ...args) => {
    return ipcRenderer.invoke(channel, ...args);
  },
});
