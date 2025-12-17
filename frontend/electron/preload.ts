import { contextBridge } from 'electron'

// Güvenli API'leri renderer process'e expose et
contextBridge.exposeInMainWorld('electronAPI', {
    // Gerekirse buraya API'ler eklenebilir
    platform: process.platform,
})

