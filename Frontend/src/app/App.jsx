import './App.css'
import { RouterProvider } from 'react-router'
import { routes } from './app.routes'
import { useSelector } from 'react-redux'
import { useAuth } from '../features/auth/hook/useAuth'
import { useEffect } from 'react'


function App() {


  const { handleGetMe } = useAuth()

  const user = useSelector(state => state.auth.user)

  console.log(user)

  useEffect(() => {
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
