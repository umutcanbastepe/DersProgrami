import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { muiTheme } from './theme/muiTheme'
import { Layout } from './components/Layout'
import { TimetablePage } from './pages/TimetablePage'

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Layout>
        <TimetablePage />
      </Layout>
    </ThemeProvider>
  )
}

export default App
