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
        icon: join(
            __dirname,
            app.isPackaged ? '../dist/icon.png' : '../public/icon.png',
        ),
        titleBarStyle: 'default',
        show: false, // Pencere hazır olana kadar gizle
    })

    // Pencere hazır olduğunda göster ve maksimize et
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show()
        mainWindow?.maximize() // Pencereyi maksimize et
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
            // Sayfanın tam yüklendiğinden ve render edildiğinden emin ol
            if (!mainWindow) return { success: false, error: 'Window not found' }

            // Pencere görünür olmalı (gizli pencerelerde printToPDF çalışmayabilir)
            if (!mainWindow.isVisible()) {
                mainWindow.show()
            }

            // Sayfa yüklenmesini bekle
            if (mainWindow.webContents.isLoading()) {
                await new Promise<void>((resolve) => {
                    mainWindow!.webContents.once('did-finish-load', resolve)
                })
            }

            // Render'ın tamamlanması için JavaScript ile kontrol et
            await mainWindow.webContents.executeJavaScript(`
                new Promise((resolve) => {
                    // DOM'un hazır olduğundan emin ol
                    if (document.readyState === 'complete') {
                        // requestAnimationFrame ile render'ın tamamlanmasını bekle
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                // Tablo container'ın var olduğundan emin ol
                                const tableContainer = document.querySelector('.MuiTableContainer-root');
                                if (tableContainer && tableContainer.offsetHeight > 0) {
                                    resolve(true);
                                } else {
                                    // Tablo henüz render edilmemiş, biraz daha bekle
                                    setTimeout(() => resolve(true), 1000);
                                }
                            });
                        });
                    } else {
                        window.addEventListener('load', () => {
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    setTimeout(() => resolve(true), 1000);
                                });
                            });
                        });
                    }
                });
            `)

            // PDF'i dialog açılmadan ÖNCE oluştur
            // Dialog açıldığında sayfa durumu değişebilir ve "content area is empty" hatası alınabilir
            // Not: Margin'ler inch cinsinden (1 inch = 25.4mm)
            // CSS'deki @page margin: 5mm ile uyumlu olması için 0.2 inch (yaklaşık 5mm) kullanıyoruz
            const pdfData = await mainWindow.webContents.printToPDF({
                landscape: true, // Varsayılan yönlendirme: yatay
                margins: {
                    top: 0.2,    // ~5mm
                    bottom: 0.2, // ~5mm
                    left: 0.2,   // ~5mm
                    right: 0.2,  // ~5mm
                },
                printBackground: true,
                pageSize: 'A4',
            })

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

            // Dosyaya yaz
            await writeFile(filePath, pdfData)

            return { success: true, filePath }
        } catch (error) {
            console.error('PDF oluşturma hatası:', error)
            return { success: false, error: String(error) }
        }
    })
}

