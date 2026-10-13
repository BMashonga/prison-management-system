import { useState } from "react"
import { useAuth } from "../context/AuthContext"

export default function LoginForm() {
    const { login, loading } = useAuth()
    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
        rememberMe: false
    })
    const [errorMessage, setErrorMessage] = useState("")
    const [passwordShown, setPasswordShown] = useState(false)
    const [message, setMessage] = useState("")

    const handleChange = (e) => {
        setCredentials({...credentials, [e.target.name]: e.target.value})
    };

    const toggleRemember = () => {
        setCredentials({...credentials, rememberMe: !credentials.rememberMe})
        console.log(credentials.rememberMe);
    };

    const togglePassword = () => {
        setPasswordShown(!passwordShown)
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage("")
        try {
            await login(credentials);
            alert("Login successful");
        } catch (error) {
            console.error('Error creating user:', error);
            setErrorMessage(error.response?.data.message ||  "invalid email or password");
        }
    }

    return (
        <div className = "flex flex-col mx-auto gap-5 w-[20em] my-[5em] text-start">
            <h1 className="text-2xl font-bold text-center">Login Form</h1>
            <div className="flex flex-col gap-2">
                <label htmlFor="email">Email</label>
                <input required onChange={(e) => {setCredentials({...credentials, email: e.target.value})}}  placeholder = "Enter your email" type="email" id="email" className="white text-white border-[white] border-1 rounded-md p-2" />
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="password">Password</label>

                {/* Syntax for boolean conditional rendering
                    {variable ? (true) : (false)}
                */}
                {passwordShown ? ( <div className="flex flex-col gap-2">
                    <input  onChange={(e) => {setCredentials({...credentials, password: e.target.value})}} placeholder="Enter your password" type="text" id="password" className="white text-white border-[white] border-1 rounded-md p-2" />
                    <button className = "text-end " onClick={togglePassword}>Hide</button>
                </div>
                    
                ) : ( <div className="flex flex-col gap-2">
                    <input onChange={(e) => {setCredentials({...credentials, password: e.target.value})}}  placeholder="*********" type="password" id="password" className="white text-white border-[white] border-1 rounded-md p-2" />
                    <button className = "text-end"  onClick={togglePassword}>Show</button>
                </div>
                )}
            </div>  

            <div className = "w-full">
                <div className = "gap-x-1 flex items-center py-5">
                    <input onChange={(e) => {setCredentials({...credentials, rememberMe: e.target.checked})}} className="p-5 p-3" type="checkbox" name="remember-me" id="remember-me" />
                    <label className = "text-sm" htmlFor="remember-me">Remember me</label>
                </div>
                <button onClick={(e) => handleSubmit(e)} className="hover:bg-[#ED9E43] animate-fill-white animate-in duration-500 white text-white border-[white] border-1 rounded-md p-2 w-full">Login</button>
                <div className = "my-2">
                    <p>Forgot password?</p>
                    
                </div>      
            </div>
        </div>
    );
}