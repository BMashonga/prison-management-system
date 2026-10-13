import { useState } from 'react'
import Login from './pages/Login'
import './App.css'
import { AuthProvider } from './context/AuthContext'

function App() {
  const [count, setCount] = useState(0)
  const [currentPath, setCurrentPath] = useState('/')

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  return (
    <AuthProvider>
      <Login />
    </AuthProvider>
  )
}

export default App
