import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { AppShell } from './components/AppShell'
import './App.css'

const theme = createTheme({
  palette: {
    primary: { main: '#031b35', contrastText: '#ffffff' }, secondary: { main: '#176da8', contrastText: '#ffffff' },
    info: { main: '#176da8' }, success: { main: '#5280ad' }, warning: { main: '#d87123', contrastText: '#ffffff' }, error: { main: '#b72222' },
    background: { default: '#f7f8fa', paper: '#ffffff' },
  },
  shape: { borderRadius: 4 },
})

function App() { return <ThemeProvider theme={theme}><CssBaseline /><AppShell /></ThemeProvider> }

export default App
