import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { Avatar, RatingChip, RatingRow, NatBadge, StatBadge, TabBar } from '../components/UI.jsx'
import { useCourse } from '../hooks/useCourses.js'
import ShareRoundModal from '../components/ShareRoundModal.jsx'
import FindFriends from '../components/FindFriends.jsx'
import CourseUpdateModal from '../components/CourseUpdateModal.jsx'
import RoundComments from '../components/RoundComments.jsx'

export default function CourseDetail() {
  const { B, serif, sans } = useTheme()
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { course, loading: courseLoading } = useCourse(parseInt(id))

  const [tab, setTab]             = useState('feed')
  const [rounds, setRounds]       = useState([])
  const [loadingRounds, setLoadingRounds] = useState(true)
  const [shareRound, setShareRound]         = useState(null)
  const [players, setPlayers]               = useState([])
  const [showFindFriends, setShowFindFriends]   = useState(false)
  const [showUpdateModal, setShowUpdateModal]   = useState(false)
  const [followTarget, setFollowTarget]       = useState(null)
  const [wantToPlay,    setWantToPlay]         = useState(false)
  const [wantLoading,   setWantLoading]         = useState(false)

  useEffect(() => { if (id) { fetchRounds(); fetchPlayers() } }, [id])
  useEffect(() => { if (id && user) checkWantToPlay() }, [id, user])

    // Update page title and meta for SEO
    useEffect(() => {
      if (course) {
        document.title = `${course.name} — Reviews & Ratings | First Loop`
        const desc = document.querySelector('meta[name="description"]')
        if (desc) desc.setAttribute('content',
          `${course.name} in ${course.location}. Rated ${course.rating}/10 by real golfers. Read reviews on course conditions, value, and facilities on First Loop.`
        )
      }
      return () => {
        document.title = 'First Loop — Rate, Rank & Discover Golf Courses'
      }
    }, [course])

  async function fetchRounds() {
    setLoadingRounds(true)
    const { data } = await supabase
      .from('rounds')
      .select('*, profiles(username, full_name)')
      .eq('course_id', id)
      .order('created_at', { ascending: false })
      .limit(20)
    setRounds(data || [])
    setLoadingRounds(false)
  }

  async function checkWantToPlay() {
    const { data } = await supabase.from('want_to_play')
      .select('id').eq('user_id', user.id).eq('course_id', parseInt(id)).maybeSingle()
    setWantToPlay(!!data)
  }

  async function toggleWantToPlay() {
    if (!user) { navigate('/auth'); return }
    setWantLoading(true)
    if (wantToPlay) {
      await supabase.from('want_to_play').delete()
        .eq('user_id', user.id).eq('course_id', parseInt(id))
      setWantToPlay(false)
    } else {
      await supabase.from('want_to_play').insert({ user_id: user.id, course_id: parseInt(id) })
      setWantToPlay(true)
    }
    setWantLoading(false)
  }

  async function fetchPlayers() {
    const { data } = await supabase
      .from('rounds')
      .select('user_id, profiles(id, username, full_name)')
      .eq('course_id', id)
      .limit(12)
    // Deduplicate by user_id
    const seen = new Set()
    const unique = (data || []).filter(r => {
      if (!r.profiles || seen.has(r.user_id)) return false
      seen.add(r.user_id)
      return true
    })
    setPlayers(unique.map(r => r.profiles))
  }

  if (courseLoading) return (
    <div style={{ textAlign:'center', padding:'60px 0', fontFamily:sans, color:B.textSoft }}>
      <div style={{ fontSize:48, marginBottom:16 }}>⛳</div>
      <div>Loading course...</div>
    </div>
  )

  if (!course) return (
    <div style={{ textAlign:'center', padding:'60px 0', fontFamily:sans, color:B.textMid }}>
      <div style={{ fontSize:48, marginBottom:16 }}>⛳</div>
      <div style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>Course not found</div>
      <button onClick={() => navigate('/')} style={{ background:B.gold, color:B.navy, border:'none', borderRadius:12, padding:'10px 24px', fontWeight:700, cursor:'pointer', fontFamily:sans }}>Back to Discover</button>
    </div>
  )

  const avgRating = rounds.length
    ? (rounds.reduce((s,r) => s+(r.overall_rating||0), 0) / rounds.length).toFixed(1)
    : course.rating

  return (
    <div style={{ maxWidth:680, margin:'0 auto' }}>
      {shareRound && <ShareRoundModal round={shareRound} course={course} onClose={() => setShareRound(null)}/>}
      <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:B.textMid, cursor:'pointer', padding:'0 0 16px', fontSize:13, fontFamily:sans, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>← Back</button>

      {/* Hero */}
      <div style={{ background:course.bg, borderRadius:20, overflow:'hidden', marginBottom:20 }}>
        <div style={{ padding:'26px 26px 0' }}>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
            <NatBadge rank={course.natRank}/><StatBadge state={course.state} rank={course.stRank}/>
          </div>
          <div style={{ fontSize:60, marginBottom:8 }}>{course.icon}</div>
          <h1 style={{ color:B.cream, fontSize:24, fontWeight:900, margin:'0 0 4px', fontFamily:serif, lineHeight:1.15 }}>{course.name}</h1>
          <p style={{ color:'rgba(240,232,213,0.7)', margin:'0 0 12px', fontSize:13, fontFamily:sans }}>📍 {course.location} · Par {course.par} · {course.price}</p>
          <p style={{ color:'rgba(240,232,213,0.85)', margin:0, fontSize:14, fontFamily:sans, lineHeight:1.65, paddingBottom:22 }}>{course.desc}</p>
        </div>
        <div style={{ background:'rgba(0,0,0,0.25)', padding:'16px 26px', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {[['Overall',avgRating],['Conditions',course.conditions],['Value',course.value],['Vibes',course.vibes]].map(([label,val]) => (
            <div key={label} style={{ textAlign:'center' }}>
              <div style={{ color:B.gold, fontSize:22, fontWeight:900, fontFamily:serif, lineHeight:1 }}>{parseFloat(val).toFixed(1)}</div>
              <div style={{ color:'rgba(240,232,213,0.55)', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:sans, marginTop:3 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <TabBar tabs={[['feed','Feed'],['ratings','Ratings'],['about','About']]} active={tab} onChange={setTab}/>

      {tab==='feed' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:8, marginBottom:14 }}>
            <button onClick={() => user ? navigate('/log', { state: { courseId: course.id, courseName: course.name, courseIcon: course.icon, courseBg: course.bg, courseState: course.state } }) : navigate('/auth')}
              style={{ background:B.gold, color:B.navy, border:'none', borderRadius:12, padding:'14px 0', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:serif }}>
              + Log Your Round Here
            </button>
            <button
              onClick={toggleWantToPlay}
              disabled={wantLoading}
              title={wantToPlay ? 'Remove from Want to Play' : 'Add to Want to Play'}
              style={{ background: wantToPlay ? B.gold : B.white, color: wantToPlay ? B.navy : B.textMid, border: `1.5px solid ${wantToPlay ? B.gold : B.border}`, borderRadius:12, padding:'14px 16px', fontWeight:700, fontSize:16, cursor: wantLoading ? 'not-allowed' : 'pointer', transition:'all 0.15s', opacity: wantLoading ? 0.6 : 1, whiteSpace:'nowrap' }}>
              {wantToPlay ? '★ Saved' : '☆ Want to Play'}
            </button>
          </div>
          {loadingRounds ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:B.textSoft, fontFamily:sans }}>Loading reviews...</div>
          ) : rounds.length === 0 ? (
            <div style={{ background:B.white, borderRadius:16, border:`1px solid ${B.border}`, overflow:'hidden' }}>
              {/* Hero banner */}
              <div style={{ background:course.bg, padding:'28px 24px', textAlign:'center' }}>
                <div style={{ fontSize:52, marginBottom:8 }}>{course.icon}</div>
                <h3 style={{ color:B.cream, fontSize:20, fontWeight:900, fontFamily:serif, margin:'0 0 6px' }}>
                  Be the First to Review
                </h3>
                <p style={{ color:'rgba(240,232,213,0.7)', fontSize:13, fontFamily:sans, margin:0, lineHeight:1.6 }}>
                  {course.name} has no reviews yet on First Loop.<br/>Your review will be the one that starts it all.
                </p>
              </div>

              {/* What gets rated */}
              <div style={{ padding:'20px 24px', borderBottom:`1px solid ${B.feedBg}` }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                  {[
                    ['⛺', 'Conditions', 'Fairways, greens & upkeep'],
                    ['💰', 'Value',      'Worth the green fee?'],
                    ['🏌️', 'Facilities', 'Clubhouse & atmosphere'],
                  ].map(([icon, label, desc]) => (
                    <div key={label} style={{ textAlign:'center', padding:'12px 8px', background:B.feedBg, borderRadius:12 }}>
                      <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
                      <div style={{ fontSize:12, fontWeight:700, color:B.textNavy, fontFamily:sans, marginBottom:3 }}>{label}</div>
                      <div style={{ fontSize:10, color:B.textSoft, fontFamily:sans, lineHeight:1.4 }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div style={{ padding:'20px 24px', textAlign:'center' }}>
                <p style={{ fontSize:13, color:B.textSoft, fontFamily:sans, margin:'0 0 16px', lineHeight:1.6 }}>
                  Played {course.name}? Share your experience and help other golfers decide if it belongs on their bucket list.
                </p>
                <button onClick={() => user ? navigate('/log', { state: { courseId: course.id, courseName: course.name, courseIcon: course.icon, courseBg: course.bg, courseState: course.state } }) : navigate('/auth')}
                  style={{ width:'100%', background:B.gold, color:B.navy, border:'none', borderRadius:12, padding:'14px 0', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:serif, marginBottom:10 }}>
                  ⛳ Log Your Round Here
                </button>
                {!user && (
                  <p style={{ fontSize:12, color:B.textSoft, fontFamily:sans, margin:0 }}>
                    <span style={{ cursor:'pointer', color:B.navy, fontWeight:600, textDecoration:'underline' }} onClick={() => navigate('/auth')}>
                      Create a free account
                    </span>
                    {' '}to start reviewing
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {rounds.map((round,i) => (
                <div key={round.id} style={{ background:B.white, borderRadius:14, border:`1px solid ${B.border}`, padding:'16px 18px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <Avatar initials={(round.profiles?.full_name || round.profiles?.username || 'U').slice(0,2).toUpperCase()} size={40} color={i%2===0 ? B.navy:B.green}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:B.textNavy, fontFamily:sans }}>{round.profiles?.full_name || round.profiles?.username || 'Golfer'}</div>
                      <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans }}>{new Date(round.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</div>
                    </div>
                    {round.overall_rating && <RatingChip value={round.overall_rating}/>}
                  </div>
                  {round.comment && <p style={{ margin:'0 0 12px', fontSize:14, color:B.textNavy, lineHeight:1.65, fontFamily:sans, fontStyle:'italic' }}>"{round.comment}"</p>}
                  {round.photo_url && (
                    <div style={{ borderRadius:12, overflow:'hidden', marginBottom:12 }}>
                      <img src={round.photo_url} alt="Round photo"
                        style={{ width:'100%', maxHeight:240, objectFit:'cover', display:'block' }}/>
                    </div>
                  )
                  }
                  <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:12 }}>
                    {round.conditions_rating && <RatingRow label="Conditions" value={round.conditions_rating} color={B.green}/>}
                    {round.value_rating      && <RatingRow label="Value"      value={round.value_rating}      color={B.navy}/>}
                    {round.vibes_rating      && <RatingRow label="Facilities"      value={round.vibes_rating}      color={B.gold}/>}
                  </div>
                 <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  {round.score && (
                    <span style={{ background:B.feedBg, border:`1px solid ${B.border}`, borderRadius:999, padding:'4px 12px', fontSize:12, fontWeight:700, fontFamily:sans, color:B.textNavy }}>⛳ Score: {round.score}</span>
                  )}
                  <button onClick={() => setShareRound(round)}
                    style={{ background:'none', border:`1px solid ${B.border}`, borderRadius:999, padding:'4px 14px', cursor:'pointer', fontSize:12, color:B.textMid, fontFamily:sans, fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
                    📤 Share
                  </button>
                </div>
                <div style={{ marginTop: 10 }}>
                  <RoundComments roundId={round.id}/>
                </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==='ratings' && (
        <div style={{ background:B.white, borderRadius:16, padding:24, border:`1px solid ${B.border}` }}>
          {course.hasSeedRating && rounds.length === 0 && (
            <div style={{ background:'rgba(196,150,58,0.1)', border:`1px solid rgba(196,150,58,0.25)`, borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:12, color:'#8a6010', fontFamily:sans, lineHeight:1.6 }}>
              <strong>✦ Editorial Rating</strong> — This course hasn't been reviewed on First Loop yet. The rating shown is a seed based on expert publications and course reputation. It will update automatically as community reviews come in.
            </div>
          )}
          <div style={{ textAlign:'center', marginBottom:24 }}>
            <div style={{ fontSize:52, fontWeight:900, color:B.gold, fontFamily:serif, lineHeight:1 }}>{avgRating}</div>
            <div style={{ fontSize:13, color:B.textSoft, fontFamily:sans, marginTop:4 }}>
              {rounds.length > 0
                ? `${rounds.length} First Loop ${rounds.length===1?'review':'reviews'}`
                : course.hasSeedRating
                  ? '✦ Editorial seed rating'
                  : 'No reviews yet'}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            {[['⛺ Course Conditions',course.conditions,B.green],['💰 Value for Money',course.value,B.navy],['🏌️ Facilities',course.vibes,B.gold]].map(([label,val,color]) => (
              <div key={label}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontSize:14, fontWeight:600, color:B.textNavy, fontFamily:sans }}>{label}</span>
                  <span style={{ fontSize:16, fontWeight:800, color, fontFamily:serif }}>{parseFloat(val).toFixed(1)}</span>
                </div>
                <div style={{ height:10, borderRadius:5, background:B.feedBg, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(val/10)*100}%`, background:color, borderRadius:5 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Golfers who've played this */}
      {players.length > 0 && (
        <div style={{ background: B.white, borderRadius: 16, padding: '18px 20px', border: `1px solid ${B.border}`, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: B.textNavy, fontFamily: serif }}>
              Golfers who've played this
            </div>
            <button onClick={() => setShowFindFriends(true)}
              style={{ background: 'none', border: `1px solid ${B.border}`, borderRadius: 20, padding: '5px 12px', fontSize: 12, color: B.textMid, cursor: 'pointer', fontFamily: sans, fontWeight: 600 }}>
              Follow them
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {players.map(p => {
              const initials = (p.full_name || p.username || 'G').slice(0, 2).toUpperCase()
              const avatarColors = ['#2d5a27','#1a3d5a','#5a3a1a','#3a1a5a','#1a5a3a']
              const color = avatarColors[(p.username?.charCodeAt(0) || 0) % avatarColors.length]
              return (
                <div key={p.id}
                  onClick={() => navigate(`/golfer/${p.id}`)}
                  title={p.full_name || p.username}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: sans }}>
                    {initials}
                  </div>
                  <div style={{ fontSize: 10, color: B.textSoft, fontFamily: sans, maxWidth: 48, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    @{p.username || 'golfer'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {showFindFriends && <FindFriends onClose={() => setShowFindFriends(false)}/>}
      {showUpdateModal && course && <CourseUpdateModal course={course} onClose={() => setShowUpdateModal(false)}/>}

      {tab==='about' && (
        <div style={{ background:B.white, borderRadius:16, padding:24, border:`1px solid ${B.border}` }}>
          <h3 style={{ margin:'0 0 16px', color:B.textNavy, fontFamily:serif, fontSize:18 }}>Course Details</h3>
          {[
            ['📍 Location', course.location],
            ['🏴 State', course.state],
            ['⛳ Par', course.par],
            ['⛳ Holes', course.holes || 18],
            ['💰 Price Range', course.price],
            ['🏆 National Rank', course.natRank < 999 ? `#${course.natRank}` : null],
            [`📍 ${course.state} Rank`, course.stRank < 999 ? `#${course.stRank}` : null],
          ].filter(([,v]) => v).map(([k,v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'11px 0', borderBottom:`1px solid ${B.feedBg}` }}>
              <span style={{ fontSize:13, color:B.textMid, fontFamily:sans }}>{k}</span>
              <span style={{ fontSize:13, fontWeight:700, color:B.textNavy, fontFamily:sans }}>{v}</span>
            </div>
          ))}
          {course.website && (
            <div style={{ display:'flex', justifyContent:'space-between', padding:'11px 0', borderBottom:`1px solid ${B.feedBg}` }}>
              <span style={{ fontSize:13, color:B.textMid, fontFamily:sans }}>🔗 Website</span>
              <a href={course.website} target="_blank" rel="noopener noreferrer"
                style={{ fontSize:13, fontWeight:700, color:B.green, fontFamily:sans, textDecoration:'none' }}>
                Visit Site →
              </a>
            </div>
          )}
          <button onClick={() => setShowUpdateModal(true)}
            style={{ width:'100%', marginTop:16, background:B.feedBg, color:B.textMid, border:`1px solid ${B.border}`, borderRadius:10, padding:'10px 0', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:sans }}>
            ✏️ Suggest a correction
          </button>
        </div>
      )}
    </div>
  )
}