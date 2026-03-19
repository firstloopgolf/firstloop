import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set up the auth state listener first — always
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        fetchProfile(session.user.id)

        if (event === 'SIGNED_IN') {
          // Check if this came from an email confirmation link
          const params = new URLSearchParams(window.location.hash.replace('#', '?'))
          if (params.get('type') === 'signup') {
            window.history.replaceState(null, '', '/onboarding')
            window.location.href = '/onboarding'
            return
          }
        }
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    // If the URL contains email confirmation tokens, call setSession to
    // exchange them for a live session — this triggers onAuthStateChange above
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.replace('#', '?'))
      const accessToken  = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      if (accessToken && refreshToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        // setSession triggers onAuthStateChange, which handles the redirect
        return () => subscription.unsubscribe()
      }
    }

    // Normal page load — grab existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
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