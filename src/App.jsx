import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext.jsx'
import { B, sans, NAV_TABS } from './lib/data.js'
import { Logo } from './components/UI.jsx'
import Discover     from './pages/Discover.jsx'
import Feed         from './pages/Feed.jsx'
import Rankings     from './pages/Rankings.jsx'
import MapPage      from './pages/MapPage.jsx'
import Profile      from './pages/Profile.jsx'
import CourseDetail from './pages/CourseDetail.jsx'
import Auth         from './pages/Auth.jsx'
import Landing      from './pages/Landing.jsx'
import SubmitCourse from './pages/SubmitCourse.jsx'
import Onboarding   from './pages/Onboarding.jsx'
import LogCourse    from './pages/LogCourse.jsx'
import Admin        from './pages/Admin.jsx'
import { useEffect, useState } from 'react'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', fontFamily:sans, color:'#999' }}>Loading...</div>
  if (!user) return <Navigate to="/auth" replace/>
  return children
}

export default function App() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, profile, loading, signOut } = useAuth() 
  const activeTab = location.pathname.split('/')[1] || 'discover'
  const isAuth       = location.pathname === '/auth'
  const isLanding    = location.pathname === '/landing'
  const isOnboarding = location.pathname === '/onboarding'
  const hideNav   = isAuth || isLanding || isOnboarding  // ← hide nav on onboarding
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)

  // ── New user redirect to onboarding ───────────────────────────────────────
  // If user is logged in but hasn't set a username yet, send them to onboarding

    useEffect(() => {
      if (loading) return  // wait for auth to finish loading
      if (
        user &&
        !isOnboarding &&
        !isAuth &&
        (!profile || !profile.username)  // catches null profile AND missing username
      ) {
        navigate('/onboarding', { replace: true })
      }
    }, [user, profile, loading, isOnboarding, isAuth])

  useEffect(() => {
    const titles = {
      discover:   'Discover Golf Courses | First Loop',
      feed:       'Community Feed | First Loop',
      rankings:   'Golf Course Rankings | First Loop',
      map:        'Golf Course Map | First Loop',
      profile:    'My Profile | First Loop',
      submit:     'Submit a Course | First Loop',
      log:        'Log a Round | First Loop',
      onboarding: 'Welcome | First Loop',
    }
    if (titles[activeTab]) document.title = titles[activeTab]
  }, [activeTab])

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault()
      setInstallPrompt(e)
    })
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const hasSeenPrompt = sessionStorage.getItem('iosPromptSeen')
    if (isIOS && !isStandalone && !hasSeenPrompt) {
      setTimeout(() => setShowIOSPrompt(true), 3000)
    }
  }, [])

  async function handleInstall() {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstallPrompt(null)
  }

  function dismissIOSPrompt() {
    sessionStorage.setItem('iosPromptSeen', 'true')
    setShowIOSPrompt(false)
  }

  const nav = (tab) => navigate(tab === 'discover' ? '/' : `/${tab}`)

  return (
    <div style={{ fontFamily:sans, background:'#F7F4EE', minHeight:'100vh' }}>

      {!hideNav && (
        <div style={{ background:B.navy, borderBottom:'1px solid rgba(240,232,213,0.08)', padding:'0 10px', display:'flex', alignItems:'center', justifyContent:'space-between', height:58, position:'sticky', top:0, zIndex:300 }}>
          <button onClick={() => nav('discover')} style={{ background:'none', border:'none', cursor:'pointer', padding:0, flexShrink:0 }}>
            <Logo size="sm" theme="navy"/>
          </button>
          <div style={{ display:'flex', gap:1, alignItems:'center' }}>
            {NAV_TABS.map(t => (
              <button key={t.id} onClick={() => nav(t.id)}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:1, padding:'5px 7px', borderRadius:9, border:'none', background:activeTab===t.id ? 'rgba(196,150,58,0.15)':'transparent', color:activeTab===t.id ? B.gold:'rgba(240,232,213,0.45)', cursor:'pointer', transition:'all 0.15s' }}>
                <span style={{ fontSize:14 }}>{t.icon}</span>
                <span style={{ fontSize:8, fontFamily:sans, fontWeight:600 }}>{t.label}</span>
              </button>
            ))}
            {user ? (
              <button onClick={() => signOut().then(() => navigate('/auth'))}
                style={{ marginLeft:4, padding:'5px 8px', borderRadius:8, border:`1px solid rgba(240,232,213,0.2)`, background:'transparent', color:'rgba(240,232,213,0.6)', fontSize:10, fontFamily:sans, cursor:'pointer', whiteSpace:'nowrap' }}>
                Out
              </button>
            ) : (
              <button onClick={() => navigate('/auth')}
                style={{ marginLeft:4, padding:'5px 10px', borderRadius:8, border:'none', background:B.gold, color:B.navy, fontSize:11, fontWeight:700, fontFamily:sans, cursor:'pointer', whiteSpace:'nowrap' }}>
                Sign in
              </button>
            )}
          </div>
        </div>
      )}

      <div style={{ maxWidth:820, margin:'0 auto', padding: hideNav ? 0 : '22px 14px 96px' }}>
        <Routes>
          <Route path="/"            element={user ? <Discover /> : <Landing />} />
          <Route path="/discover"    element={<Discover />} />
          <Route path="/feed"        element={<Feed />} />
          <Route path="/rankings"    element={<Rankings />} />
          <Route path="/map"         element={<MapPage />} />
          <Route path="/auth"        element={<Auth />} />
          <Route path="/course/:id"  element={<CourseDetail />} />
          <Route path="/submit"      element={<SubmitCourse />} />
          <Route path="/onboarding"  element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/log"         element={<ProtectedRoute><LogCourse /></ProtectedRoute>} />
          <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin"       element={<Admin />} />
        </Routes>
      </div>

      {!hideNav && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, background:B.navy, borderTop:'1px solid rgba(240,232,213,0.08)', padding:'6px 0 12px', display:'flex', justifyContent:'space-around', zIndex:300 }}>
          {NAV_TABS.map(t => (
            <button key={t.id} onClick={() => nav(t.id)}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, background:'none', border:'none', cursor:'pointer', padding:'3px 4px', flex:1, minWidth:0 }}>
              <span style={{ fontSize:18 }}>{t.icon}</span>
              <span style={{ fontSize:8, fontWeight:600, color:activeTab===t.id ? B.gold:'rgba(240,232,213,0.38)', fontFamily:sans, whiteSpace:'nowrap' }}>{t.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Android install banner */}
      {installPrompt && !hideNav && (
        <div style={{ position:'fixed', bottom:70, left:12, right:12, background:B.navy, borderRadius:16, padding:'14px 18px', display:'flex', alignItems:'center', gap:12, zIndex:400, boxShadow:'0 8px 32px rgba(0,0,0,0.3)', border:`1px solid rgba(196,150,58,0.3)` }}>
          <div style={{ fontSize:28 }}>⛳</div>
          <div style={{ flex:1 }}>
            <div style={{ color:B.cream, fontSize:13, fontWeight:700, fontFamily:sans }}>Install First Loop</div>
            <div style={{ color:'rgba(240,232,213,0.6)', fontSize:11, fontFamily:sans }}>Add to your home screen for the best experience</div>
          </div>
          <button onClick={handleInstall}
            style={{ background:B.gold, color:B.navy, border:'none', borderRadius:10, padding:'8px 14px', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:sans, flexShrink:0 }}>
            Install
          </button>
          <button onClick={() => setInstallPrompt(null)}
            style={{ background:'none', border:'none', color:'rgba(240,232,213,0.4)', cursor:'pointer', fontSize:18, padding:0, flexShrink:0 }}>
            ✕
          </button>
        </div>
      )}

      {/* iOS install prompt */}
      {showIOSPrompt && !hideNav && (
        <div style={{ position:'fixed', bottom:70, left:12, right:12, background:B.navy, borderRadius:16, padding:'16px 18px', zIndex:400, boxShadow:'0 8px 32px rgba(0,0,0,0.3)', border:`1px solid rgba(196,150,58,0.3)` }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ fontSize:28 }}>⛳</div>
              <div>
                <div style={{ color:B.cream, fontSize:13, fontWeight:700, fontFamily:sans }}>Install First Loop</div>
                <div style={{ color:'rgba(240,232,213,0.6)', fontSize:11, fontFamily:sans }}>Add to your home screen</div>
              </div>
            </div>
            <button onClick={dismissIOSPrompt}
              style={{ background:'none', border:'none', color:'rgba(240,232,213,0.4)', cursor:'pointer', fontSize:18, padding:0 }}>
              ✕
            </button>
          </div>
          <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:10, padding:'10px 14px' }}>
            <div style={{ color:'rgba(240,232,213,0.8)', fontSize:12, fontFamily:sans, lineHeight:1.7 }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:8 }}>
                <span style={{ color:B.gold, fontWeight:700, flexShrink:0 }}>1.</span>
                <span>Tap the <strong style={{ color:B.gold }}>Share button</strong> at the bottom of Safari — you may need to press . . . first</span>
              </div>
              <div style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:8 }}>
                <span style={{ color:B.gold, fontWeight:700, flexShrink:0 }}>2.</span>
                <span>Scroll down and tap <strong style={{ color:B.gold }}>"Add to Home Screen"</strong></span>
              </div>
              <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                <span style={{ color:B.gold, fontWeight:700, flexShrink:0 }}>3.</span>
                <span>Tap <strong style={{ color:B.gold }}>"Add"</strong> in the top right corner</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}