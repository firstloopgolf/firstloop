import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { B, serif, sans } from '../lib/data.js'
import { Avatar, NatBadge, PageBanner } from '../components/UI.jsx'
import ShareRoundModal from '../components/ShareRoundModal.jsx'

// Convert stored rating (2–10) to emoji
function ratingEmoji(v) {
  if (!v) return null
  if (v <= 2)  return '😤'
  if (v <= 4)  return '😕'
  if (v <= 6)  return '😐'
  if (v <= 8)  return '😊'
  return '🤩'
}

// The "#X in their list" rank badge — the core differentiator
function EloRankBadge({ rank }) {
  if (!rank) return null
  const isTop3 = rank <= 3
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: isTop3 ? `${B.gold}20` : 'rgba(27,48,84,0.08)',
      border: `1.5px solid ${isTop3 ? B.gold : B.border}`,
      borderRadius: 999, padding: '4px 10px',
    }}>
      <span style={{ fontFamily: serif, fontSize: 15, fontWeight: 900, color: isTop3 ? B.gold : B.textNavy }}>
        #{rank}
      </span>
      <span style={{ fontFamily: sans, fontSize: 10, color: B.textSoft, fontWeight: 600 }}>
        in their list
      </span>
    </div>
  )
}

// Compact 3-axis emoji pills
function AxisPills({ conditions, value, vibes }) {
  const axes = [
    { label: 'Conditions', emoji: ratingEmoji(conditions), color: B.green },
    { label: 'Value',      emoji: ratingEmoji(value),      color: B.navy  },
    { label: 'Vibes',      emoji: ratingEmoji(vibes),      color: B.gold  },
  ].filter(a => a.emoji)

  if (axes.length === 0) return null

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
      {axes.map(({ label, emoji, color }) => (
        <div key={label} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: B.feedBg, border: `1px solid ${B.border}`,
          borderRadius: 999, padding: '3px 10px',
        }}>
          <span style={{ fontSize: 14 }}>{emoji}</span>
          <span style={{ fontFamily: sans, fontSize: 10, fontWeight: 600, color: B.textSoft, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function Feed() {
  const navigate          = useNavigate()
  const { user }          = useAuth()
  const [rounds,     setRounds]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [liked,      setLiked]      = useState({})
  const [shareRound, setShareRound] = useState(null)  // ← was missing, caused bug
  const [shareCourse,setShareCourse]= useState(null)

  useEffect(() => { fetchFeed() }, [user])

  async function fetchFeed() {
    setLoading(true)

    // If logged in, try to show followed users' rounds first
    if (user) {
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      const followingIds = (follows || []).map(f => f.following_id)

      if (followingIds.length > 0) {
        // Show followed users + own rounds
        const ids = [...followingIds, user.id]
        const { data } = await supabase
          .from('rounds')
          .select('*, profiles(username, full_name, avatar_url), courses(id, name, state, nat_rank, icon, bg_color)')
          .in('user_id', ids)
          .order('created_at', { ascending: false })
          .limit(40)
        setRounds(data || [])
        setLoading(false)
        return
      }
    }

    // Fallback: show all public rounds
    const { data } = await supabase
      .from('rounds')
      .select('*, profiles(username, full_name, avatar_url), courses(id, name, state, nat_rank, icon, bg_color)')
      .order('created_at', { ascending: false })
      .limit(40)
    setRounds(data || [])
    setLoading(false)
  }

  // Load initial liked state for user
  useEffect(() => {
    if (!user || rounds.length === 0) return
    async function loadLikes() {
      const ids = rounds.map(r => r.id)
      const { data } = await supabase
        .from('likes')
        .select('round_id')
        .eq('user_id', user.id)
        .in('round_id', ids)
      const map = {}
      ;(data || []).forEach(l => { map[l.round_id] = true })
      setLiked(map)
    }
    loadLikes()
  }, [rounds, user])

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
      {/* Share modal */}
      {shareRound && (
        <ShareRoundModal
          round={shareRound}
          course={shareCourse}
          onClose={() => { setShareRound(null); setShareCourse(null) }}
        />
      )}

      <PageBanner icon="📋" title="Community Feed" subtitle="Latest rounds from golfers in the network" bg={B.green}/>

      <button
        onClick={() => user ? navigate('/log') : navigate('/auth')}
        style={{ width: '100%', background: B.gold, color: B.navy, border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 800, fontSize: 15, cursor: 'pointer', marginBottom: 16, fontFamily: serif }}
      >
        + Log a New Round
      </button>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, height: 240, border: `1px solid ${B.border}`, opacity: 0.5 }}/>
          ))}
        </div>
      ) : rounds.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: 16, border: `1px solid ${B.border}` }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⛳</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: B.textNavy, fontFamily: serif, marginBottom: 8 }}>No rounds yet</div>
          <div style={{ fontSize: 13, color: B.textSoft, fontFamily: sans, marginBottom: 20 }}>Be the first to log a round</div>
          <button onClick={() => navigate('/log')}
            style={{ background: B.gold, color: B.navy, border: 'none', borderRadius: 12, padding: '11px 24px', fontWeight: 700, cursor: 'pointer', fontFamily: serif }}>
            Log a Round
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {rounds.map((round, i) => {
            const c = round.courses
            const p = round.profiles
            const initials = (p?.full_name || p?.username || 'G').slice(0, 2).toUpperCase()
            const avatarColors = [B.navy, B.green, '#5a4a2a']

            return (
              <div key={round.id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: `1px solid ${B.border}` }}>

                {/* Course header strip */}
                <div
                  onClick={() => c && navigate(`/course/${c.id}`)}
                  style={{ background: c?.bg_color || B.navy, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                >
                  <span style={{ fontSize: 20 }}>{c?.icon || '⛳'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: B.cream, fontSize: 14, fontWeight: 800, fontFamily: serif }}>{c?.name || 'Golf Course'}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                      {c?.nat_rank <= 100 && <NatBadge rank={c.nat_rank}/>}
                    </div>
                  </div>
                  <div style={{ color: 'rgba(240,232,213,0.5)', fontSize: 11, fontFamily: sans }}>
                    {new Date(round.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                {/* Review body */}
                <div style={{ padding: '14px 16px' }}>

                  {/* User info + Elo rank badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <Avatar
                      initials={initials}
                      size={40}
                      color={avatarColors[i % 3]}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: B.textNavy, fontFamily: sans }}>
                        {p?.full_name || p?.username || 'Golfer'}
                      </div>
                      <div style={{ fontSize: 12, color: B.textSoft, fontFamily: sans }}>
                        {round.played_at ? new Date(round.played_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                      </div>
                    </div>
                    {/* THE DIFFERENTIATOR — #X in their list */}
                    <EloRankBadge rank={round.personal_rank}/>
                  </div>

                  {/* Photo */}
                  {round.photo_url && (
                    <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
                      <img src={round.photo_url} alt="Round photo"
                        style={{ width: '100%', maxHeight: 240, objectFit: 'cover', display: 'block' }}/>
                    </div>
                  )}

                  {/* Comment */}
                  {round.comment && (
                    <p style={{ margin: '0 0 12px', fontSize: 14, color: B.textNavy, lineHeight: 1.65, fontFamily: sans, fontStyle: 'italic' }}>
                      "{round.comment}"
                    </p>
                  )}

                  {/* 3-axis emoji pills */}
                  <AxisPills
                    conditions={round.conditions_rating}
                    value={round.value_rating}
                    vibes={round.vibes_rating}
                  />

                  {/* Footer: score + share + like */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${B.feedBg}` }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {round.score && (
                        <span style={{ background: B.feedBg, border: `1px solid ${B.border}`, borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 700, fontFamily: sans, color: B.textNavy }}>
                          ⛳ {round.score}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setShareRound(round)
                          setShareCourse({ id: c?.id, name: c?.name, location: c?.location, bg: c?.bg_color || B.navy, icon: c?.icon || '⛳' })
                        }}
                        style={{ background: 'none', border: `1px solid ${B.border}`, borderRadius: 999, padding: '4px 12px', cursor: 'pointer', fontSize: 12, color: B.textMid, fontFamily: sans, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        📤 Share
                      </button>
                    </div>

                    <button
                      onClick={() => toggleLike(round.id)}
                      style={{ background: 'none', border: `1px solid ${liked[round.id] ? B.gold : B.border}`, borderRadius: 999, padding: '5px 14px', cursor: 'pointer', fontSize: 14, color: liked[round.id] ? B.gold : B.textSoft, fontFamily: sans, transition: 'all 0.15s' }}
                    >
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