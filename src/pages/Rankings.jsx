import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { PageBanner } from '../components/UI.jsx'
import { useCourses } from '../hooks/useCourses.js'

function RankBadge({ isLive }) {
  const { B, serif, sans } = useTheme()
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, fontFamily: sans,
      padding: '2px 7px', borderRadius: 999,
      background: isLive ? '#e0ede5' : B.goldPale,
      color: isLive ? B.green : '#8a6010',
      letterSpacing: '0.04em', whiteSpace: 'nowrap',
    }}>
      {isLive ? '⚡ LIVE' : '✦ EDITORIAL'}
    </span>
  )
}

export default function Rankings() {
  const { B, serif, sans } = useTheme()
  const navigate = useNavigate()
  const { courses, loading } = useCourses()
  const [tab, setTab]     = useState('national')
  const [selectedState, setSelectedState] = useState("NY");

  const nat = courses
    .filter(c => c.natRank <= 100)
    .sort((a, b) => a.natRank - b.natRank)
  const state = courses
    .filter(c => c.stRank <= 20 && c.state === selectedState)
    .sort((a, b) => a.stRank - b.stRank)
  const allStates = [...new Set(courses.map(c => c.state))].sort()

  return (
    <div>
      <PageBanner icon="🏆" title="Course Rankings" subtitle="Real ratings from real golfers — updated weekly" bg={B.green}/>

      <div style={{ display:'flex', background:B.white, borderRadius:12, padding:4, border:`1px solid ${B.border}`, marginBottom:18, gap:4 }}>
        {[['national','🇺🇸 National Top 100'],['state','📍 State Top 20']].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)} style={{ flex:1, padding:'9px 0', borderRadius:9, border:'none', background:tab===v ? B.navy:'transparent', color:tab===v ? B.cream:B.textMid, fontWeight:600, cursor:'pointer', fontSize:13, fontFamily:sans, transition:'all 0.15s' }}>{l}</button>
        ))}
      </div>

      {tab==='state' && (
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:600, color:B.textSoft, fontFamily:sans, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>Select State</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {allStates.map(s => (
              <button key={s} onClick={() => setSelectedState(s)} style={{ padding:'5px 13px', borderRadius:999, border:`1.5px solid ${selectedState===s ? B.gold:B.border}`, background:selectedState===s ? B.goldPale:'#fff', color:selectedState===s ? B.navy:B.textMid, fontWeight:700, cursor:'pointer', fontSize:12, fontFamily:sans, transition:'all 0.12s' }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[...Array(5)].map((_,i) => (
            <div key={i} style={{ background:B.white, borderRadius:12, height:64, border:`1px solid ${B.border}`, opacity:0.5 }}/>
          ))}
        </div>
      ) : (
        <>
          {tab==='national' && (
            <div>
              <div style={{ display:'flex', gap:10, marginBottom:18 }}>
                {nat.slice(0,3).map((c,i) => (
                  <div key={c.id} onClick={() => navigate(`/course/${c.id}`)} style={{ flex:1, background:c.bg, borderRadius:14, padding:'14px 12px', cursor:'pointer', textAlign:'center', border:`2px solid ${[B.gold,'#b0b0b0','#cd7f32'][i]}` }}>
                    <div style={{ fontSize:26, marginBottom:4 }}>{['🥇','🥈','🥉'][i]}</div>
                    <div style={{ color:B.cream, fontSize:12, fontWeight:700, fontFamily:sans, lineHeight:1.3, marginBottom:4 }}>{c.name.split(' ').slice(0,2).join(' ')}</div>
                    <div style={{ color:B.gold, fontSize:18, fontWeight:900, fontFamily:serif }}>{c.rating}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {nat.slice(3).map((c,i) => (
                  <div key={c.id} onClick={() => navigate(`/course/${c.id}`)} style={{ background:B.white, borderRadius:12, padding:'12px 15px', cursor:'pointer', border:`1px solid ${B.border}`, display:'flex', alignItems:'center', gap:12, transition:'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 16px rgba(27,48,84,0.08)'; e.currentTarget.style.borderColor=B.gold }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor=B.border }}>
                    <div style={{ width:34, height:34, borderRadius:8, background:B.feedBg, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, color:B.textMid, fontFamily:serif, flexShrink:0 }}>{i+4}</div>
                    <div style={{ width:34, height:34, borderRadius:8, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{c.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:B.textNavy, fontFamily:sans, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</div>
                      <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans }}>{c.location}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize:17, fontWeight:900, color:B.gold, fontFamily:serif, marginBottom:2 }}>{c.rating}</div>
                      <RankBadge isLive={c.isLive}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==='state' && (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {(state.length ? state : nat.slice(0,5)).map((c,i) => (
                <div key={c.id} onClick={() => navigate(`/course/${c.id}`)} style={{ background:B.white, borderRadius:12, padding:'12px 15px', cursor:'pointer', border:`1px solid ${i===0 ? B.gold:B.border}`, display:'flex', alignItems:'center', gap:12, transition:'all 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 16px rgba(27,48,84,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
                  <div style={{ width:34, height:34, borderRadius:8, background:i===0 ? B.gold:B.feedBg, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:i===0?14:12, color:i===0 ? B.navy:B.textMid, fontFamily:serif, flexShrink:0 }}>{i===0 ? '🥇':i+1}</div>
                  <div style={{ width:34, height:34, borderRadius:8, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{c.icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:B.textNavy, fontFamily:sans, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</div>
                    <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans }}>{c.location}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:17, fontWeight:900, color:B.gold, fontFamily:serif }}>{c.rating}</div>
                    <div style={{ fontSize:11, color:B.textSoft, fontFamily:sans }}>{c.reviews.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}