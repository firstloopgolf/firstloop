import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // onAuthStateChange must be set up BEFORE getSession so it catches
    // the SIGNED_IN event that Supabase fires when it auto-parses the
    // access_token hash on page load (email confirmation flow)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        fetchProfile(session.user.id)

        // Supabase auto-parses the #access_token hash and fires SIGNED_IN.
        // If type=signup is in the hash, this is a new user confirming email.
        if (event === 'SIGNED_IN') {
          const params = new URLSearchParams(window.location.hash.slice(1))
          if (params.get('type') === 'signup') {
            // Clear the token hash from the URL then go to onboarding
            window.history.replaceState(null, '', '/onboarding')
            window.location.replace('/onboarding')
          }
        }
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    // After the listener is set up, check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Only set state here if onAuthStateChange hasn't already handled it
      if (!session) {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  async function signUp(email, password, username, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://www.firstloopgolf.com/onboarding',
        data: { username, full_name: fullName }
      }
    })
    if (error) throw error
    return data
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signUp, signIn, signOut, fetchProfile,
      isAdmin: profile?.is_admin === true
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)