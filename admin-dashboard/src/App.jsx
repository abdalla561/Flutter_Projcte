import React, { useEffect, useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import DashboardLayout from "./components/layout/DashboardLayout"
import { authService } from "./services/auth"
import { Loader2 } from "lucide-react"

import Categories from "./pages/Categories"
import Products from "./pages/Products"
import Orders from "./pages/Orders"
import Users from "./pages/Users"
import Ads from "./pages/Ads"

// Only lazy load the heavy Dashboard and Login for better balance
const Dashboard = React.lazy(() => import("./pages/Dashboard"))
const Login = React.lazy(() => import("./pages/Login"))

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
)

function App() {
  const [session, setSession] = useState(undefined) // undefined = still initializing
  
  useEffect(() => {
    // 1. Check for session immediately
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await authService.getSession()
        setSession(currentSession)
      } catch (err) {
        setSession(null)
      }
    }
    
    initAuth()

    // 2. Listen for future changes
    const { data: { subscription } } = authService.onAuthStateChange((newSession) => {
      console.log('[App] Session updated:', newSession ? 'logged in' : 'no session')
      setSession(newSession) // null = logged out, object = logged in
    })

    return () => subscription.unsubscribe()
  }, [])

  // undefined means Supabase hasn't responded yet — show spinner
  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }


  return (
    <BrowserRouter>
      <React.Suspense fallback={<PageLoader />}>
        <Routes>
          <Route 
            path="/login" 
            element={!session ? <Login /> : <Navigate to="/" replace />} 
          />
          
          <Route 
            path="/" 
            element={session ? <DashboardLayout /> : <Navigate to="/login" replace />}
          >
            <Route index element={<Dashboard />} />
            <Route path="categories" element={<Categories />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="users" element={<Users />} />
            <Route path="ads" element={<Ads />} />
            <Route path="settings" element={<div className="p-4">Settings Page (Coming Soon)</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  )
}

export default App
