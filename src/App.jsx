import Login from './pages/Login'
import './App.css'
import { AuthProvider } from './context/AuthContext'

function App() {

  return (
    <AuthProvider>
      <Login />
    </AuthProvider>
  )
}

export default App
