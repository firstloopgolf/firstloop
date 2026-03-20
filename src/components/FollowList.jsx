import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'

function getInitials(name) {
  if (!name) return 'G'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}


export default function FollowList({ userId, mode, onClose }) {
  // mode: 'followers' | 'following'
  const { B, serif, sans } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [list,      setList]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [following, setFollowing] = useState(new Set())

  useEffect(() => { loadList() }, [userId, mode])

  async function loadList() {
    setLoading(true)

    let profileIds = []

    if (mode === 'followers') {
      // People who follow userId
      const { data } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId)
      profileIds = (data || []).map(r => r.follower_id)
    } else {
      // People userId follows
      const { data } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId)
      profileIds = (data || []).map(r => r.following_id)
    }

    if (profileIds.length === 0) { setList([]); setLoading(false); return }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, location, handicap')
      .in('id', profileIds)

    setList(profiles || [])

    // Load current user's following set for Follow buttons
    if (user) {
      const { data: myFollows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)
      setFollowing(new Set((myFollows || []).map(f => f.following_id)))
    }

    setLoading(false)
  }

  async function toggleFollow(targetId) {
    if (!user) { navigate('/auth'); return }
    if (following.has(targetId)) {
      await supabase.from('follows').delete()
        .eq('follower_id', user.id).eq('following_id', targetId)
      setFollowing(prev => { const n = new Set(prev); n.delete(targetId); return n })
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: targetId })
      setFollowing(prev => new Set([...prev, targetId]))
    }
  }

  function goToProfile(id) {
    onClose()
    navigate(`/golfer/${id}`)
  }

  const avatarColors = ['#2d5a27','#1a3d5a','#5a3a1a','#3a1a5a','#1a5a3a']

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 500, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
    >
      <div style={{ background: B.white, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 540, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>

        {/* Handle */}
        <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: B.border }}/>
        </div>

        {/* Header */}
        <div style={{ padding: '14px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${B.border}` }}>
          <h2 style={{ fontFamily: serif, fontSize: 18, fontWeight: 900, color: B.textNavy, margin: 0 }}>
            {mode === 'followers' ? 'Followers' : 'Following'}
          </h2>
          <button onClick={onClose} style={{ background: B.feedBg, border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: B.textMid }}>✕</button>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 32px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: sans, color: B.textSoft }}>Loading...</div>
          ) : list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
              <div style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, color: B.textNavy, marginBottom: 6 }}>
                {mode === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
              </div>
              <div style={{ fontFamily: sans, fontSize: 13, color: B.textSoft }}>
                {mode === 'followers' ? 'Share your profile to get followers' : 'Find golfers to follow'}
              </div>
            </div>
          ) : list.map(p => {
            const initials = getInitials(p.full_name || p.username || 'G')
            const color = avatarColors[(p.username?.charCodeAt(0) || 0) % avatarColors.length]
            const isMe = user?.id === p.id
            const isFollowingThem = following.has(p.id)

            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${B.border}` }}>
                <div onClick={() => goToProfile(p.id)} style={{ cursor: 'pointer', width: 42, height: 42, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: sans, flexShrink: 0 }}>
                  {initials}
                </div>
                <div onClick={() => goToProfile(p.id)} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: B.textNavy, fontFamily: sans, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.full_name || p.username}
                  </div>
                  <div style={{ fontSize: 12, color: B.textSoft, fontFamily: sans, display: 'flex', gap: 6, marginTop: 2 }}>
                    {p.username && <span>@{p.username}</span>}
                    {p.location && <span>· {p.location}</span>}
                  </div>
                </div>
                {!isMe && (
                  <button
                    onClick={() => toggleFollow(p.id)}
                    style={{ padding: '7px 14px', borderRadius: 20, border: `1.5px solid ${isFollowingThem ? B.border : B.green}`, background: isFollowingThem ? 'transparent' : B.green, color: isFollowingThem ? B.textMid : '#fff', fontSize: 12, fontWeight: 700, fontFamily: sans, cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}>
                    {isFollowingThem ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}