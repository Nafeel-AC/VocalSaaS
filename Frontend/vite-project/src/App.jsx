import React, { useState, useEffect } from 'react'
import SignUp from './components/SignUp'
import SignInForm from './components/signin'
import Dashboard from './components/Dashboard'
import { supabase } from './lib/supabaseClient'
import './App.css'

function App() {
  const [showSignUp, setShowSignUp] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const toggleForm = () => {
    setShowSignUp(!showSignUp)
  }

  if (loading) {
    return (
      <div className="App">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  // If user is authenticated, show dashboard
  if (user) {
    return <Dashboard />
  }

  // If no user, show auth forms
  return (
    <div className="App">
      {showSignUp ? (
        <SignUp onToggleForm={toggleForm} />
      ) : (
        <SignInForm onToggleForm={toggleForm} />
      )}
    </div>
  )
}

export default App
