import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function AuthConfirm() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token_hash = params.get('token_hash')
    const type = params.get('type')
    const next = params.get('next') || '/'

    if (token_hash && type) {
      supabase.auth.verifyOtp({ token_hash, type })
        .then(({ error }) => {
          if (error) {
            navigate('/auth?error=confirmation_failed')
          } else {
            navigate(next)
          }
        })
    } else {
      navigate('/')
    }
  }, [])

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'DM Sans, sans-serif', color:'#8a8a8a' }}>
      Confirming your account...
    </div>
  )
}