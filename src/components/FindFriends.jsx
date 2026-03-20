import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'

function Avatar({ initials, size = 40, color }) {
  const { B, sans } = useTheme()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color || B.green,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: size * 0.32, fontWeight: 700,
      fontFamily: sans, flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

function GolferRow({ golfer, onFollow, onUnfollow, isFollowing, navigateTo }) {
  const { B, serif, sans } = useTheme()
  const [loading, setLoading] = useState(false)
  const initials = (golfer.full_name || golfer.username || 'G').slice(0, 2).toUpperCase()
  const avatarColors = ['#2d5a27', '#1a3d5a', '#5a3a1a', '#3a1a5a', '#1a5a3a']
  const color = avatarColors[(golfer.username?.charCodeAt(0) || 0) % avatarColors.length]

  async function handleFollow() {
    setLoading(true)
    if (isFollowing) await onUnfollow(golfer.id)
    else await onFollow(golfer.id)
    setLoading(false)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 0',
      borderBottom: `1px solid ${B.border}`,
    }}>
      <div onClick={() => navigateTo(golfer.id)} style={{ cursor: 'pointer' }}>
        <Avatar initials={initials} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }} onClick={() => navigateTo(golfer.id)} role="button" style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: B.textNavy, fontFamily: sans, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {golfer.full_name || golfer.username}
        </div>
        <div style={{ fontSize: 12, color: B.textSoft, fontFamily: sans, display: 'flex', gap: 8, marginTop: 2 }}>
          {golfer.username && <span>@{golfer.username}</span>}
          {golfer.location && <span>· {golfer.location}</span>}
          {golfer.courses_in_common > 0 && (
            <span style={{ color: B.green, fontWeight: 600 }}>· {golfer.courses_in_common} course{golfer.courses_in_common > 1 ? 's' : ''} in common</span>
          )}
          {golfer.rounds_count > 0 && !golfer.courses_in_common && (
            <span>· {golfer.rounds_count} rounds</span>
          )}
        </div>
      </div>
      <button
        onClick={handleFollow}
        disabled={loading}
        style={{
          padding: '7px 16px', borderRadius: 20,
          border: `1.5px solid ${isFollowing ? B.border : B.green}`,
          background: isFollowing ? 'transparent' : B.green,
          color: isFollowing ? B.textMid : '#fff',
          fontSize: 12, fontWeight: 700, fontFamily: sans,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s', flexShrink: 0,
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  )
}

