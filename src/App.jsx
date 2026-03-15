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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', fontFamily:sans, color:'#999' }}>Loading...</div>
  if (!user) return <Navigate to="/auth" replace/>
  return children
}

export default function App() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, signOut } = useAuth()
  const activeTab = location.pathname.split('/')[1] || 'discover'
  const isAuth    = location.pathname === '/auth'
  const isLanding = location.pathname === '/landing'
  const hideNav   = isAuth || isLanding

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
          <Route path="/"           element={user ? <Discover /> : <Landing />} />
          <Route path="/discover"   element={<Discover />} />
          <Route path="/feed"       element={<Feed />} />
          <Route path="/rankings"   element={<Rankings />} />
          <Route path="/map"        element={<MapPage />} />
          <Route path="/auth"       element={<Auth />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/submit"     element={<SubmitCourse />} />
          <Route path="/profile"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />
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

    </div>
  )
}