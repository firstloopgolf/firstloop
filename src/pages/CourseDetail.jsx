import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { B, serif, sans } from '../lib/data.js'
import { Avatar, RatingChip, RatingRow, NatBadge, StatBadge, TabBar } from '../components/UI.jsx'
import LogRoundModal from '../components/LogRoundModal.jsx'
import { useCourse } from '../hooks/useCourses.js'
import ShareRoundModal from '../components/ShareRoundModal.jsx'

export default function CourseDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { course, loading: courseLoading } = useCourse(parseInt(id))

  const [tab, setTab]             = useState('feed')
  const [rounds, setRounds]       = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loadingRounds, setLoadingRounds] = useState(true)
  const [shareRound, setShareRound] = useState(null)

  useEffect(() => { if (id) fetchRounds() }, [id])

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
      {showModal && <LogRoundModal courseId={course.id} courseName={course.name} onClose={() => setShowModal(false)} onSuccess={fetchRounds}/>}
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
          <button onClick={() => user ? setShowModal(true) : navigate('/auth')}
            style={{ width:'100%', background:B.gold, color:B.navy, border:'none', borderRadius:12, padding:'14px 0', fontWeight:800, fontSize:15, cursor:'pointer', marginBottom:14, fontFamily:serif }}>
            + Log Your Round Here
          </button>
          {loadingRounds ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:B.textSoft, fontFamily:sans }}>Loading reviews...</div>
          ) : rounds.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', background:'#fff', borderRadius:16, border:`1px solid ${B.border}` }}>
              <div style={{ fontSize:40, marginBottom:12 }}>⛳</div>
              <div style={{ fontSize:16, fontWeight:700, color:B.textNavy, fontFamily:serif, marginBottom:6 }}>No reviews yet</div>
              <div style={{ fontSize:13, color:B.textSoft, fontFamily:sans }}>Be the first to log a round here</div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {rounds.map((round,i) => (
                <div key={round.id} style={{ background:'#fff', borderRadius:14, border:`1px solid ${B.border}`, padding:'16px 18px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <Avatar initials={(round.profiles?.full_name || round.profiles?.username || 'U').slice(0,2).toUpperCase()} size={40} color={i%2===0 ? B.navy:B.green}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:B.textNavy, fontFamily:sans }}>{round.profiles?.full_name || round.profiles?.username || 'Golfer'}</div>
                      <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans }}>{new Date(round.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</div>
                    </div>
                    {round.overall_rating && <RatingChip value={round.overall_rating}/>}
                  </div>
                  {round.comment && <p style={{ margin:'0 0 12px', fontSize:14, color:B.textNavy, lineHeight:1.65, fontFamily:sans, fontStyle:'italic' }}>"{round.comment}"</p>}
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
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==='ratings' && (
        <div style={{ background:'#fff', borderRadius:16, padding:24, border:`1px solid ${B.border}` }}>
          <div style={{ textAlign:'center', marginBottom:24 }}>
            <div style={{ fontSize:52, fontWeight:900, color:B.gold, fontFamily:serif, lineHeight:1 }}>{avgRating}</div>
            <div style={{ fontSize:13, color:B.textSoft, fontFamily:sans, marginTop:4 }}>
              {rounds.length > 0 ? `${rounds.length} First Loop ${rounds.length===1?'review':'reviews'}` : `${course.reviews.toLocaleString()} ratings`}
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

      {tab==='about' && (
        <div style={{ background:'#fff', borderRadius:16, padding:24, border:`1px solid ${B.border}` }}>
          <h3 style={{ margin:'0 0 16px', color:B.textNavy, fontFamily:serif, fontSize:18 }}>Course Details</h3>
          {[['📍 Location',course.location],['🏴 State',course.state],['⛳ Par',course.par],['⛳ Holes',course.holes||18],['💰 Price Range',course.price],['🏆 National Rank',`#${course.natRank}`],[`📍 ${course.state} Rank`,`#${course.stRank}`]].map(([k,v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'11px 0', borderBottom:`1px solid ${B.feedBg}` }}>
              <span style={{ fontSize:13, color:B.textMid, fontFamily:sans }}>{k}</span>
              <span style={{ fontSize:13, fontWeight:700, color:B.textNavy, fontFamily:sans }}>{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}