import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { COURSES } from '../lib/data.js'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { Pill } from '../components/UI.jsx'
import ShareRoundModal from '../components/ShareRoundModal.jsx'
import GolfPassport from '../components/GolfPassport.jsx'
import CourseSuggestions from '../components/CourseSuggestions.jsx'
import FindFriends from '../components/FindFriends.jsx'
import FollowList from '../components/FollowList.jsx'

export default function Profile() {
  const { B, serif, sans } = useTheme()
  const navigate                    = useNavigate()
  const { user, profile, signOut, fetchProfile, isAdmin } = useAuth()
  const [tab, setTab]               = useState('rounds')
  const [rounds, setRounds]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [saveMsg, setSaveMsg]       = useState('')
  const [shareRound, setShareRound] = useState(null)
  const [shareCourse, setShareCourse] = useState(null)
  const [showPassport, setShowPassport]     = useState(false)
  const [expandedRound, setExpandedRound]   = useState(null)
  const [wantToPlay,    setWantToPlay]       = useState([])
  const [showFindFriends, setShowFindFriends] = useState(false)
  const [followListMode, setFollowListMode]   = useState(null) // 'followers' | 'following' | null
  const [followerCount, setFollowerCount]     = useState(0)
  const [followingCount, setFollowingCount]   = useState(0)

  // Edit form state
  const [fullName,       setFullName]       = useState('')
  const [username,       setUsername]       = useState('')
  const [location,       setLocation]       = useState('')
  const [homeCourse,     setHomeCourse]     = useState('')
  const [handicap,       setHandicap]       = useState('')
  const [showHomeCourse, setShowHomeCourse] = useState(true)

  const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

  useEffect(() => { fetchRounds(); fetchFollowCounts(); fetchWantToPlay() }, [user])

  // Re-fetch counts when user navigates back to this page
  useEffect(() => {
    const handler = () => { if (document.visibilityState === 'visible') fetchFollowCounts() }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [user])

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name       || '')
      setUsername(profile.username        || '')
      setLocation(profile.location        || '')
      setHomeCourse(profile.home_course   || '')
      setHandicap(profile.handicap        || '')
      setShowHomeCourse(profile.show_home_course !== false)
    }
  }, [profile])

  async function fetchRounds() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('rounds')
      .select('*, courses(id, name, state, location, icon, bg_color)')
      .eq('user_id', user.id)
      .order('elo_score', { ascending: false })   // ← ORDER BY ELO (best first)
    setRounds(data || [])
    setLoading(false)
  }

  async function fetchWantToPlay() {
    if (!user) return
    const { data } = await supabase
      .from('want_to_play')
      .select('*, courses(id, name, state, location, icon, bg_color)')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false })
    setWantToPlay(data || [])
  }

  async function removeWantToPlay(courseId) {
    await supabase.from('want_to_play').delete()
      .eq('user_id', user.id).eq('course_id', courseId)
    setWantToPlay(prev => prev.filter(w => w.course_id !== courseId))
  }

  async function fetchFollowCounts() {
    if (!user) return
    const [{ data: followers }, { data: followingList }] = await Promise.all([
      supabase.from('follows').select('follower_id').eq('following_id', user.id),
      supabase.from('follows').select('following_id').eq('follower_id', user.id),
    ])
    setFollowerCount(followers?.length || 0)
    setFollowingCount(followingList?.length || 0)
  }

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg('')
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name:        fullName,
        username:         username,
        location:         location,
        home_course:      homeCourse,
        handicap:         handicap ? parseFloat(handicap) : null,
        show_home_course: showHomeCourse,
      })
      .eq('id', user.id)
    if (error) {
      setSaveMsg('Error saving — ' + error.message)
    } else {
      await fetchProfile(user.id)
      setSaveMsg('Saved!')
      setTimeout(() => setSaveMsg(''), 3000)
    }
    setSaving(false)
  }

  // Stats calculations
  const avgScore  = rounds.filter(r => r.score).length
    ? Math.round(rounds.filter(r => r.score).reduce((s, r) => s + r.score, 0) / rounds.filter(r => r.score).length)
    : '--'
  const topCourse = rounds.length > 0 ? rounds[0] : null  // Already ordered by elo_score desc
  const states    = [...new Set(rounds.map(r => r.courses?.state).filter(Boolean))]
  const bestRound = rounds.filter(r => r.score).sort((a, b) => a.score - b.score)[0]

  const initials  = (profile?.full_name || profile?.username || user?.email || 'G').slice(0, 2).toUpperCase()

  const inputStyle = {
    width: '100%', padding: '11px 13px', borderRadius: 10,
    border: `1px solid ${B.border}`, fontSize: 14, fontFamily: sans,
    color: B.textNavy, outline: 'none', background: B.white, boxSizing: 'border-box',
  }

  const tabs = [['rounds', 'My Rounds'], ['want', 'Want to Play'], ['stats', 'Stats'], ['edit', 'Edit Profile']]

  return (
    <div>
      {shareRound && (
        <ShareRoundModal
          round={shareRound}
          course={shareCourse}
          onClose={() => { setShareRound(null); setShareCourse(null) }}
        />
      )}
      {showFindFriends && <FindFriends onClose={() => setShowFindFriends(false)}/>}
      {followListMode && <FollowList userId={user?.id} mode={followListMode} onClose={() => setFollowListMode(null)}/>}
      {showPassport && (
        <GolfPassport
          profile={profile}
          rounds={rounds}
          onClose={() => setShowPassport(false)}
        />
      )}

      {/* ── Profile Header ── */}
      <div style={{ background: B.navy, borderRadius: 20, padding: '26px 22px', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
          <div style={{ width: 66, height: 66, borderRadius: '50%', background: B.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: serif, fontSize: 22, fontWeight: 900, color: B.navy, flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ color: B.cream, margin: '0 0 3px', fontSize: 21, fontWeight: 900, fontFamily: serif, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile?.full_name || profile?.username || 'Golfer'}
            </h1>
            <div style={{ color: B.cream, opacity: 0.6, fontSize: 12, fontFamily: sans, marginBottom: 6 }}>
              @{profile?.username || 'firstloop'} · Member since {new Date(user?.created_at).getFullYear()}
            </div>
            {profile?.is_founding_member && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(201,168,76,0.18)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 999, padding: '3px 10px', marginBottom: 8 }}>
                <span style={{ fontSize: 12 }}>⭐</span>
                <span style={{ fontFamily: sans, fontSize: 11, fontWeight: 800, color: B.gold, letterSpacing: '0.04em' }}>
                  Founding Member {profile.member_number ? `#${profile.member_number}` : ''}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {profile?.handicap != null && <Pill gold>⛳ Hdcp: {profile.handicap}</Pill>}
              {profile?.location  && <Pill gold>📍 {profile.location}</Pill>}
              {profile?.home_course && profile?.show_home_course !== false && (
                <Pill gold>🏠 {profile.home_course}</Pill>
              )}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {[
            [rounds.length,   'Courses',   null],
            [followerCount,   'Followers', 'followers'],
            [followingCount,  'Following', 'following'],
            [states.length,   'States',    null],
          ].map(([n, l, mode]) => (
            <div key={l}
              onClick={() => mode && setFollowListMode(mode)}
              style={{ background: 'rgba(240,232,213,0.08)', borderRadius: 11, padding: '11px 8px', textAlign: 'center', cursor: mode ? 'pointer' : 'default' }}>
              <div style={{ color: B.gold, fontSize: 18, fontWeight: 900, fontFamily: serif }}>{n}</div>
              <div style={{ color: 'rgba(240,232,213,0.5)', fontSize: 10, fontWeight: 600, fontFamily: sans }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
          <button onClick={() => setShowPassport(true)}
            style={{ background: 'rgba(201,168,76,0.12)', color: B.gold, border: '1px solid rgba(201,168,76,0.25)', borderRadius: 11, padding: '10px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: serif }}>
            🗂 Golf Passport
          </button>
          <button onClick={() => setShowFindFriends(true)}
            style={{ background: 'rgba(201,168,76,0.12)', color: B.gold, border: '1px solid rgba(201,168,76,0.25)', borderRadius: 11, padding: '10px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: serif }}>
            👥 Find Golfers
          </button>
        </div>
      </div>

      {/* ── Badges ── */}
      <div style={{ background: B.white, borderRadius: 15, padding: '14px 16px', marginBottom: 16, border: `1px solid ${B.border}` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: B.textNavy, fontFamily: serif, marginBottom: 10 }}>🏅 Badges Earned</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: B.feedBg, borderRadius: 999, padding: '4px 11px', border: `1px solid ${B.border}` }}>
            <span style={{ fontSize: 12 }}>🥇</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: B.textNavy, fontFamily: sans }}>First Loop Member</span>
          </div>
          {rounds.length >= 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: B.feedBg, borderRadius: 999, padding: '4px 11px', border: `1px solid ${B.border}` }}>
              <span style={{ fontSize: 12 }}>⛳</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: B.textNavy, fontFamily: sans }}>First Round Logged</span>
            </div>
          )}
          {rounds.length >= 5 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: B.feedBg, borderRadius: 999, padding: '4px 11px', border: `1px solid ${B.border}` }}>
              <span style={{ fontSize: 12 }}>🗺️</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: B.textNavy, fontFamily: sans }}>5 Rounds Logged</span>
            </div>
          )}
          {states.length >= 3 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: B.feedBg, borderRadius: 999, padding: '4px 11px', border: `1px solid ${B.border}` }}>
              <span style={{ fontSize: 12 }}>✈️</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: B.textNavy, fontFamily: sans }}>Multi-State Golfer</span>
            </div>
          )}
          {profile?.handicap != null && profile.handicap < 10 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: B.feedBg, borderRadius: 999, padding: '4px 11px', border: `1px solid ${B.border}` }}>
              <span style={{ fontSize: 12 }}>🎯</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: B.textNavy, fontFamily: sans }}>Sub-10 Handicap</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', background: B.white, borderRadius: 12, padding: 4, border: `1px solid ${B.border}`, marginBottom: 16, gap: 4 }}>
        {tabs.map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)}
            style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', background: tab === v ? B.navy : 'transparent', color: tab === v ? B.cream : B.textMid, fontWeight: 600, cursor: 'pointer', fontSize: 12, fontFamily: sans, transition: 'all 0.15s' }}>
            {l}
          </button>
        ))}
      </div>

      {/* ── MY ROUNDS — ordered by Elo rank ── */}
      {tab === 'rounds' && (
        <div>
          <button onClick={() => navigate('/')}
            style={{ width: '100%', background: B.gold, color: B.navy, border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 800, fontSize: 14, cursor: 'pointer', marginBottom: 12, fontFamily: serif }}>
            + Log a New Round
          </button>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ background: B.white, borderRadius: 13, height: 72, border: `1px solid ${B.border}`, opacity: 0.5 }}/>
              ))}
            </div>
          ) : rounds.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', background: B.white, borderRadius: 16, border: `1px solid ${B.border}` }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⛳</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: B.textNavy, fontFamily: serif, marginBottom: 6 }}>No rounds logged yet</div>
              <div style={{ fontSize: 13, color: B.textSoft, fontFamily: sans }}>Find a course and log your first round</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {rounds.map((r, index) => {
                const c       = COURSES.find(x => x.id === r.course_id)
                const bgColor = r.courses?.bg_color || c?.bg || B.navy
                const icon    = r.courses?.icon     || c?.icon || '⛳'
                const rank    = r.personal_rank || (index + 1)   // use stored rank or fallback to index

                // Gold/silver/bronze for top 3
                const rankColor = rank === 1 ? '#C9A84C'
                                : rank === 2 ? '#9E9E9E'
                                : rank === 3 ? '#A97240'
                                : B.textNavy

                const isExpanded = expandedRound === r.id
                return (
                  <div key={r.id} style={{ background: B.white, borderRadius: 13, border: `1px solid ${isExpanded ? B.gold : B.border}`, overflow: 'hidden', transition: 'all 0.15s' }}>
                    {/* Main row — tap to expand */}
                    <div
                      onClick={() => setExpandedRound(isExpanded ? null : r.id)}
                      style={{ padding: '13px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11 }}
                    >
                      {/* Rank badge */}
                      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: rank <= 3 ? `${rankColor}18` : B.feedBg, border: `1.5px solid ${rank <= 3 ? rankColor : B.border}` }}>
                        <span style={{ fontSize: 14, fontWeight: 900, color: rankColor, fontFamily: serif }}>#{rank}</span>
                      </div>
                      {/* Course icon */}
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>{icon}</div>
                      {/* Course info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: B.textNavy, fontFamily: sans, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.courses?.name || 'Course'}
                        </div>
                        <div style={{ fontSize: 11, color: B.textSoft, fontFamily: sans }}>
                          {r.courses?.location || r.courses?.state || ''}
                          {r.played_at ? ` · ${new Date(r.played_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                        </div>
                      </div>
                      {/* Score + expand indicator */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        {r.score && <div style={{ fontSize: 15, fontWeight: 800, color: B.textNavy, fontFamily: serif }}>{r.score}</div>}
                        <div style={{ fontSize: 10, color: B.textSoft, fontFamily: sans, marginTop: 2 }}>{isExpanded ? '▲' : '▼'}</div>
                      </div>
                    </div>

                    {/* Expanded section */}
                    {isExpanded && (
                      <div style={{ borderTop: `1px solid ${B.border}`, padding: '14px 15px', background: B.feedBg }}>
                        {/* Photo */}
                        {r.photo_url && (
                          <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
                            <img src={r.photo_url} alt="Round photo" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }}/>
                          </div>
                        )}
                        {/* Note */}
                        {r.comment && (
                          <p style={{ margin: '0 0 12px', fontSize: 13, color: B.textNavy, fontFamily: sans, fontStyle: 'italic', lineHeight: 1.6 }}>"{r.comment}"</p>
                        )}
                        {/* 3-axis ratings */}
                        {(r.conditions_rating || r.value_rating || r.vibes_rating) && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
                            {[['Conditions', r.conditions_rating, B.greenLight], ['Value', r.value_rating, B.gold], ['Facilities', r.vibes_rating, '#a07840']].map(([label, val, color]) => val ? (
                              <div key={label} style={{ background: B.white, borderRadius: 8, padding: '8px 6px', textAlign: 'center', border: `1px solid ${B.border}` }}>
                                <div style={{ fontSize: 15, fontWeight: 900, color, fontFamily: serif }}>{val}</div>
                                <div style={{ fontSize: 9, color: B.textSoft, fontFamily: sans, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{label}</div>
                              </div>
                            ) : null)}
                          </div>
                        )}
                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => navigate(`/course/${r.course_id}`)}
                            style={{ flex: 1, background: B.navy, color: B.cream, border: 'none', borderRadius: 9, padding: '9px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: sans }}>
                            View Course →
                          </button>
                          <button onClick={e => { e.stopPropagation(); setShareRound(r); setShareCourse({ id: r.course_id, name: r.courses?.name, location: r.courses?.location, bg: c?.bg || B.navy, icon: c?.icon || '⛳' }) }}
                            style={{ background: 'none', border: `1px solid ${B.border}`, borderRadius: 9, padding: '9px 14px', cursor: 'pointer', fontSize: 12, color: B.textMid, fontFamily: sans, fontWeight: 600 }}>
                            📤 Share
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <CourseSuggestions />
        </div>
      )}

      {/* ── WANT TO PLAY ── */}
      {tab === 'want' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {wantToPlay.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', background: B.white, borderRadius: 16, border: `1px solid ${B.border}` }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: B.textNavy, fontFamily: serif, marginBottom: 6 }}>No courses saved yet</div>
              <div style={{ fontSize: 13, color: B.textSoft, fontFamily: sans, marginBottom: 16 }}>Browse courses and tap "Want to Play" to build your bucket list</div>
              <button onClick={() => navigate('/discover')}
                style={{ background: B.gold, color: B.navy, border: 'none', borderRadius: 12, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontFamily: serif, fontSize: 13 }}>
                Browse Courses
              </button>
            </div>
          ) : wantToPlay.map(w => (
            <div key={w.id} style={{ background: B.white, borderRadius: 13, padding: '13px 15px', border: `1px solid ${B.border}`, display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: w.courses?.bg_color || B.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>
                {w.courses?.icon || '⛳'}
              </div>
              <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => navigate(`/course/${w.course_id}`)}>
                <div style={{ fontSize: 13, fontWeight: 600, color: B.textNavy, fontFamily: sans, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {w.courses?.name || 'Course'}
                </div>
                <div style={{ fontSize: 11, color: B.textSoft, fontFamily: sans }}>
                  {w.courses?.location || w.courses?.state || ''}
                </div>
              </div>
              <button onClick={() => removeWantToPlay(w.course_id)}
                style={{ background: 'none', border: `1px solid ${B.border}`, borderRadius: 999, padding: '5px 10px', cursor: 'pointer', fontSize: 11, color: B.textMid, fontFamily: sans, fontWeight: 600, flexShrink: 0 }}>
                ✕ Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── STATS ── */}
      {tab === 'stats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Score history chart */}
          {rounds.filter(r => r.score).length > 0 && (
            <div style={{ background: B.white, borderRadius: 15, padding: 18, border: `1px solid ${B.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: B.textNavy, fontFamily: serif, marginBottom: 14 }}>Score History</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
                {rounds.filter(r => r.score).slice(0, 8).reverse().map((r, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: '100%', borderRadius: 4,
                      background: r.score <= 82 ? B.green : r.score <= 90 ? B.navy : B.gold,
                      height: `${Math.max(12, ((120 - r.score) / 60) * 100)}%`,
                      transition: 'height 0.5s',
                    }}/>
                    <span style={{ fontSize: 10, color: B.textSoft, fontFamily: sans, fontWeight: 600 }}>{r.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top 3 ranked courses */}
          {rounds.length > 0 && (
            <div style={{ background: B.white, borderRadius: 15, padding: 18, border: `1px solid ${B.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: B.textNavy, fontFamily: serif, marginBottom: 14 }}>🏆 Your Top Courses</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {rounds.slice(0, 3).map((r, i) => {
                  const medal = ['🥇', '🥈', '🥉'][i]
                  return (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{medal}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: B.textNavy, fontFamily: sans }}>{r.courses?.name || 'Course'}</div>
                        <div style={{ fontSize: 11, color: B.textSoft, fontFamily: sans }}>{r.courses?.state || ''}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {(() => {
              const withConditions = rounds.filter(r => r.conditions_rating)
              const withValue      = rounds.filter(r => r.value_rating)
              const withVibes      = rounds.filter(r => r.vibes_rating)
              const avgConditions  = withConditions.length ? (withConditions.reduce((s,r) => s + r.conditions_rating, 0) / withConditions.length).toFixed(1) : '--'
              const avgValue       = withValue.length      ? (withValue.reduce((s,r) => s + r.value_rating, 0)      / withValue.length).toFixed(1)      : '--'
              const avgVibes       = withVibes.length      ? (withVibes.reduce((s,r) => s + r.vibes_rating, 0)      / withVibes.length).toFixed(1)      : '--'
              const stateCounts    = rounds.reduce((acc, r) => { const s = r.courses?.state; if (s) acc[s] = (acc[s]||0)+1; return acc }, {})
              const mostPlayedState = Object.entries(stateCounts).sort((a,b) => b[1]-a[1])[0]?.[0] || '--'
              return [
                ['Rounds Logged',   rounds.length,        '& counting'],
                ['Avg Score',       avgScore,              'per round'],
                ['States Played',   states.length,         states.slice(0,3).join(' · ') || 'none yet'],
                ['Best Score',      bestRound?.score||'--', bestRound?.courses?.name||''],
                ['Avg Conditions',  avgConditions,         'out of 10'],
                ['Avg Value',       avgValue,              'out of 10'],
                ['Avg Facilities',  avgVibes,              'out of 10'],
                ['Most Played',     mostPlayedState,       'home state'],
              ]
            })().map(([label, val, sub]) => (
              <div key={label} style={{ background: B.white, borderRadius: 13, padding: '15px 13px', border: `1px solid ${B.border}`, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: B.textSoft, fontFamily: sans, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>{label}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: B.textNavy, fontFamily: serif, marginBottom: 3 }}>{val}</div>
                <div style={{ fontSize: 11, color: B.textSoft, fontFamily: sans }}>{sub}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => signOut().then(() => navigate('/auth'))}
            style={{ width: '100%', background: B.white, color: B.textMid, border: `1px solid ${B.border}`, borderRadius: 12, padding: '13px 0', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: sans }}
          >
            Sign Out
          </button>
        </div>
      )}

      {/* ── EDIT PROFILE ── */}
      {tab === 'edit' && (
        <div style={{ background: B.white, borderRadius: 16, padding: 24, border: `1px solid ${B.border}` }}>
          <h3 style={{ margin: '0 0 20px', color: B.textNavy, fontFamily: serif, fontSize: 18 }}>Edit Profile</h3>

          {saveMsg && (
            <div style={{ background: saveMsg.startsWith('Error') ? '#fde8e8' : '#e8f5e9', color: saveMsg.startsWith('Error') ? '#c00' : '#1E4530', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontFamily: sans, marginBottom: 16 }}>
              {saveMsg}
            </div>
          )}

          <form onSubmit={saveProfile}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: B.textMid, fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" style={inputStyle}/>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: B.textMid, fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. treyc" style={inputStyle}/>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: B.textMid, fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>State</label>
              <select value={location} onChange={e => setLocation(e.target.value)} style={inputStyle}>
                <option value="">Select your state</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: B.textMid, fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Home Course</label>
              <input value={homeCourse} onChange={e => setHomeCourse(e.target.value)} placeholder="e.g. Augusta National" style={inputStyle}/>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: B.feedBg, borderRadius: 10, border: `1px solid ${B.border}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: B.textNavy, fontFamily: sans }}>Show home course on profile</div>
                  <div style={{ fontSize: 11, color: B.textSoft, fontFamily: sans, marginTop: 2 }}>Visible to other golfers who view your profile</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHomeCourse(p => !p)}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none',
                    background: showHomeCourse ? B.green : B.border,
                    position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 3, left: showHomeCourse ? 23 : 3,
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s',
                  }}/>
                </button>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: B.textMid, fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Handicap Index</label>
              <input value={handicap} onChange={e => setHandicap(e.target.value)} placeholder="e.g. 8.4" type="number" step="0.1" min="0" max="54" style={inputStyle}/>
            </div>

            <button type="submit" disabled={saving}
              style={{ width: '100%', background: saving ? B.border : B.gold, color: B.navy, border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 800, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: serif, transition: 'all 0.15s', marginBottom: 10 }}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>

          <div style={{ borderTop: `1px solid ${B.border}`, paddingTop: 16, marginTop: 6 }}>
            <div style={{ fontSize: 12, color: B.textSoft, fontFamily: sans, marginBottom: 8 }}>Account email: {user?.email}</div>
            {isAdmin && (
              <button onClick={() => navigate('/admin')}
                style={{ width: '100%', background: B.navy, color: B.cream, border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: sans, marginBottom: 10 }}>
                ⚙️ Admin Dashboard
              </button>
            )}
            <button onClick={() => signOut().then(() => navigate('/auth'))}
              style={{ width: '100%', background: B.white, color: B.textMid, border: `1px solid ${B.border}`, borderRadius: 12, padding: '13px 0', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: sans }}>
              Sign Out
            </button>
          </div>
        </div>
      )}

    </div>
  )
}