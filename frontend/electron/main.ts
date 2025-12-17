import { app, BrowserWindow } from 'electron'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

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

function createWindow() {
    const mainWindow = new BrowserWindow({
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
        mainWindow.show()
    })

    // Development modunda Vite dev server'a, production'da build'e bağlan
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173')
        mainWindow.webContents.openDevTools() // Dev tools'u aç
    } else {
        mainWindow.loadFile(join(__dirname, '../dist/index.html'))
    }
}

