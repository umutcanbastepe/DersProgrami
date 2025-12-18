export interface ElectronAPI {
    platform: string
    printToPDF: (fileName: string) => Promise<{
        success: boolean
        canceled?: boolean
        filePath?: string
        error?: string
    }>
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI
    }
}

