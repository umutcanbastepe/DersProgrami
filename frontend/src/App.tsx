import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { muiTheme } from './theme/muiTheme'
import { Layout } from './components/Layout'
import { TimetablePage } from './pages/TimetablePage'
import { NotificationProvider } from './contexts/NotificationContext'

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 5mm;
          }
          body {
            margin: 0;
            padding: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
          }
          * {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
      <NotificationProvider>
        <Layout>
          <TimetablePage />
        </Layout>
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default App
