import { useState, type FormEvent } from 'react'
import { Alert, AppBar, Box, Button, Chip, CssBaseline, Drawer, InputAdornment, List, ListItemButton, ListItemText, Paper, Stack, SvgIcon, TextField, ThemeProvider, Toolbar, Typography, createTheme } from '@mui/material'
import { roleLabels, type Permission } from './access'
import { useAuth } from './auth/AuthContext'
import { InmateManagement } from './features/inmates/InmateManagement'
import './App.css'

const theme = createTheme({
  palette: {
    primary: { main: '#031b35', contrastText: '#ffffff' }, secondary: { main: '#176da8', contrastText: '#ffffff' },
    info: { main: '#176da8' }, success: { main: '#5280ad' }, warning: { main: '#d87123', contrastText: '#ffffff' }, error: { main: '#b72222' },
    background: { default: '#f7f8fa', paper: '#ffffff' },
  },
  shape: { borderRadius: 4 },
})

type View = 'inmates'
type NavIconName = 'inmates' | 'custody' | 'transfers' | 'visitors' | 'releases' | 'access'
const navigation: { view: View; label: string; permission: Permission; icon: NavIconName }[] = [
  { view: 'inmates', label: 'Inmate Management', permission: 'inmates.view', icon: 'inmates' },
]

function Icon({ name }: { name: NavIconName | 'info' | 'account' }) {
  const paths = {
    inmates: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
    custody: 'M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm5.2 12H6.8c.42-2.3 2.55-4 5.2-4s4.78 1.7 5.2 4z',
    transfers: 'M7 7h10l-3-3 1.41-1.41L20.83 8l-5.42 5.41L14 12l3-3H7V7zm10 10H7l3 3-1.41 1.41L3.17 16l5.42-5.41L10 12l-3 3h10v2z',
    visitors: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
    releases: 'M10 17v-2h4v-3l5 4-5 4v-3h-4zm-5-12h10V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10v-2H5V5z',
    access: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h10v-2.5C11 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
    info: 'M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-11h2V7h-2v2z',
    account: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  }
  return <SvgIcon aria-hidden="true" viewBox="0 0 24 24"><path d={paths[name]} /></SvgIcon>
}

function Login() {
  const { error, login, status } = useAuth()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [showPassword, setShowPassword] = useState(false)
  const submit = async (event: FormEvent) => { event.preventDefault(); await login(email, password) }
  return <Box className="login-shell"><Paper component="main" className="login-card" elevation={0}><Box className="login-heading"><Typography component="h1" variant="h5">Welcome to PMS</Typography><Typography>Log in to access inmate records.</Typography></Box>{error && <Alert severity="error">{error}</Alert>}<Box component="form" className="login-form" onSubmit={submit}><TextField required label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /><TextField required label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} slotProps={{ input: { endAdornment: <InputAdornment position="end"><Button aria-label={showPassword ? 'Hide password' : 'Show password'} className="password-toggle" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Hide' : 'Show'}</Button></InputAdornment> } }} /><Button className="login-button" disabled={status === 'loading'} type="submit" variant="contained">{status === 'loading' ? 'Logging in…' : 'Log in'}</Button></Box></Paper></Box>
}

function Workspace() {
  const { has, user } = useAuth()
  const available = navigation.filter((item) => has(item.permission))
  const [view, setView] = useState<View>(available[0]?.view ?? 'inmates')
  return <Box className="corp-shell">
    <AppBar className="corp-topbar" elevation={0} position="fixed"><Toolbar><Box sx={{ flexGrow: 1 }} /><Chip className="role-chip" label={roleLabels[user!.role]} size="small" /><Button className="account-button" aria-label="Account"><Icon name="account" /></Button></Toolbar></AppBar>
    <Drawer className="corp-sidebar" PaperProps={{ className: 'corp-sidebar-paper' }} variant="permanent"><Box className="brand"><Box className="brand-mark">⌂</Box></Box><List aria-label="Inmate management navigation">{available.map((item) => <ListItemButton key={item.view} className="corp-nav-item" onClick={() => setView(item.view)} selected={view === item.view}><span className="nav-symbol"><Icon name={item.icon} /></span><ListItemText primary={item.label} /></ListItemButton>)}</List></Drawer>
    <Box component="main" className="corp-main"><Toolbar /><InmateManagement canAdmit={has('inmates.admit')} /></Box>
  </Box>
}

function App() { const { status } = useAuth(); return <ThemeProvider theme={theme}><CssBaseline />{status === 'authenticated' ? <Workspace /> : <Login />}</ThemeProvider> }
export default App