export default function FindFriends({ onClose }) {
  const { B, serif, sans } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab]               = useState('suggested')
  const [suggested, setSuggested]   = useState([])
  const [nearby, setNearby]         = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searchQ, setSearchQ]       = useState('')
  const [following, setFollowing]   = useState(new Set())
  const [loading, setLoading]       = useState(true)
  const [userState, setUserState]   = useState('')

  useEffect(() => { loadInitialData() }, [user])

  useEffect(() => {
    if (tab === 'nearby' && userState) loadNearby()
  }, [tab, userState])

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQ.trim().length >= 2) searchGolfers()
      else setSearchResults([])
    }, 300)
    return () => clearTimeout(t)
  }, [searchQ])

  async function loadInitialData() {
    if (!user) return
    setLoading(true)

    // Get current user's profile (for state) and following list
    const [{ data: myProfile }, { data: myFollows }] = await Promise.all([
      supabase.from('profiles').select('location').eq('id', user.id).single(),
      supabase.from('follows').select('following_id').eq('follower_id', user.id),
    ])

    const followingIds = new Set((myFollows || []).map(f => f.following_id))
    setFollowing(followingIds)
    setUserState(myProfile?.location || '')

    // Get my played course IDs
    const { data: myRounds } = await supabase
      .from('rounds')
      .select('course_id')
      .eq('user_id', user.id)

    const myCourseIds = (myRounds || []).map(r => r.course_id)

    // Get all other users who've played any of my courses
    let suggestedMap = {}

    if (myCourseIds.length > 0) {
      const { data: commonRounds } = await supabase
        .from('rounds')
        .select('user_id, course_id, profiles(id, username, full_name, location, handicap)')
        .in('course_id', myCourseIds)
        .neq('user_id', user.id)

      ;(commonRounds || []).forEach(r => {
        if (!r.profiles) return
        const uid = r.user_id
        if (!suggestedMap[uid]) {
          suggestedMap[uid] = { ...r.profiles, courses_in_common: 0 }
        }
        suggestedMap[uid].courses_in_common++
      })
    }

    // Also add golfers from same state who aren't already in suggested
    if (myProfile?.location) {
      const { data: stateProfiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, location, handicap')
        .eq('location', myProfile.location)
        .neq('id', user.id)
        .limit(20)

      ;(stateProfiles || []).forEach(p => {
        if (!suggestedMap[p.id]) {
          suggestedMap[p.id] = { ...p, courses_in_common: 0 }
        }
      })
    }

    // Sort: most courses in common first, then by name
    const sorted = Object.values(suggestedMap)
      .filter(g => !followingIds.has(g.id))
      .sort((a, b) => b.courses_in_common - a.courses_in_common)

    setSuggested(sorted)
    setLoading(false)
  }

  async function loadNearby() {
    if (!userState) return
    const { data } = await supabase
      .from('profiles')
      .select('id, username, full_name, location, handicap')
      .eq('location', userState)
      .neq('id', user.id)
      .limit(30)

    // Get round counts for each
    const ids = (data || []).map(p => p.id)
    if (ids.length === 0) { setNearby([]); return }

    const { data: roundCounts } = await supabase
      .from('rounds')
      .select('user_id')
      .in('user_id', ids)

    const counts = {}
    ;(roundCounts || []).forEach(r => {
      counts[r.user_id] = (counts[r.user_id] || 0) + 1
    })

    const sorted = (data || [])
      .map(p => ({ ...p, rounds_count: counts[p.id] || 0 }))
      .sort((a, b) => b.rounds_count - a.rounds_count)

    setNearby(sorted)
  }

  async function searchGolfers() {
    const q = searchQ.trim()
    const { data } = await supabase
      .from('profiles')
      .select('id, username, full_name, location, handicap')
      .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
      .neq('id', user.id)
      .limit(15)
    setSearchResults(data || [])
  }

  async function followUser(targetId) {
    await supabase.from('follows').insert({ follower_id: user.id, following_id: targetId })
    setFollowing(prev => new Set([...prev, targetId]))
  }

  async function unfollowUser(targetId) {
    await supabase.from('follows').delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetId)
    setFollowing(prev => { const n = new Set(prev); n.delete(targetId); return n })
  }

  function goToProfile(userId) {
    onClose()
    navigate(`/golfer/${userId}`)
  }

  const tabs = [
    ['suggested', '✨ Suggested'],
    ['search',    '🔍 Search'],
    ['nearby',    '📍 Nearby'],
  ]

  const activeList = tab === 'suggested' ? suggested
                   : tab === 'nearby'    ? nearby
                   : searchResults

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 500,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div style={{
        background: B.white, borderRadius: '20px 20px 0 0',
        width: '100%', maxWidth: 540,
        maxHeight: '88vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Handle */}
        <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: B.border }}/>
        </div>

        {/* Header */}
        <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 900, color: B.textNavy, margin: 0 }}>Find Golfers</h2>
            <p style={{ fontFamily: sans, fontSize: 13, color: B.textSoft, margin: '3px 0 0' }}>Discover and follow other golfers</p>
          </div>
          <button onClick={onClose} style={{ background: B.feedBg, border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: B.textMid }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '14px 20px 0' }}>
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                background: tab === id ? B.navy : B.feedBg,
                color: tab === id ? B.cream : B.textMid,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: sans, transition: 'all 0.15s',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Search input */}
        {tab === 'search' && (
          <div style={{ padding: '14px 20px 0' }}>
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search by name or username..."
              autoFocus
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10,
                border: `1.5px solid ${B.border}`, fontSize: 14,
                fontFamily: sans, color: B.textNavy,
                background: B.feedBg, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        {/* No state warning for nearby */}
        {tab === 'nearby' && !userState && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📍</div>
            <div style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, color: B.textNavy, marginBottom: 6 }}>Set your state first</div>
            <div style={{ fontFamily: sans, fontSize: 13, color: B.textSoft }}>Add your state in Edit Profile to see nearby golfers</div>
          </div>
        )}

        {/* Results list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 32px' }}>
          {loading && tab === 'suggested' ? (
            <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: sans, color: B.textSoft }}>Finding golfers...</div>
          ) : activeList.length === 0 && (tab !== 'search' || searchQ.length >= 2) ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>
                {tab === 'suggested' ? '🏌️' : tab === 'nearby' ? '📍' : '🔍'}
              </div>
              <div style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, color: B.textNavy, marginBottom: 6 }}>
                {tab === 'suggested' ? 'No suggestions yet' : tab === 'nearby' ? `No golfers found in ${userState}` : 'No results found'}
              </div>
              <div style={{ fontFamily: sans, fontSize: 13, color: B.textSoft }}>
                {tab === 'suggested' ? 'Log more rounds to get personalized suggestions' : tab === 'nearby' ? 'Be the first in your state!' : 'Try a different name or username'}
              </div>
            </div>
          ) : tab === 'search' && searchQ.length < 2 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: sans, fontSize: 13, color: B.textSoft }}>
              Type at least 2 characters to search
            </div>
          ) : (
            activeList.map(golfer => (
              <GolferRow
                key={golfer.id}
                golfer={golfer}
                isFollowing={following.has(golfer.id)}
                onFollow={followUser}
                onUnfollow={unfollowUser}
                navigateTo={goToProfile}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}