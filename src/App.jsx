import { useNavigate, useLocation, Routes, Route } from 'react-router-dom'
import { B, serif, sans, NAV_TABS } from './lib/data.js'
import { Logo } from './components/UI.jsx'
import Discover    from './pages/Discover.jsx'
import Feed        from './pages/Feed.jsx'
import Rankings    from './pages/Rankings.jsx'
import MapPage     from './pages/MapPage.jsx'
import Profile     from './pages/Profile.jsx'
import CourseDetail from './pages/CourseDetail.jsx'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeTab = location.pathname.split('/')[1] || 'discover'

  const nav = (tab) => navigate(tab === 'discover' ? '/' : `/${tab}`)

  return (
    <div style={{ fontFamily:sans, background:B.feedBg, minHeight:'100vh' }}>

      {/* Top Bar */}
      <div style={{ background:B.navy, borderBottom:'1px solid rgba(240,232,213,0.08)', padding:'0 18px', display:'flex', alignItems:'center', justifyContent:'space-between', height:58, position:'sticky', top:0, zIndex:300 }}>
        <button onClick={() => nav('discover')} style={{ background:'none', border:'none', cursor:'pointer', padding:0 }}>
          <Logo size="sm" theme="navy"/>
        </button>
        <div style={{ display:'flex', gap:2 }}>
          {NAV_TABS.map(t => (
            <button key={t.id} onClick={() => nav(t.id)}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:1, padding:'5px 9px', borderRadius:9, border:'none', background:activeTab===t.id ? 'rgba(196,150,58,0.15)':'transparent', color:activeTab===t.id ? B.gold:'rgba(240,232,213,0.45)', cursor:'pointer', transition:'all 0.15s' }}>
              <span style={{ fontSize:15 }}>{t.icon}</span>
              <span style={{ fontSize:9, fontFamily:sans, fontWeight:600 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pages */}
      <div style={{ maxWidth:820, margin:'0 auto', padding:'22px 14px 96px' }}>
        <Routes>
          <Route path="/"           element={<Discover />} />
          <Route path="/feed"       element={<Feed />} />
          <Route path="/rankings"   element={<Rankings />} />
          <Route path="/map"        element={<MapPage />} />
          <Route path="/profile"    element={<Profile />} />
          <Route path="/course/:id" element={<CourseDetail />} />
        </Routes>
      </div>

      {/* Bottom Nav */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:B.navy, borderTop:'1px solid rgba(240,232,213,0.08)', padding:'7px 0 14px', display:'flex', justifyContent:'space-around', zIndex:300 }}>
        {NAV_TABS.map(t => (
          <button key={t.id} onClick={() => nav(t.id)}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, background:'none', border:'none', cursor:'pointer', padding:'3px 10px' }}>
            <span style={{ fontSize:20 }}>{t.icon}</span>
            <span style={{ fontSize:10, fontWeight:600, color:activeTab===t.id ? B.gold:'rgba(240,232,213,0.38)', fontFamily:sans }}>{t.label}</span>
          </button>
        ))}
      </div>

    </div>
  )
}
