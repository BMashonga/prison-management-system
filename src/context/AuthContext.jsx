import { authService } from "../api/authService"
import { useState, createContext, useContext } from "react"

export const AuthContext = createContext(null);

export function AuthProvider({children}) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    })

    const [token, setToken] = useState(() => {
        const savedToken = localStorage.getItem('token');
        return savedToken ? savedToken : null;
    })
    const [loading, setLoading] = useState(false);


    const login = async (credentials) => {
    setLoading(true)
    try {
        //data should contain  { token, user }
        const data = await authService.login(credentials)
        // data should contain user and token
        setUser(data.user)
        setToken(data.token)

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        return data;
    } finally {
        setLoading(false)
    }};

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    return (
        <AuthContext.Provider value={{user, token, isAuthenticated: !!token, loading, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
 