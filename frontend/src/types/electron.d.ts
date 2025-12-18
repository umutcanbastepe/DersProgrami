export interface ElectronAPI {
    platform: string
    printToPDF: (fileName: string) => Promise<{
        success: boolean
        canceled?: boolean
        filePath?: string
        error?: string
    }>
    print: (fileName: string) => Promise<{
        success: boolean
        error?: string
    }>
    notifyReadyForPrint: () => void
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI
    }
}

