import './App.css'
import { RouterProvider } from 'react-router'
import { routes } from './app.routes'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from '../features/auth/hook/useAuth'
import { useEffect } from 'react'
import { setUser } from '../features/auth/state/auth.slice'


function App() {
  const dispatch = useDispatch()
  const { handleGetMe } = useAuth()

  const user = useSelector(state => state.auth.user)

  console.log(user)

  useEffect(() => {
    // Check if token is in URL (from Google callback)
    const params = new URLSearchParams(window.location.search)
    const tokenFromUrl = params.get('token')
    
    if (tokenFromUrl) {
      // Store token in localStorage
      localStorage.setItem('authToken', tokenFromUrl)
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    // Add small delay to ensure cookies are set after redirect
    const timer = setTimeout(() => {
      handleGetMe()
    }, 100);
    
    return () => clearTimeout(timer);
  }, [])

  return (
    <>
      <RouterProvider router={routes} />
    </>
  )
}

export default App
