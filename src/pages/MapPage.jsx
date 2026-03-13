import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { B, serif, sans, COURSES } from '../lib/data.js'
import { CourseCard, PageBanner } from '../components/UI.jsx'

export default function MapPage() {
  const navigate = useNavigate()
  const [hov, setHov] = useState(null)
  const [sel, setSel] = useState(null)
  const toX = lng => ((lng+126)/60)*680
  const toY = lat => ((51-lat)/24)*380

  return (
    <div>
      <PageBanner icon="🗺️" title="Course Map" subtitle={`${COURSES.length} rated courses — tap any pin to explore`} bg={B.navy}/>
      <div style={{ background:'#fff', borderRadius:16, overflow:'hidden', border:`1px solid ${B.border}`, marginBottom:18 }}>
        <div style={{ position:'relative', background:'#d8ead8', height:340 }}>
          <svg width="100%" height="100%" viewBox="0 0 680 380">
            <rect width="680" height="380" fill="#daeada"/>
            <text x="340" y="210" textAnchor="middle" fill="rgba(30,69,48,0.07)" fontSize="90" fontWeight="900" fontFamily="Georgia,serif">USA</text>
            {COURSES.map(c => {
              const x=toX(c.lng), y=toY(c.lat)
              const s=sel?.id===c.id, h=hov?.id===c.id
              return (
                <g key={c.id} style={{ cursor:'pointer' }} onClick={() => setSel(c)} onMouseEnter={() => setHov(c)} onMouseLeave={() => setHov(null)}>
                  {(h||s) && <circle cx={x} cy={y} r={26} fill={B.gold} opacity={0.15}/>}
                  <circle cx={x} cy={y} r={s?20:h?16:13} fill={s ? B.gold:B.navy} stroke={B.cream} strokeWidth="2"/>
                  <text x={x} y={y+4.5} textAnchor="middle" fontSize="9" fill={s ? B.navy:B.gold} fontWeight="800" fontFamily="Georgia,serif">{c.natRank}</text>
                  {(h||s) && (
                    <g>
                      <rect x={x-72} y={y-60} width={144} height={48} rx="7" fill={B.navy} stroke={B.gold} strokeWidth="1.5"/>
                      <text x={x} y={y-42} textAnchor="middle" fontSize="10" fill={B.cream} fontWeight="700" fontFamily="sans-serif">{c.name.split(' ').slice(0,3).join(' ')}</text>
                      <text x={x} y={y-26} textAnchor="middle" fontSize="11" fill={B.gold} fontWeight="900" fontFamily="Georgia,serif">★ {c.rating}</text>
                      <text x={x} y={y-12} textAnchor="middle" fontSize="9" fill="rgba(240,232,213,0.7)" fontFamily="sans-serif">{c.location}</text>
                    </g>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
        <div style={{ padding:'10px 14px', display:'flex', alignItems:'center', gap:14, borderTop:`1px solid ${B.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:11, height:11, borderRadius:'50%', background:B.navy, border:`2px solid ${B.cream}` }}/><span style={{ fontSize:12, color:B.textMid, fontFamily:sans }}>Rated course</span></div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:11, height:11, borderRadius:'50%', background:B.gold }}/><span style={{ fontSize:12, color:B.textMid, fontFamily:sans }}>Selected</span></div>
          <span style={{ fontSize:12, color:B.textSoft, fontFamily:sans }}>Number = national rank</span>
        </div>
      </div>
      {sel && (
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:600, color:B.textSoft, fontFamily:sans, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>Selected</div>
          <CourseCard course={sel} onClick={c => navigate(`/course/${c.id}`)} row/>
        </div>
      )}
      <div style={{ fontSize:11, fontWeight:600, color:B.textSoft, fontFamily:sans, marginBottom:10, textTransform:'uppercase', letterSpacing:'0.06em' }}>All Courses</div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {COURSES.map(c => <CourseCard key={c.id} course={c} onClick={c => navigate(`/course/${c.id}`)} row/>)}
      </div>
    </div>
  )
}
