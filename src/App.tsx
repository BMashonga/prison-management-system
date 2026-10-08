import { useState, type FormEvent } from 'react'
import {
  Alert, AppBar, Box, Button, Chip, CssBaseline, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Divider, Drawer, FormControl,
  InputAdornment, List, ListItemButton, ListItemText, Paper,
  Stack, TextField, ThemeProvider, Toolbar, Typography, createTheme,
} from '@mui/material'
import { roleLabels, type Permission } from './access'
import { useAuth } from './auth/AuthContext'
import './App.css'

const theme = createTheme({
  palette: { primary: { main: '#1f5f4a' }, secondary: { main: '#b26a00' }, background: { default: '#f5f7f6' } },
  shape: { borderRadius: 10 },
})

type View = 'dashboard' | 'inmates' | 'admissions' | 'custody' | 'transfers' | 'visitors' | 'releases'
const navigation: { view: View; label: string; permission: Permission }[] = [
  { view: 'dashboard', label: 'Dashboard', permission: 'dashboard.view' },
  { view: 'inmates', label: 'Inmate records', permission: 'inmates.view' },
  { view: 'admissions', label: 'Admissions', permission: 'inmates.admit' },
  { view: 'custody', label: 'Sentence & custody', permission: 'custody.view' },
  { view: 'transfers', label: 'Transfers', permission: 'transfers.view' },
  { view: 'visitors', label: 'Visitors', permission: 'visitors.view' },
  { view: 'releases', label: 'Release & discharge', permission: 'releases.view' },
]
const screens: Record<View, { title: string; description: string; action?: { label: string; permission: Permission; sensitive?: boolean } }> = {
  dashboard: { title: 'Operations dashboard', description: 'A summary appropriate to your operational responsibilities.' },
  inmates: { title: 'Inmate records', description: 'Search and view records within your permitted data scope.', action: { label: 'Update permitted record', permission: 'inmates.update' } },
  admissions: { title: 'Inmate admissions', description: 'Record admission information and route it for required review.', action: { label: 'Record admission', permission: 'inmates.admit' } },
  custody: { title: 'Sentence & custody', description: 'Review only sentence and custody information assigned to your role.', action: { label: 'Update custody information', permission: 'custody.update' } },
  transfers: { title: 'Transfer management', description: 'Track transfers and record operations assigned to you.', action: { label: 'Initiate transfer', permission: 'transfers.create' } },
  visitors: { title: 'Visitor management', description: 'Register visitors and record visitation entry and exit details.', action: { label: 'Register visitor', permission: 'visitors.manage' } },
  releases: { title: 'Release & discharge', description: 'Review release eligibility and discharge information within your authority.', action: { label: 'Authorize release', permission: 'releases.authorize', sensitive: true } },
}

function Login() {
  const { error, login, status } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const submit = async (event: FormEvent) => { event.preventDefault(); await login(email, password) }
  return <Box className="login-shell"><Paper component="main" className="login-card" elevation={0}>
    <Box className="login-heading"><Typography component="h1" variant="h5">Welcome to PMS</Typography><Typography>log into the system to work the day</Typography></Box>
    {error && <Alert severity="error">{error}</Alert>}
    <Box component="form" className="login-form" onSubmit={submit}>
      <TextField required label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      <TextField required label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} slotProps={{ input: { endAdornment: <InputAdornment position="end"><Button aria-label={showPassword ? 'Hide password' : 'Show password'} className="password-toggle" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Hide' : 'Show'}</Button></InputAdornment> } }} />
      <Button className="login-button" disabled={status === 'loading'} type="submit" variant="contained">{status === 'loading' ? 'Logging in…' : 'Log In'}</Button>
    </Box>
    <Typography className="forgot-password">Forgot password? click <Button>here</Button> to reset.</Typography>
  </Paper></Box>
}

function Dashboard() {
  return <Box className="summary-grid">{[['Records requiring review', '12'], ['Transfers in progress', '4'], ['Today’s scheduled visits', '18']].map(([label, value]) => <Paper key={label} sx={{ p: 2.5 }} variant="outlined"><Typography color="text.secondary" variant="body2">{label}</Typography><Typography color="primary" variant="h4">{value}</Typography></Paper>)}</Box>
}

function Workspace() {
  const { has, logout, permissions, user } = useAuth()
  const available = navigation.filter((item) => has(item.permission))
  const [view, setView] = useState<View>(available[0]?.view ?? 'inmates')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const screen = screens[view]
  const action = screen.action && has(screen.action.permission) ? screen.action : null
  const completeAction = () => { setConfirmOpen(false); setNotice(`${screen.title}: action recorded for review.`) }
  return <Box sx={{ display: 'flex', minHeight: '100vh' }}>
    <AppBar position="fixed" sx={{ zIndex: (item) => item.zIndex.drawer + 1 }}><Toolbar><Typography component="h1" sx={{ flexGrow: 1 }} variant="h6">Prison Management System</Typography><Chip color="success" label={roleLabels[user!.role]} size="small" sx={{ bgcolor: 'white' }} /><Button color="inherit" onClick={logout} sx={{ ml: 1 }}>Sign out</Button></Toolbar></AppBar>
    <Drawer PaperProps={{ sx: { boxSizing: 'border-box', width: 250 } }} variant="permanent"><Toolbar /><Box sx={{ p: 2 }}><Typography fontWeight={700}>{user!.name}</Typography><Typography color="text.secondary" variant="caption">Role-controlled workspace</Typography></Box><Divider /><List aria-label="Role-appropriate navigation">{available.map((item) => <ListItemButton key={item.view} onClick={() => { setView(item.view); setNotice(null) }} selected={view === item.view}><ListItemText primary={item.label} /></ListItemButton>)}</List></Drawer>
    <Box component="main" sx={{ flexGrow: 1, ml: '250px', p: { xs: 2, md: 4 } }}><Toolbar /><Stack spacing={3}>{notice && <Alert onClose={() => setNotice(null)} severity="success">{notice}</Alert>}<Box><Typography component="h2" variant="h4">{screen.title}</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>{screen.description}</Typography></Box>{view === 'dashboard' && <Dashboard />}<Paper sx={{ p: 3 }} variant="outlined"><Typography fontWeight={700} variant="h6">Available actions</Typography><Typography color="text.secondary" sx={{ mt: .5 }}>Only functions assigned to your role are displayed.</Typography><Box sx={{ mt: 2 }}>{action ? <Button onClick={() => action.sensitive ? setConfirmOpen(true) : completeAction()} variant="contained">{action.label}</Button> : <Chip label="No additional actions assigned" variant="outlined" />}</Box></Paper><Paper sx={{ p: 3 }} variant="outlined"><Typography fontWeight={700} variant="h6">Granted permissions</Typography><Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>{permissions.map((permission) => <Chip key={permission} label={permission} size="small" />)}</Stack></Paper></Stack></Box>
    <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}><DialogTitle>Authorize release?</DialogTitle><DialogContent><DialogContentText>This sensitive action will be recorded for audit and cannot be completed without your authorization.</DialogContentText></DialogContent><DialogActions><Button onClick={() => setConfirmOpen(false)}>Cancel</Button><Button color="error" onClick={completeAction} variant="contained">Confirm authorization</Button></DialogActions></Dialog>
  </Box>
}

function App() { const { status } = useAuth(); return <ThemeProvider theme={theme}><CssBaseline />{status === 'authenticated' ? <Workspace /> : <Login />}</ThemeProvider> }
export default App
