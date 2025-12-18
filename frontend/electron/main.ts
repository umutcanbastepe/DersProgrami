import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { writeFile } from 'fs/promises'
import { homedir } from 'os'

// ESM için __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Electron uygulaması hazır olduğunda
app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        // macOS'ta dock'a tıklandığında pencere yoksa yeni pencere aç
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

// Tüm pencereler kapatıldığında (macOS hariç)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

let mainWindow: BrowserWindow | null = null

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: join(__dirname, '../public/vite.svg'), // İkon dosyası
        titleBarStyle: 'default',
        show: false, // Pencere hazır olana kadar gizle
    })

    // Pencere hazır olduğunda göster
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show()
    })

    // Development modunda Vite dev server'a, production'da build'e bağlan
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173')
        mainWindow.webContents.openDevTools() // Dev tools'u aç
    } else {
        mainWindow.loadFile(join(__dirname, '../dist/index.html'))
    }

    // Print dialog handler'ı (sistem print dialog'unu açar)
    ipcMain.handle('print-dialog', async (_, fileName: string) => {
        if (!mainWindow) return { success: false, error: 'Window not found' }

        try {
            // Sistem print dialog'unu aç
            // Not: Electron'da print dialog'u açmak için webContents.print() kullanılır
            // Ancak bu doğrudan PDF'e kaydetme seçeneği sunmaz
            // Bu yüzden önce print options'ı ayarlayıp sonra print dialog'unu açıyoruz

            // Print options'ı ayarla (landscape için)
            const printOptions = {
                silent: false,
                printBackground: true,
                deviceName: 'Save as PDF', // PDF'e kaydet seçeneğini öner
            }

            // Print dialog'unu aç
            mainWindow.webContents.print(printOptions, (success, failureReason) => {
                if (!success) {
                    console.error('Print failed:', failureReason)
                }
            })

            return { success: true }
        } catch (error) {
            console.error('Print dialog hatası:', error)
            return { success: false, error: String(error) }
        }
    })

    // PDF oluşturma handler'ı (doğrudan PDF oluşturur)
    ipcMain.handle('print-to-pdf', async (_, fileName: string) => {
        if (!mainWindow) return { success: false, error: 'Window not found' }

        try {
            // Masaüstü yolunu al ve dosya adını tam yol olarak hazırla
            const desktopPath = join(homedir(), 'Desktop')
            const fullPath = join(desktopPath, fileName)

            // Dosya kaydetme dialog'u - dosya adı otomatik doldurulur
            const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
                title: 'Yazdır - PDF Olarak Kaydet',
                defaultPath: fullPath, // Dosya adı otomatik doldurulur (tam yol ile)
                filters: [
                    { name: 'PDF Dosyaları', extensions: ['pdf'] },
                    { name: 'Tüm Dosyalar', extensions: ['*'] },
                ],
            })

            if (canceled || !filePath) {
                return { success: false, canceled: true }
            }

            // PDF oluştur - varsayılan olarak landscape (yatay)
            const pdfData = await mainWindow.webContents.printToPDF({
                landscape: true, // Varsayılan yönlendirme: yatay
                margins: {
                    top: 5,
                    bottom: 5,
                    left: 5,
                    right: 5,
                },
                printBackground: true,
            })

            // Dosyaya yaz
            await writeFile(filePath, pdfData)

            return { success: true, filePath }
        } catch (error) {
            console.error('PDF oluşturma hatası:', error)
            return { success: false, error: String(error) }
        }
    })
}

