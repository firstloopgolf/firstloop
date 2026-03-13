import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { B, serif, sans, COURSES } from '../lib/data.js'
import { Pill, CourseCard } from '../components/UI.jsx'

export default function Discover() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [f, setF] = useState('all')

  const list = COURSES.filter(c => {
    const match = !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.location.toLowerCase().includes(q.toLowerCase()) || c.state.toLowerCase().includes(q.toLowerCase())
    const fm = f==='all' || (f==='top100' && c.natRank<=100) || (f==='value' && c.value>=8.5) || (f==='public' && c.price.length<=2)
    return match && fm
  })

  return (
    <div>
      <div style={{ background:B.navy, borderRadius:20, padding:'30px 26px 26px', marginBottom:22, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:220, height:220, borderRadius:'50%', background:'rgba(196,150,58,0.07)' }}/>
        <div style={{ position:'relative' }}>
          <Pill gold>⛳ Rate · Rank · Discover</Pill>
          <h1 style={{ color:B.cream, fontSize:26, fontWeight:900, margin:'14px 0 8px', fontFamily:serif, lineHeight:1.2 }}>
            Find Your Next<br/><span style={{ color:B.gold }}>Great Round</span>
          </h1>
          <p style={{ color:'rgba(240,232,213,0.65)', margin:'0 0 18px', fontSize:13, fontFamily:sans, lineHeight:1.65 }}>
            Track every course. Rate the conditions, value & vibes. Build your golf story.
          </p>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:15 }}>🔍</span>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search courses, cities, states..."
              style={{ width:'100%', padding:'12px 16px 12px 40px', borderRadius:12, border:'none', fontSize:14, background:'rgba(240,232,213,0.12)', color:B.cream, outline:'none', boxSizing:'border-box', fontFamily:sans }}/>
          </div>
        </div>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:18, overflowX:'auto', paddingBottom:2 }}>
        {[['all','🏌️ All'],['top100','🏆 Top 100'],['value','💰 Best Value'],['public','🎟️ Public']].map(([v,label]) => (
          <button key={v} onClick={() => setF(v)}
            style={{ flexShrink:0, padding:'7px 16px', borderRadius:999, border:`1.5px solid ${f===v ? B.navy:B.border}`, background:f===v ? B.navy:B.white, color:f===v ? B.cream:B.textMid, fontWeight:600, cursor:'pointer', fontSize:13, fontFamily:sans, transition:'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:22 }}>
        {[['1,200+','Courses Rated'],['48','States'],['47K','Reviews']].map(([n,l]) => (
          <div key={l} style={{ background:B.white, borderRadius:12, padding:'13px 10px', textAlign:'center', border:`1px solid ${B.border}` }}>
            <div style={{ fontSize:18, fontWeight:900, color:B.navy, fontFamily:serif }}>{n}</div>
            <div style={{ fontSize:11, color:B.textSoft, fontFamily:sans, fontWeight:500 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize:16, fontWeight:700, color:B.textNavy, fontFamily:serif, marginBottom:14 }}>
        {q ? `Results (${list.length})` : 'Featured Courses'}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:16 }}>
        {list.map(c => (
          <CourseCard key={c.id} course={c} onClick={c => navigate(`/course/${c.id}`)}/>
        ))}
      </div>
    </div>
  )
}
