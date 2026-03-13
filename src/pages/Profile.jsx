import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { B, serif, sans, COURSES } from '../lib/data.js'
import { Pill } from '../components/UI.jsx'

export default function Profile() {
  const navigate        = useNavigate()
  const { user, profile, signOut } = useAuth()
  const [tab, setTab]   = useState('rounds')
  const [rounds, setRounds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchRounds() }, [user])

  async function fetchRounds() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('rounds')
      .select('*, courses(*)')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false })
    setRounds(data || [])
    setLoading(false)
  }

  const avgScore  = rounds.length ? Math.round(rounds.filter(r => r.score).reduce((s, r) => s + r.score, 0) / rounds.filter(r => r.score).length) : '--'
  const avgRating = rounds.length ? (rounds.filter(r => r.overall_rating).reduce((s, r) => s + r.overall_rating, 0) / rounds.filter(r => r.overall_rating).length).toFixed(1) : '--'
  const states    = [...new Set(rounds.map(r => r.courses?.state).filter(Boolean))]

  return (
    <div>
      {/* Header */}
      <div style={{ background:B.navy, borderRadius:20, padding:'26px 22px', marginBottom:18 }}>
        <div style={{ display:'flex', alignItems:'center', gap:15, marginBottom:20 }}>
          <div style={{ width:66, height:66, borderRadius:'50%', background:B.gold, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:serif, fontSize:22, fontWeight:900, color:B.navy }}>
            {(profile?.full_name || profile?.username || user?.email || 'U').slice(0,2).toUpperCase()}
          </div>
          <div>
            <h1 style={{ color:B.cream, margin:'0 0 3px', fontSize:21, fontWeight:900, fontFamily:serif }}>
              {profile?.full_name || profile?.username || 'Golfer'}
            </h1>
            <div style={{ color:'rgba(240,232,213,0.6)', fontSize:12, fontFamily:sans, marginBottom:8 }}>
              @{profile?.username || 'firstloop'} · Member since {new Date(user?.created_at).getFullYear()}
            </div>
            <div style={{ display:'flex', gap:7 }}>
              {profile?.handicap && <Pill gold>⛳ Hdcp: {profile.handicap}</Pill>}
              {profile?.location && <Pill gold>📍 {profile.location}</Pill>}
            </div>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {[[rounds.length,'Courses'],[avgScore,'Avg Score'],[avgRating,'Avg Rating'],[states.length,'States']].map(([n,l]) => (
            <div key={l} style={{ background:'rgba(240,232,213,0.08)', borderRadius:11, padding:'11px 8px', textAlign:'center' }}>
              <div style={{ color:B.gold, fontSize:18, fontWeight:900, fontFamily:serif }}>{n}</div>
              <div style={{ color:'rgba(240,232,213,0.5)', fontSize:10, fontWeight:600, fontFamily:sans }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', background:'#fff', borderRadius:12, padding:4, border:`1px solid ${B.border}`, marginBottom:16, gap:4 }}>
        {[['rounds','My Rounds'],['stats','Stats']].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)} style={{ flex:1, padding:'9px 0', borderRadius:9, border:'none', background:tab===v ? B.navy:'transparent', color:tab===v ? B.cream:B.textMid, fontWeight:600, cursor:'pointer', fontSize:13, fontFamily:sans, transition:'all 0.15s' }}>{l}</button>
        ))}
      </div>

      {tab==='rounds' && (
        <div>
          <button onClick={() => navigate('/')}
            style={{ width:'100%', background:B.gold, color:B.navy, border:'none', borderRadius:12, padding:'13px 0', fontWeight:800, fontSize:14, cursor:'pointer', marginBottom:12, fontFamily:serif }}>
            + Log a New Round
          </button>
          {loading ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:B.textSoft, fontFamily:sans }}>Loading rounds...</div>
          ) : rounds.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', background:'#fff', borderRadius:16, border:`1px solid ${B.border}` }}>
              <div style={{ fontSize:40, marginBottom:12 }}>⛳</div>
              <div style={{ fontSize:16, fontWeight:700, color:B.textNavy, fontFamily:serif, marginBottom:6 }}>No rounds logged yet</div>
              <div style={{ fontSize:13, color:B.textSoft, fontFamily:sans }}>Find a course and log your first round</div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              {rounds.map(r => {
                const c = COURSES.find(x => x.id === r.course_id)
                return (
                  <div key={r.id} onClick={() => navigate(`/course/${r.course_id}`)}
                    style={{ background:'#fff', borderRadius:13, padding:'13px 15px', cursor:'pointer', border:`1px solid ${B.border}`, display:'flex', alignItems:'center', gap:11, transition:'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 16px rgba(27,48,84,0.08)'; e.currentTarget.style.borderColor=B.gold }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor=B.border }}>
                    <div style={{ width:42, height:42, borderRadius:10, background:c?.bg||B.navy, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, flexShrink:0 }}>{c?.icon||'⛳'}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:B.textNavy, fontFamily:sans, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.courses?.name || 'Course'}</div>
                      <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans }}>{new Date(r.played_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      {r.score && <div style={{ fontSize:15, fontWeight:800, color:B.textNavy, fontFamily:serif }}>{r.score}</div>}
                      {r.overall_rating && <div style={{ fontSize:12, color:B.gold, fontWeight:700, fontFamily:sans }}>★ {r.overall_rating}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab==='stats' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {rounds.filter(r => r.score).length > 0 && (
            <div style={{ background:'#fff', borderRadius:15, padding:18, border:`1px solid ${B.border}` }}>
              <div style={{ fontSize:14, fontWeight:700, color:B.textNavy, fontFamily:serif, marginBottom:14 }}>Score History</div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:90 }}>
                {rounds.filter(r => r.score).slice(0,8).reverse().map((r,i) => (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                    <div style={{ width:'100%', borderRadius:4, background:r.score<=82 ? B.green:r.score<=90 ? B.navy:B.gold, height:`${Math.max(12,((120-r.score)/60)*100)}%` }}/>
                    <span style={{ fontSize:10, color:B.textSoft, fontFamily:sans, fontWeight:600 }}>{r.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[[`${rounds.length}`,'Rounds Logged','& counting'],[`${avgScore}`,'Avg Score','per round'],[`${avgRating}`,'Avg Rating','out of 10'],[`${states.length}`,'States Played',states.join(' · ')||'none yet']].map(([val,label,sub]) => (
              <div key={label} style={{ background:'#fff', borderRadius:13, padding:'15px 13px', border:`1px solid ${B.border}`, textAlign:'center' }}>
                <div style={{ fontSize:11, color:B.textSoft, fontFamily:sans, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5 }}>{label}</div>
                <div style={{ fontSize:17, fontWeight:800, color:B.textNavy, fontFamily:serif, marginBottom:3 }}>{val}</div>
                <div style={{ fontSize:11, color:B.textSoft, fontFamily:sans }}>{sub}</div>
              </div>
            ))}
          </div>
          <button onClick={() => signOut().then(() => navigate('/auth'))}
            style={{ width:'100%', background:'#fff', color:B.textMid, border:`1px solid ${B.border}`, borderRadius:12, padding:'13px 0', fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:sans }}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
