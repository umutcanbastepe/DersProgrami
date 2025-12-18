import { contextBridge, ipcRenderer } from 'electron'

// Güvenli API'leri renderer process'e expose et
contextBridge.exposeInMainWorld('electronAPI', {
    platform: process.platform,
    printToPDF: (fileName: string) => ipcRenderer.invoke('print-to-pdf', fileName),
})

