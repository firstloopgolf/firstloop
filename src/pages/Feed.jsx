import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { B, serif, sans } from '../lib/data.js'
import { Avatar, RatingChip, RatingRow, NatBadge, PageBanner } from '../components/UI.jsx'

export default function Feed() {
  const navigate        = useNavigate()
  const { user }        = useAuth()
  const [rounds, setRounds]   = useState([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked]     = useState({})

  useEffect(() => { fetchFeed() }, [])

  async function fetchFeed() {
    setLoading(true)
    const { data } = await supabase
      .from('rounds')
      .select(`
        *,
        profiles(username, full_name),
        courses(id, name, state, nat_rank, icon, bg_color)
      `)
      .order('created_at', { ascending: false })
      .limit(30)
    setRounds(data || [])
    setLoading(false)
  }

  async function toggleLike(roundId) {
    if (!user) { navigate('/auth'); return }
    if (liked[roundId]) {
      await supabase.from('likes').delete().eq('user_id', user.id).eq('round_id', roundId)
      setLiked(p => ({ ...p, [roundId]: false }))
    } else {
      await supabase.from('likes').insert({ user_id: user.id, round_id: roundId })
      setLiked(p => ({ ...p, [roundId]: true }))
    }
  }

  return (
    <div>
      <PageBanner icon="📋" title="Community Feed" subtitle="Latest rounds & reviews from golfers in the network" bg={B.green}/>

      <button onClick={() => user ? navigate('/') : navigate('/auth')}
        style={{ width:'100%', background:B.gold, color:B.navy, border:'none', borderRadius:12, padding:'13px 0', fontWeight:800, fontSize:15, cursor:'pointer', marginBottom:16, fontFamily:serif }}>
        + Log a New Round
      </button>

      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {[...Array(4)].map((_,i) => (
            <div key={i} style={{ background:'#fff', borderRadius:16, height:220, border:`1px solid ${B.border}`, opacity:0.5 }}/>
          ))}
        </div>
      ) : rounds.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', background:'#fff', borderRadius:16, border:`1px solid ${B.border}` }}>
          <div style={{ fontSize:48, marginBottom:16 }}>⛳</div>
          <div style={{ fontSize:18, fontWeight:700, color:B.textNavy, fontFamily:serif, marginBottom:8 }}>No rounds logged yet</div>
          <div style={{ fontSize:13, color:B.textSoft, fontFamily:sans, marginBottom:20 }}>Be the first to log a round</div>
          <button onClick={() => navigate('/')}
            style={{ background:B.gold, color:B.navy, border:'none', borderRadius:12, padding:'11px 24px', fontWeight:700, cursor:'pointer', fontFamily:serif }}>
            Find a Course
          </button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {rounds.map((round, i) => {
            const c = round.courses
            return (
              <div key={round.id} style={{ background:'#fff', borderRadius:16, overflow:'hidden', border:`1px solid ${B.border}` }}>

                {/* Course header strip */}
                <div onClick={() => c && navigate(`/course/${c.id}`)}
                  style={{ background:c?.bg_color||B.navy, padding:'10px 16px', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                  <span style={{ fontSize:20 }}>{c?.icon||'⛳'}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ color:B.cream, fontSize:13, fontWeight:700, fontFamily:sans }}>{c?.name||'Golf Course'}</div>
                    <div style={{ display:'flex', gap:6, marginTop:3 }}>
                      {c?.nat_rank <= 100 && <NatBadge rank={c.nat_rank}/>}
                    </div>
                  </div>
                  <div style={{ color:'rgba(240,232,213,0.5)', fontSize:11, fontFamily:sans }}>
                    {new Date(round.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
                  </div>
                </div>

                {/* Review body */}
                <div style={{ padding:'15px 17px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <Avatar
                      initials={(round.profiles?.full_name || round.profiles?.username || 'G').slice(0,2).toUpperCase()}
                      size={40}
                      color={i%3===0 ? B.navy : i%3===1 ? B.green : '#5a4a2a'}
                    />
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:B.textNavy, fontFamily:sans }}>
                        {round.profiles?.full_name || round.profiles?.username || 'Golfer'}
                      </div>
                      <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans }}>
                        {round.played_at ? new Date(round.played_at).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' }) : ''}
                      </div>
                    </div>
                    {round.overall_rating && <RatingChip value={round.overall_rating}/>}
                  </div>

                  {round.comment && (
                    <p style={{ margin:'0 0 12px', fontSize:14, color:B.textNavy, lineHeight:1.65, fontFamily:sans, fontStyle:'italic' }}>
                      "{round.comment}"
                    </p>
                  )}
                  
                  {round.photo_url && (
                    <div style={{ borderRadius:12, overflow:'hidden', marginBottom:12 }}>
                      <img src={round.photo_url} alt="Round photo"
                        style={{ width:'100%', maxHeight:240, objectFit:'cover', display:'block' }}/>
                    </div>
                  )
                  }

                  <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:12 }}>
                    {round.conditions_rating && <RatingRow label="Conditions" value={round.conditions_rating} color={B.green}/>}
                    {round.value_rating      && <RatingRow label="Value"      value={round.value_rating}      color={B.navy}/>}
                    {round.vibes_rating      && <RatingRow label="Facilities"      value={round.vibes_rating}      color={B.gold}/>}
                  </div>

                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:10, borderTop:`1px solid ${B.feedBg}` }}>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
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
                    <button onClick={() => toggleLike(round.id)}
                      style={{ background:'none', border:`1px solid ${liked[round.id] ? B.gold:B.border}`, borderRadius:999, padding:'5px 14px', cursor:'pointer', fontSize:12, color:liked[round.id] ? B.gold:B.textSoft, fontFamily:sans, fontWeight:600, transition:'all 0.15s' }}>
                      {liked[round.id] ? '♥' : '♡'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}