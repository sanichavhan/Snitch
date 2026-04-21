import { setError, setLoading, setUser, clearUser } from "../state/auth.slice"
import { register, login, getMe, logout } from "../service/auth.api"
import { useDispatch } from "react-redux"



export const useAuth = () => {

    const dispatch = useDispatch()

    async function handleRegister({ email, contact, password, fullname, isSeller = false }) {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            
            // Validate inputs
            if (!email || !contact || !password || !fullname) {
                throw new Error("All fields are required")
            }

            const data = await register({ email, contact, password, fullname, isSeller })

            if (!data.success) {
                throw new Error(data.message || "Registration failed")
            }

            dispatch(setUser(data.user))
            return data.user
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Registration failed"
            dispatch(setError(errorMsg))
            throw new Error(errorMsg)
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))

            // Validate inputs
            if (!email || !password) {
                throw new Error("Email and password are required")
            }

            const data = await login({ email, password })

            if (!data.success) {
                throw new Error(data.message || "Login failed")
            }

            dispatch(setUser(data.user))
            return data.user
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Login failed"
            dispatch(setError(errorMsg))
            throw new Error(errorMsg)
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetMe() {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            const data = await getMe()
            
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch user")
            }
            
            dispatch(setUser(data.user))
        } catch (err) {
            console.log(err)
            dispatch(setError(err.message || "Failed to fetch user"))
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogout() {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            await logout()
            dispatch(clearUser())
            return true
        } catch (err) {
            const errorMsg = err.message || "Logout failed"
            dispatch(setError(errorMsg))
            console.log(err)
            return false
        } finally {
            dispatch(setLoading(false))
        }
    }

    return { handleRegister, handleLogin, handleGetMe, handleLogout }

}