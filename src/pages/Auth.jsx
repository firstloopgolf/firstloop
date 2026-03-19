import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { Logo } from '../components/UI.jsx'

export default function Auth() {
  const { B, serif, sans } = useTheme()
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [mode, setMode]         = useState('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: `1px solid ${B.border}`, fontSize: 14, fontFamily: sans,
    color: B.textNavy, outline: 'none', background: '#fff',
    boxSizing: 'border-box', marginBottom: 12,
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        navigate('/')
      } else {
        await signUp(email, password, username, fullName)
        navigate('/onboarding')
      }
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:B.navy, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:400 }}>

        <div style={{ display:'flex', justifyContent:'center', marginBottom:32 }}>
          <Logo size="lg" theme="navy"/>
        </div>

        <div style={{ background:'#fff', borderRadius:20, padding:32 }}>
          <h2 style={{ fontFamily:serif, fontSize:22, fontWeight:900, color:B.textNavy, margin:'0 0 6px' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{ fontFamily:sans, fontSize:13, color:B.textSoft, margin:'0 0 24px' }}>
            {mode === 'login' ? 'Sign in to your First Loop account' : 'Start tracking your golf journey'}
          </p>

          {error && (
            <div style={{ background:'#fde8e8', color:'#c00', borderRadius:8, padding:'10px 14px', fontSize:13, fontFamily:sans, marginBottom:16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full name" required style={inputStyle}/>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username (e.g. treyc)" required style={inputStyle}/>
              </>
            )}
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" required style={inputStyle}/>
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" required style={{ ...inputStyle, marginBottom:20 }}/>

            <button type="submit" disabled={loading}
              style={{ width:'100%', background:loading ? B.border : B.gold, color:B.navy, border:'none', borderRadius:12, padding:'14px 0', fontWeight:800, fontSize:15, cursor:loading ? 'not-allowed':'pointer', fontFamily:serif, transition:'all 0.15s' }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:20 }}>
            <span style={{ fontSize:13, color:B.textSoft, fontFamily:sans }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
              style={{ background:'none', border:'none', color:B.gold, fontWeight:700, cursor:'pointer', fontSize:13, fontFamily:sans }}>
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </div>
        </div>

        <p style={{ textAlign:'center', color:'rgba(240,232,213,0.4)', fontSize:12, fontFamily:sans, marginTop:20 }}>
          Rate · Rank · Discover
        </p>
      </div>
    </div>
  )
}
