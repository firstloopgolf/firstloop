import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { B, serif, sans, MY_ROUNDS, WISHLIST, COURSES } from '../lib/data.js'
import { Pill, CourseCard } from '../components/UI.jsx'

export default function Profile() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('rounds')

  return (
    <div>
      <div style={{ background:B.navy, borderRadius:20, padding:'26px 22px', marginBottom:18 }}>
        <div style={{ display:'flex', alignItems:'center', gap:15, marginBottom:20 }}>
          <div style={{ width:66, height:66, borderRadius:'50%', background:B.gold, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:serif, fontSize:22, fontWeight:900, color:B.navy }}>JD</div>
          <div>
            <h1 style={{ color:B.cream, margin:'0 0 3px', fontSize:21, fontWeight:900, fontFamily:serif }}>Jordan Davis</h1>
            <div style={{ color:'rgba(240,232,213,0.6)', fontSize:12, fontFamily:sans, marginBottom:8 }}>@jordandavis · Member since 2023</div>
            <div style={{ display:'flex', gap:7 }}>
              <Pill gold>⛳ Hdcp: 8.4</Pill>
              <Pill gold>📍 New York, NY</Pill>
            </div>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {[['5','Courses'],['87.2','Avg Score'],['9.0','Avg Rating'],['3','States']].map(([n,l]) => (
            <div key={l} style={{ background:'rgba(240,232,213,0.08)', borderRadius:11, padding:'11px 8px', textAlign:'center' }}>
              <div style={{ color:B.gold, fontSize:18, fontWeight:900, fontFamily:serif }}>{n}</div>
              <div style={{ color:'rgba(240,232,213,0.5)', fontSize:10, fontWeight:600, fontFamily:sans }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:'#fff', borderRadius:15, padding:'14px 16px', marginBottom:16, border:`1px solid ${B.border}` }}>
        <div style={{ fontSize:14, fontWeight:700, color:B.textNavy, fontFamily:serif, marginBottom:10 }}>🏅 Badges Earned</div>
        <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
          {[['🗺️','5 Courses'],['🥇','First Loop Member'],['🌊','Coastal Golfer'],['⭐','Top Reviewer'],['🎯','Sub-10 Handicap']].map(([icon,label]) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:4, background:B.feedBg, borderRadius:999, padding:'4px 11px', border:`1px solid ${B.border}` }}>
              <span style={{ fontSize:12 }}>{icon}</span>
              <span style={{ fontSize:11, fontWeight:600, color:B.textNavy, fontFamily:sans }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', background:'#fff', borderRadius:12, padding:4, border:`1px solid ${B.border}`, marginBottom:16, gap:4 }}>
        {[['rounds','My Rounds'],['wishlist','Wish List'],['stats','Stats']].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)} style={{ flex:1, padding:'9px 0', borderRadius:9, border:'none', background:tab===v ? B.navy:'transparent', color:tab===v ? B.cream:B.textMid, fontWeight:600, cursor:'pointer', fontSize:12, fontFamily:sans, transition:'all 0.15s' }}>{l}</button>
        ))}
      </div>

      {tab==='rounds' && (
        <div>
          <button style={{ width:'100%', background:B.gold, color:B.navy, border:'none', borderRadius:12, padding:'13px 0', fontWeight:800, fontSize:14, cursor:'pointer', marginBottom:12, fontFamily:serif }}>+ Log a New Round</button>
          <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
            {MY_ROUNDS.map((r,i) => {
              const c = COURSES.find(x => x.name===r.course)
              return (
                <div key={i} onClick={() => c && navigate(`/course/${c.id}`)} style={{ background:'#fff', borderRadius:13, padding:'13px 15px', cursor:'pointer', border:`1px solid ${B.border}`, display:'flex', alignItems:'center', gap:11, transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 16px rgba(27,48,84,0.08)'; e.currentTarget.style.borderColor=B.gold }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor=B.border }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:c?.bg||B.navy, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, flexShrink:0 }}>{c?.icon||'⛳'}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:B.textNavy, fontFamily:sans, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.course}</div>
                    <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans }}>{r.date}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:15, fontWeight:800, color:B.textNavy, fontFamily:serif }}>{r.score}</div>
                    <div style={{ fontSize:12, color:B.gold, fontWeight:700, fontFamily:sans }}>★ {r.rating}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tab==='wishlist' && (
        <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
          {WISHLIST.map((w,i) => {
            const c = COURSES.find(x => x.name===w.course)
            return (
              <div key={i} onClick={() => c && navigate(`/course/${c.id}`)} style={{ background:'#fff', borderRadius:13, padding:'13px 15px', cursor:'pointer', border:`1px solid ${B.border}`, display:'flex', alignItems:'center', gap:11, transition:'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 16px rgba(27,48,84,0.08)'; e.currentTarget.style.borderColor=B.gold }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor=B.border }}>
                <div style={{ width:42, height:42, borderRadius:10, background:c?.bg||B.navy, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, flexShrink:0 }}>{c?.icon||'⛳'}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:B.textNavy, fontFamily:sans }}>{w.course}</div>
                  <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans }}>{c?.location}</div>
                </div>
                <Pill gold small>{w.priority}</Pill>
              </div>
            )
          })}
        </div>
      )}

      {tab==='stats' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ background:'#fff', borderRadius:15, padding:18, border:`1px solid ${B.border}` }}>
            <div style={{ fontSize:14, fontWeight:700, color:B.textNavy, fontFamily:serif, marginBottom:14 }}>Score History</div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:90 }}>
              {MY_ROUNDS.map((r,i) => (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                  <div style={{ width:'100%', borderRadius:4, background:r.score<=82 ? B.green:r.score<=88 ? B.navy:B.gold, height:`${Math.max(12,((100-r.score+60)/60)*100)}%` }}/>
                  <span style={{ fontSize:10, color:B.textSoft, fontFamily:sans, fontWeight:600 }}>{r.score}</span>
                  <span style={{ fontSize:9, color:B.textSoft, fontFamily:sans }}>{r.date.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[['Best Round','78','Augusta · 2024'],['Worst Round','91','Bethpage · 2023'],['States Played','NY · CA · FL','3 states'],['Courses Logged','5','& counting']].map(([label,val,sub]) => (
              <div key={label} style={{ background:'#fff', borderRadius:13, padding:'15px 13px', border:`1px solid ${B.border}`, textAlign:'center' }}>
                <div style={{ fontSize:11, color:B.textSoft, fontFamily:sans, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5 }}>{label}</div>
                <div style={{ fontSize:17, fontWeight:800, color:B.textNavy, fontFamily:serif, marginBottom:3 }}>{val}</div>
                <div style={{ fontSize:11, color:B.textSoft, fontFamily:sans }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
