import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { B, serif, sans, COURSES } from '../lib/data.js'
import { Pill } from '../components/UI.jsx'
import ShareRoundModal from '../components/ShareRoundModal.jsx'

export default function Profile() {
  const navigate                    = useNavigate()
  const { user, profile, signOut, fetchProfile, isAdmin } = useAuth()
  const [tab, setTab]               = useState('rounds')
  const [rounds, setRounds]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [editing, setEditing]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [saveMsg, setSaveMsg]       = useState('')
  const [shareRound, setShareRound] = useState(null)
  const [shareCourse, setShareCourse] = useState(null)

  // Edit form state
  const [fullName, setFullName]     = useState('')
  const [username, setUsername]     = useState('')
  const [location, setLocation]     = useState('')
  const [handicap, setHandicap]     = useState('')

  useEffect(() => { fetchRounds() }, [user])

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setUsername(profile.username  || '')
      setLocation(profile.location  || '')
      setHandicap(profile.handicap  || '')
    }
  }, [profile])

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

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg('')
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        username:  username,
        location:  location,
        handicap:  handicap ? parseFloat(handicap) : null,
      })
      .eq('id', user.id)
    if (error) {
      setSaveMsg('Error saving — ' + error.message)
    } else {
      await fetchProfile(user.id)
      setSaveMsg('Saved!')
      setEditing(false)
      setTimeout(() => setSaveMsg(''), 3000)
    }
    setSaving(false)
  }

  const avgScore  = rounds.filter(r => r.score).length
    ? Math.round(rounds.filter(r => r.score).reduce((s,r) => s+r.score, 0) / rounds.filter(r => r.score).length)
    : '--'
  const avgRating = rounds.filter(r => r.overall_rating).length
    ? (rounds.filter(r => r.overall_rating).reduce((s,r) => s+r.overall_rating, 0) / rounds.filter(r => r.overall_rating).length).toFixed(1)
    : '--'
  const states    = [...new Set(rounds.map(r => r.courses?.state).filter(Boolean))]
  const bestRound = rounds.filter(r => r.score).sort((a,b) => a.score-b.score)[0]

  const initials  = (profile?.full_name || profile?.username || user?.email || 'G').slice(0,2).toUpperCase()

  const inputStyle = {
    width:'100%', padding:'11px 13px', borderRadius:10,
    border:`1px solid ${B.border}`, fontSize:14, fontFamily:sans,
    color:B.textNavy, outline:'none', background:'#fff',
    boxSizing:'border-box',
  }

  const tabs = [['rounds','My Rounds'],['stats','Stats'],['edit','Edit Profile']]

  {shareRound && <ShareRoundModal round={shareRound} course={shareCourse} onClose={() => { setShareRound(null); setShareCourse(null) }}/>}

  return (
    <div>
      {/* Profile Header */}
      <div style={{ background:B.navy, borderRadius:20, padding:'26px 22px', marginBottom:18 }}>
        <div style={{ display:'flex', alignItems:'center', gap:15, marginBottom:20 }}>
          <div style={{ width:66, height:66, borderRadius:'50%', background:B.gold, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:serif, fontSize:22, fontWeight:900, color:B.navy, flexShrink:0 }}>
            {initials}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <h1 style={{ color:B.cream, margin:'0 0 3px', fontSize:21, fontWeight:900, fontFamily:serif, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {profile?.full_name || profile?.username || 'Golfer'}
            </h1>
            <div style={{ color:'rgba(240,232,213,0.6)', fontSize:12, fontFamily:sans, marginBottom:8 }}>
              @{profile?.username || 'firstloop'} · Member since {new Date(user?.created_at).getFullYear()}
            </div>
            <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
              {profile?.handicap != null && <Pill gold>⛳ Hdcp: {profile.handicap}</Pill>}
              {profile?.location  && <Pill gold>📍 {profile.location}</Pill>}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {[[rounds.length,'Courses'],[avgScore,'Avg Score'],[avgRating,'Avg Rating'],[states.length,'States']].map(([n,l]) => (
            <div key={l} style={{ background:'rgba(240,232,213,0.08)', borderRadius:11, padding:'11px 8px', textAlign:'center' }}>
              <div style={{ color:B.gold, fontSize:18, fontWeight:900, fontFamily:serif }}>{n}</div>
              <div style={{ color:'rgba(240,232,213,0.5)', fontSize:10, fontWeight:600, fontFamily:sans }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div style={{ background:'#fff', borderRadius:15, padding:'14px 16px', marginBottom:16, border:`1px solid ${B.border}` }}>
        <div style={{ fontSize:14, fontWeight:700, color:B.textNavy, fontFamily:serif, marginBottom:10 }}>🏅 Badges Earned</div>
        <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:4, background:B.feedBg, borderRadius:999, padding:'4px 11px', border:`1px solid ${B.border}` }}>
            <span style={{ fontSize:12 }}>🥇</span><span style={{ fontSize:11, fontWeight:600, color:B.textNavy, fontFamily:sans }}>First Loop Member</span>
          </div>
          {rounds.length >= 1 && (
            <div style={{ display:'flex', alignItems:'center', gap:4, background:B.feedBg, borderRadius:999, padding:'4px 11px', border:`1px solid ${B.border}` }}>
              <span style={{ fontSize:12 }}>⛳</span><span style={{ fontSize:11, fontWeight:600, color:B.textNavy, fontFamily:sans }}>First Round Logged</span>
            </div>
          )}
          {rounds.length >= 5 && (
            <div style={{ display:'flex', alignItems:'center', gap:4, background:B.feedBg, borderRadius:999, padding:'4px 11px', border:`1px solid ${B.border}` }}>
              <span style={{ fontSize:12 }}>🗺️</span><span style={{ fontSize:11, fontWeight:600, color:B.textNavy, fontFamily:sans }}>5 Rounds Logged</span>
            </div>
          )}
          {states.length >= 3 && (
            <div style={{ display:'flex', alignItems:'center', gap:4, background:B.feedBg, borderRadius:999, padding:'4px 11px', border:`1px solid ${B.border}` }}>
              <span style={{ fontSize:12 }}>✈️</span><span style={{ fontSize:11, fontWeight:600, color:B.textNavy, fontFamily:sans }}>Multi-State Golfer</span>
            </div>
          )}
          {profile?.handicap != null && profile.handicap < 10 && (
            <div style={{ display:'flex', alignItems:'center', gap:4, background:B.feedBg, borderRadius:999, padding:'4px 11px', border:`1px solid ${B.border}` }}>
              <span style={{ fontSize:12 }}>🎯</span><span style={{ fontSize:11, fontWeight:600, color:B.textNavy, fontFamily:sans }}>Sub-10 Handicap</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', background:'#fff', borderRadius:12, padding:4, border:`1px solid ${B.border}`, marginBottom:16, gap:4 }}>
        {tabs.map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)}
            style={{ flex:1, padding:'9px 0', borderRadius:9, border:'none', background:tab===v ? B.navy:'transparent', color:tab===v ? B.cream:B.textMid, fontWeight:600, cursor:'pointer', fontSize:12, fontFamily:sans, transition:'all 0.15s' }}>
            {l}
          </button>
        ))}
      </div>

      {/* ── MY ROUNDS ── */}
      {tab==='rounds' && (
        <div>
          <button onClick={() => navigate('/')}
            style={{ width:'100%', background:B.gold, color:B.navy, border:'none', borderRadius:12, padding:'13px 0', fontWeight:800, fontSize:14, cursor:'pointer', marginBottom:12, fontFamily:serif }}>
            + Log a New Round
          </button>
          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              {[...Array(3)].map((_,i) => <div key={i} style={{ background:'#fff', borderRadius:13, height:72, border:`1px solid ${B.border}`, opacity:0.5 }}/>)}
            </div>
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
                const bgColor = r.courses?.bg_color || c?.bg || B.navy
                const icon    = r.courses?.icon     || c?.icon || '⛳'
                return (
                  <div key={r.id} onClick={() => navigate(`/course/${r.course_id}`)}
                    style={{ background:'#fff', borderRadius:13, padding:'13px 15px', cursor:'pointer', border:`1px solid ${B.border}`, display:'flex', alignItems:'center', gap:11, transition:'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 16px rgba(27,48,84,0.08)'; e.currentTarget.style.borderColor=B.gold }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor=B.border }}>
                    <div style={{ width:42, height:42, borderRadius:10, background:bgColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, flexShrink:0 }}>{icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:B.textNavy, fontFamily:sans, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.courses?.name || 'Course'}</div>
                      <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans }}>
                        {r.played_at ? new Date(r.played_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : ''}
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      {r.score        && <div style={{ fontSize:15, fontWeight:800, color:B.textNavy, fontFamily:serif }}>{r.score}</div>}
                      {r.overall_rating && <div style={{ fontSize:12, color:B.gold, fontWeight:700, fontFamily:sans }}>★ {r.overall_rating}</div>}
                    </div>
                    
                    <button onClick={e => { e.stopPropagation(); setShareRound(r); setShareCourse({ id: r.course_id, name: r.courses?.name, location: r.courses?.location, bg: c?.bg || B.navy, icon: c?.icon || '⛳' }) }}
                        style={{ background:'none', border:`1px solid ${B.border}`, borderRadius:999, padding:'4px 10px', cursor:'pointer', fontSize:11, color:B.textMid, fontFamily:sans, fontWeight:600, flexShrink:0 }}> 📤
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── STATS ── */}
      {tab==='stats' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {rounds.filter(r => r.score).length > 0 && (
            <div style={{ background:'#fff', borderRadius:15, padding:18, border:`1px solid ${B.border}` }}>
              <div style={{ fontSize:14, fontWeight:700, color:B.textNavy, fontFamily:serif, marginBottom:14 }}>Score History</div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:100 }}>
                {rounds.filter(r => r.score).slice(0,8).reverse().map((r,i) => (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ width:'100%', borderRadius:4, background:r.score<=82 ? B.green:r.score<=90 ? B.navy:B.gold, height:`${Math.max(12,((120-r.score)/60)*100)}%`, transition:'height 0.5s' }}/>
                    <span style={{ fontSize:10, color:B.textSoft, fontFamily:sans, fontWeight:600 }}>{r.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              ['Rounds Logged', rounds.length, '& counting'],
              ['Avg Score',     avgScore,      'per round'],
              ['Avg Rating',    avgRating,     'out of 10'],
              ['States Played', states.length, states.slice(0,3).join(' · ')||(states[0]||'none yet')],
            ].map(([label,val,sub]) => (
              <div key={label} style={{ background:'#fff', borderRadius:13, padding:'15px 13px', border:`1px solid ${B.border}`, textAlign:'center' }}>
                <div style={{ fontSize:11, color:B.textSoft, fontFamily:sans, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5 }}>{label}</div>
                <div style={{ fontSize:17, fontWeight:800, color:B.textNavy, fontFamily:serif, marginBottom:3 }}>{val}</div>
                <div style={{ fontSize:11, color:B.textSoft, fontFamily:sans }}>{sub}</div>
              </div>
            ))}
          </div>

          {bestRound && (
            <div style={{ background:'#fff', borderRadius:15, padding:18, border:`1px solid ${B.border}` }}>
              <div style={{ fontSize:14, fontWeight:700, color:B.textNavy, fontFamily:serif, marginBottom:12 }}>🏆 Best Round</div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:48, height:48, borderRadius:12, background:B.gold, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:900, color:B.navy, fontFamily:serif }}>
                  {bestRound.score}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:B.textNavy, fontFamily:sans }}>{bestRound.courses?.name}</div>
                  <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans }}>
                    {bestRound.played_at ? new Date(bestRound.played_at).toLocaleDateString('en-US', { month:'long', year:'numeric' }) : ''}
                  </div>
                </div>
              </div>
            </div>
          )}

          <button onClick={() => signOut().then(() => navigate('/auth'))}
            style={{ width:'100%', background:'#fff', color:B.textMid, border:`1px solid ${B.border}`, borderRadius:12, padding:'13px 0', fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:sans }}>
            Sign Out
          </button>
        </div>
      )}

      {/* ── EDIT PROFILE ── */}
      {tab==='edit' && (
        <div style={{ background:'#fff', borderRadius:16, padding:24, border:`1px solid ${B.border}` }}>
          <h3 style={{ margin:'0 0 20px', color:B.textNavy, fontFamily:serif, fontSize:18 }}>Edit Profile</h3>

          {saveMsg && (
            <div style={{ background: saveMsg.startsWith('Error') ? '#fde8e8':'#e8f5e9', color: saveMsg.startsWith('Error') ? '#c00':'#1E4530', borderRadius:8, padding:'10px 14px', fontSize:13, fontFamily:sans, marginBottom:16 }}>
              {saveMsg}
            </div>
          )}

          <form onSubmit={saveProfile}>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, fontWeight:600, color:B.textMid, fontFamily:sans, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Full Name</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" style={inputStyle}/>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, fontWeight:600, color:B.textMid, fontFamily:sans, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. treyc" style={inputStyle}/>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, fontWeight:600, color:B.textMid, fontFamily:sans, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Birmingham, AL" style={inputStyle}/>
            </div>

            <div style={{ marginBottom:24 }}>
              <label style={{ fontSize:12, fontWeight:600, color:B.textMid, fontFamily:sans, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Handicap Index</label>
              <input value={handicap} onChange={e => setHandicap(e.target.value)} placeholder="e.g. 8.4" type="number" step="0.1" min="0" max="54" style={inputStyle}/>
            </div>

            <button type="submit" disabled={saving}
              style={{ width:'100%', background:saving ? B.border:B.gold, color:B.navy, border:'none', borderRadius:12, padding:'13px 0', fontWeight:800, fontSize:14, cursor:saving ? 'not-allowed':'pointer', fontFamily:serif, transition:'all 0.15s', marginBottom:10 }}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>

          <div style={{ borderTop:`1px solid ${B.border}`, paddingTop:16, marginTop:6 }}>
            <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans, marginBottom:8 }}>Account email: {user?.email}</div>
            {isAdmin && (
              <button onClick={() => navigate('/admin')}
                style={{ width:'100%', background:B.navy, color:B.cream, border:'none', borderRadius:12, padding:'13px 0', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:sans, marginBottom:10 }}>
                ⚙️ Admin Dashboard
              </button>
            )}
            <button onClick={() => signOut().then(() => navigate('/auth'))}
              style={{ width:'100%', background:'#fff', color:B.textMid, border:`1px solid ${B.border}`, borderRadius:12, padding:'13px 0', fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:sans }}>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}