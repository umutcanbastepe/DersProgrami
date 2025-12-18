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
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI
    }
}

