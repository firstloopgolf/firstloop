import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { Pill } from '../components/UI.jsx'

export default function PublicProfile() {
  const { B, serif, sans } = useTheme()
  const { userId } = useParams()
  const navigate   = useNavigate()
  const { user }   = useAuth()

  const [profile,    setProfile]    = useState(null)
  const [rounds,     setRounds]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  useEffect(() => { loadProfile() }, [userId, user])

  async function loadProfile() {
    setLoading(true)
    const [
      { data: prof },
      { data: rds },
      { data: followers },
      { data: followingList },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('rounds').select('*, courses(name, state, icon, bg_color)')
        .eq('user_id', userId)
        .order('personal_rank', { ascending: true })
        .limit(20),
      supabase.from('follows').select('follower_id', { count: 'exact', head: false }).eq('following_id', userId),
      supabase.from('follows').select('following_id', { count: 'exact', head: false }).eq('follower_id', userId),
    ])

    setProfile(prof)
    setRounds(rds || [])
    setFollowerCount(followers?.length || 0)
    setFollowingCount(followingList?.length || 0)

    // Check if current user follows this profile
    if (user) {
      const { data: myFollow } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle()
      setIsFollowing(!!myFollow)
    }

    setLoading(false)
  }

  async function toggleFollow() {
    if (!user) { navigate('/auth'); return }
    setFollowLoading(true)
    if (isFollowing) {
      await supabase.from('follows').delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId)
      setIsFollowing(false)
      setFollowerCount(c => Math.max(0, c - 1))
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: userId })
      setIsFollowing(true)
      setFollowerCount(c => c + 1)
    }
    setFollowLoading(false)
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: sans, color: B.textSoft }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⛳</div>
      <div>Loading profile...</div>
    </div>
  )

  if (!profile) return (
    <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: sans, color: B.textMid }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: serif, marginBottom: 8 }}>Golfer not found</div>
      <button onClick={() => navigate(-1)} style={{ background: B.gold, color: B.navy, border: 'none', borderRadius: 12, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontFamily: sans }}>Go Back</button>
    </div>
  )

  const initials = (profile.full_name || profile.username || 'G').slice(0, 2).toUpperCase()
  const isOwnProfile = user?.id === userId
  const states = [...new Set(rounds.map(r => r.courses?.state).filter(Boolean))]

  return (
    <div>
      <button onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: B.textMid, cursor: 'pointer', padding: '0 0 16px', fontSize: 13, fontFamily: sans, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
        ← Back
      </button>

      {/* Header */}
      <div style={{ background: B.navy, borderRadius: 20, padding: '26px 22px', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 16 }}>
          <div style={{ width: 66, height: 66, borderRadius: '50%', background: B.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: serif, fontSize: 22, fontWeight: 900, color: B.navy, flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ color: B.cream, margin: '0 0 3px', fontSize: 21, fontWeight: 900, fontFamily: serif, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile.full_name || profile.username || 'Golfer'}
            </h1>
            <div style={{ color: B.cream, opacity: 0.6, fontSize: 12, fontFamily: sans, marginBottom: 8 }}>
              @{profile.username} · Member since {new Date(profile.created_at).getFullYear()}
            </div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {profile.handicap != null && <Pill gold>⛳ Hdcp: {profile.handicap}</Pill>}
              {profile.location && <Pill gold>📍 {profile.location}</Pill>}
              {profile.home_course && profile.show_home_course !== false && <Pill gold>🏠 {profile.home_course}</Pill>}
            </div>
          </div>
        </div>

        {/* Follower counts */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: B.gold, fontSize: 18, fontWeight: 900, fontFamily: serif }}>{rounds.length}</div>
            <div style={{ color: 'rgba(240,232,213,0.5)', fontSize: 10, fontWeight: 600, fontFamily: sans }}>Courses</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: B.gold, fontSize: 18, fontWeight: 900, fontFamily: serif }}>{followerCount}</div>
            <div style={{ color: 'rgba(240,232,213,0.5)', fontSize: 10, fontWeight: 600, fontFamily: sans }}>Followers</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: B.gold, fontSize: 18, fontWeight: 900, fontFamily: serif }}>{followingCount}</div>
            <div style={{ color: 'rgba(240,232,213,0.5)', fontSize: 10, fontWeight: 600, fontFamily: sans }}>Following</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: B.gold, fontSize: 18, fontWeight: 900, fontFamily: serif }}>{states.length}</div>
            <div style={{ color: 'rgba(240,232,213,0.5)', fontSize: 10, fontWeight: 600, fontFamily: sans }}>States</div>
          </div>
        </div>

        {/* Follow button — only show if not own profile */}
        {!isOwnProfile && (
          <button
            onClick={toggleFollow}
            disabled={followLoading}
            style={{
              width: '100%', borderRadius: 11, padding: '11px 0',
              fontWeight: 700, fontSize: 14, cursor: followLoading ? 'not-allowed' : 'pointer',
              fontFamily: serif, transition: 'all 0.15s',
              background: isFollowing ? 'rgba(240,232,213,0.08)' : B.gold,
              color: isFollowing ? B.cream : B.navy,
              border: isFollowing ? '1px solid rgba(240,232,213,0.2)' : 'none',
              opacity: followLoading ? 0.7 : 1,
            }}>
            {followLoading ? '...' : isFollowing ? '✓ Following' : 'Follow'}
          </button>
        )}
        {isOwnProfile && (
          <button onClick={() => navigate('/profile')}
            style={{ width: '100%', background: 'rgba(201,168,76,0.12)', color: B.gold, border: '1px solid rgba(201,168,76,0.25)', borderRadius: 11, padding: '10px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: serif }}>
            Edit My Profile
          </button>
        )}
      </div>

      {/* Ranked rounds */}
      {rounds.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', background: B.white, borderRadius: 16, border: `1px solid ${B.border}` }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⛳</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: B.textNavy, fontFamily: serif }}>No rounds logged yet</div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: B.textNavy, fontFamily: serif, marginBottom: 12 }}>
            {profile.full_name || profile.username}'s Rankings
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rounds.map((r, index) => {
              const rank = r.personal_rank || (index + 1)
              const rankColor = rank === 1 ? '#C9A84C' : rank === 2 ? '#9E9E9E' : rank === 3 ? '#A97240' : B.textNavy
              return (
                <div key={r.id}
                  onClick={() => navigate(`/course/${r.course_id}`)}
                  style={{ background: B.white, borderRadius: 13, padding: '12px 14px', cursor: 'pointer', border: `1px solid ${B.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: rank <= 3 ? `${rankColor}18` : B.feedBg, border: `1.5px solid ${rank <= 3 ? rankColor : B.border}` }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: rankColor, fontFamily: serif }}>#{rank}</span>
                  </div>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: r.courses?.bg_color || B.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
                    {r.courses?.icon || '⛳'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: B.textNavy, fontFamily: sans, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.courses?.name || 'Course'}
                    </div>
                    <div style={{ fontSize: 11, color: B.textSoft, fontFamily: sans }}>{r.courses?.state}</div>
                  </div>
                  {r.score && <div style={{ fontSize: 14, fontWeight: 800, color: B.textNavy, fontFamily: serif, flexShrink: 0 }}>{r.score}</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}