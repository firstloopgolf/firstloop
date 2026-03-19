import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'

// ── Elo helpers ──────────────────────────────────────────────────────────────
const ELO_DEFAULT = 1500
const K = 32
function calcElo(winR, loseR) {
  const exp = 1 / (1 + Math.pow(10, (loseR - winR) / 400))
  return {
    newWinner: Math.round(winR  + K * (1 - exp)),
    newLoser:  Math.round(loseR + K * (0 - (1 - exp))),
  }
}

// ── Dummy golfers for Step 4 ─────────────────────────────────────────────────
const SUGGESTED = [
  { id: 'd1', name: 'Jack Nicklaus',  username: 'goldenbear18', location: 'North Palm Beach, FL', emoji: '🐻' },
  { id: 'd2', name: 'Jordan Spieth',  username: 'jspieth',      location: 'Dallas, TX',            emoji: '🏌️' },
  { id: 'd3', name: 'Dustin Johnson', username: 'djohnson',     location: 'Jupiter, FL',           emoji: '💪' },
  { id: 'd4', name: 'Brooks Koepka',  username: 'bkoepka',      location: 'Palm Beach, FL',        emoji: '⚡' },
  { id: 'd5', name: 'Xander Schauffele', username: 'xschauffele', location: 'San Diego, CA',      emoji: '🎯' },
]

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '13px 15px', borderRadius: 12,
  border: '1.5px solid rgba(240,232,213,0.15)', fontSize: 15,
  fontFamily: sans, color: B.cream, outline: 'none',
  background: 'rgba(255,255,255,0.06)', boxSizing: 'border-box',
}

function ProgressDots({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current - 1 ? 24 : 8, height: 8, borderRadius: 4,
          background: i < current ? B.gold : 'rgba(240,232,213,0.2)',
          transition: 'all 0.3s',
        }}/>
      ))}
    </div>
  )
}

// ── Step 1: Profile ───────────────────────────────────────────────────────────
function StepProfile({ onNext, profile }) {
  const { user, fetchProfile } = useAuth()
  const [username,   setUsername]   = useState(profile?.username   || '')
  const [fullName,   setFullName]   = useState(profile?.full_name  || '')
  const [homeCourse, setHomeCourse] = useState(profile?.home_course|| '')
  const [handicap,   setHandicap]   = useState(profile?.handicap   || '')
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username.trim()) { setError('Username is required'); return }
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('profiles').update({
      username:    username.trim().toLowerCase().replace(/\s/g, ''),
      full_name:   fullName.trim(),
      home_course: homeCourse.trim(),
      handicap:    handicap ? parseFloat(handicap) : null,
    }).eq('id', user.id)
    if (err) { setError(err.message); setSaving(false); return }
    await fetchProfile(user.id)
    onNext()
  }

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⛳</div>
        <h1 style={{ fontFamily: serif, fontSize: 28, fontWeight: 900, color: B.cream, margin: '0 0 8px' }}>
          Welcome to First Loop
        </h1>
        <p style={{ fontFamily: sans, fontSize: 14, color: 'rgba(240,232,213,0.6)', margin: 0 }}>
          Let's set up your golfer profile
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(200,50,50,0.2)', border: '1px solid rgba(200,50,50,0.4)', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontFamily: sans, color: '#ffaaaa', marginBottom: 16 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,232,213,0.5)', fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Username *
          </label>
          <input value={username} onChange={e => setUsername(e.target.value)}
            placeholder="e.g. tigerw" style={inputStyle} autoCapitalize="none"/>
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,232,213,0.5)', fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Full Name
          </label>
          <input value={fullName} onChange={e => setFullName(e.target.value)}
            placeholder="e.g. Tiger Woods" style={inputStyle}/>
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,232,213,0.5)', fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Home Course
          </label>
          <input value={homeCourse} onChange={e => setHomeCourse(e.target.value)}
            placeholder="e.g. Augusta National" style={inputStyle}/>
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,232,213,0.5)', fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Handicap Index
          </label>
          <input value={handicap} onChange={e => setHandicap(e.target.value)}
            placeholder="e.g. 8.4" type="number" step="0.1" min="0" max="54" style={inputStyle}/>
        </div>

        <button type="submit" disabled={saving || !username.trim()}
          style={{
            width: '100%', background: saving || !username.trim() ? 'rgba(196,150,58,0.4)' : B.gold,
            color: B.navy, border: 'none', borderRadius: 14, padding: '16px 0',
            fontWeight: 900, fontSize: 16, cursor: saving || !username.trim() ? 'not-allowed' : 'pointer',
            fontFamily: serif, marginTop: 8, transition: 'all 0.15s',
          }}>
          {saving ? 'Saving...' : "Let's go →"}
        </button>
      </form>
    </div>
  )
}

// ── Step 2: Log first courses ─────────────────────────────────────────────────
function StepLogCourses({ onNext, onSkip, addedCourses, setAddedCourses }) {
  const { user } = useAuth()
  const [search,        setSearch]        = useState('')
  const [results,       setResults]       = useState([])
  const [searching,     setSearching]     = useState(false)
  const [addingId,      setAddingId]      = useState(null)

  useEffect(() => {
    if (search.length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      const { data } = await supabase.from('courses')
        .select('id, name, location, state, icon, bg_color')
        .ilike('name', `%${search}%`).limit(6)
      setResults(data || [])
      setSearching(false)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  async function addCourse(course) {
    if (addedCourses.length >= 3) return
    if (addedCourses.find(c => c.course.id === course.id)) return
    setAddingId(course.id)
    const { data: round, error } = await supabase.from('rounds').insert({
      user_id:   user.id,
      course_id: course.id,
      played_at: new Date().toISOString().split('T')[0],
      elo_score: ELO_DEFAULT,
    }).select().single()
    if (!error && round) {
      setAddedCourses(prev => [...prev, { course, roundId: round.id }])
    }
    setAddingId(null)
    setSearch('')
    setResults([])
  }

  async function removeCourse(courseId, roundId) {
    await supabase.from('rounds').delete().eq('id', roundId)
    setAddedCourses(prev => prev.filter(c => c.course.id !== courseId))
  }

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
        <h2 style={{ fontFamily: serif, fontSize: 24, fontWeight: 900, color: B.cream, margin: '0 0 8px' }}>
          Add courses you've played
        </h2>
        <p style={{ fontFamily: sans, fontSize: 13, color: 'rgba(240,232,213,0.6)', margin: 0 }}>
          Add up to 3 to get your personal rankings started
        </p>
      </div>

      {/* Progress indicator */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 64, height: 6, borderRadius: 3,
            background: i < addedCourses.length ? B.gold : 'rgba(240,232,213,0.15)',
            transition: 'all 0.3s',
          }}/>
        ))}
      </div>

      {/* Added courses */}
      {addedCourses.length > 0 && (
        <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {addedCourses.map(({ course, roundId }) => (
            <div key={course.id} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${B.gold}40` }}>
              <span style={{ fontSize: 20 }}>{course.icon || '⛳'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 700, color: B.cream }}>{course.name}</div>
                <div style={{ fontFamily: sans, fontSize: 11, color: 'rgba(240,232,213,0.5)' }}>{course.state}</div>
              </div>
              <button onClick={() => removeCourse(course.id, roundId)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', color: 'rgba(240,232,213,0.5)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      {addedCourses.length < 3 && (
        <div style={{ marginBottom: 16 }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search for a course..."
            style={{ ...inputStyle, fontSize: 14 }}
          />
          {searching && (
            <div style={{ textAlign: 'center', padding: '10px 0', fontFamily: sans, fontSize: 12, color: 'rgba(240,232,213,0.4)' }}>
              Searching...
            </div>
          )}
          {results.length > 0 && (
            <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(240,232,213,0.1)' }}>
              {results.map(course => {
                const alreadyAdded = addedCourses.find(c => c.course.id === course.id)
                return (
                  <button key={course.id} onClick={() => !alreadyAdded && addCourse(course)} disabled={!!alreadyAdded || addingId === course.id}
                    style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid rgba(240,232,213,0.06)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: alreadyAdded ? 'default' : 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: 18 }}>{course.icon || '⛳'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: B.cream }}>{course.name}</div>
                      <div style={{ fontFamily: sans, fontSize: 11, color: 'rgba(240,232,213,0.45)' }}>{course.location || course.state}</div>
                    </div>
                    <span style={{ fontFamily: sans, fontSize: 11, color: alreadyAdded ? B.gold : 'rgba(240,232,213,0.4)', fontWeight: 700 }}>
                      {addingId === course.id ? '...' : alreadyAdded ? '✓ Added' : '+ Add'}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      <button onClick={onNext} disabled={addedCourses.length === 0}
        style={{ width: '100%', background: addedCourses.length === 0 ? 'rgba(196,150,58,0.3)' : B.gold, color: B.navy, border: 'none', borderRadius: 14, padding: '16px 0', fontWeight: 900, fontSize: 16, cursor: addedCourses.length === 0 ? 'not-allowed' : 'pointer', fontFamily: serif, marginBottom: 10 }}>
        {addedCourses.length === 0 ? 'Add at least 1 course' : `Continue with ${addedCourses.length} course${addedCourses.length > 1 ? 's' : ''} →`}
      </button>
      <button onClick={onSkip}
        style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(240,232,213,0.35)', fontFamily: sans, fontSize: 13, cursor: 'pointer', padding: '8px 0' }}>
        Skip for now
      </button>
    </div>
  )
}

// ── Step 3: Elo Comparison ────────────────────────────────────────────────────
function StepElo({ addedCourses, onComplete }) {
  const { user } = useAuth()
  const [eloScores, setEloScores] = useState(() => {
    const s = {}
    addedCourses.forEach(({ roundId }) => { s[roundId] = ELO_DEFAULT })
    return s
  })
  const [comparisons, setComparisons]   = useState([])
  const [currentPair, setCurrentPair]   = useState(null)
  const [compNum,     setCompNum]       = useState(0)
  const [animating,   setAnimating]     = useState(null)
  const [done,        setDone]          = useState(false)
  const total = Math.min(3, addedCourses.length - 1)

  useEffect(() => { pickPair(eloScores, []) }, [])

  function pickPair(scores, done) {
    const usedA = done.map(d => d.aId)
    const usedB = done.map(d => d.bId)
    const available = addedCourses.filter(c => !usedA.includes(c.roundId) && !usedB.includes(c.roundId))
    if (available.length < 2 || done.length >= total) { finish(scores, done); return }
    const [a, b] = available.sort(() => Math.random() - 0.5).slice(0, 2)
    setCurrentPair({ a, b })
  }

  function handleChoice(winnerId, loserId) {
    if (animating) return
    setAnimating(winnerId)
    setTimeout(() => {
      const s = { ...eloScores }
      const { newWinner, newLoser } = calcElo(s[winnerId], s[loserId])
      s[winnerId] = newWinner
      s[loserId]  = newLoser
      const newComps = [...comparisons, { aId: winnerId, bId: loserId, winnerId, loserId }]
      setEloScores(s)
      setComparisons(newComps)
      setAnimating(null)
      setCompNum(n => n + 1)
      if (newComps.length >= total) { finish(s, newComps) } else { pickPair(s, newComps) }
    }, 500)
  }

  async function finish(scores, comps) {
    setDone(true)
    for (const { roundId } of addedCourses) {
      await supabase.from('rounds').update({ elo_score: scores[roundId] || ELO_DEFAULT }).eq('id', roundId)
    }
    const sorted = [...addedCourses].sort((a, b) => (scores[b.roundId] || ELO_DEFAULT) - (scores[a.roundId] || ELO_DEFAULT))
    for (let i = 0; i < sorted.length; i++) {
      await supabase.from('rounds').update({ personal_rank: i + 1 }).eq('id', sorted[i].roundId)
    }
    for (const c of comps) {
      await supabase.from('elo_comparisons').insert({ user_id: user.id, winner_round_id: c.winnerId, loser_round_id: c.loserId })
    }
    const topCourse = sorted[0]?.course?.name || 'your top course'
    setTimeout(() => onComplete(topCourse), 1200)
  }

  if (done) {
    return (
      <div style={{ padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🏆</div>
        <h2 style={{ fontFamily: serif, fontSize: 26, fontWeight: 900, color: B.gold, margin: '0 0 8px' }}>Rankings Set!</h2>
        <p style={{ fontFamily: sans, fontSize: 14, color: 'rgba(240,232,213,0.6)', margin: 0 }}>Calculating your personal rankings...</p>
      </div>
    )
  }

  if (!currentPair) return null
  const { a, b } = currentPair

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,232,213,0.4)', fontFamily: sans, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
          Comparison {compNum + 1} of {total}
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < compNum ? B.gold : i === compNum ? 'rgba(196,150,58,0.5)' : 'rgba(240,232,213,0.2)', transition: 'all 0.3s' }}/>
          ))}
        </div>
        <h2 style={{ fontFamily: serif, fontSize: 24, fontWeight: 900, color: B.cream, margin: '0 0 6px' }}>Which did you prefer?</h2>
        <p style={{ fontFamily: sans, fontSize: 13, color: 'rgba(240,232,213,0.5)', margin: 0 }}>Tap the course you enjoyed more</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center' }}>
        {/* Card A */}
        <button type="button" onClick={() => handleChoice(a.roundId, b.roundId)}
          style={{
            background: animating === a.roundId ? `${B.gold}30` : animating === b.roundId ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
            border: `2px solid ${animating === a.roundId ? B.gold : 'rgba(240,232,213,0.15)'}`,
            borderRadius: 18, padding: '24px 12px', cursor: 'pointer', textAlign: 'center',
            transition: 'all 0.3s',
            transform: animating === a.roundId ? 'scale(1.06)' : animating === b.roundId ? 'scale(0.93)' : 'scale(1)',
            opacity: animating === b.roundId ? 0.35 : 1,
          }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>{a.course.icon || '⛳'}</div>
          <div style={{ fontFamily: serif, fontSize: 13, fontWeight: 800, color: B.cream, lineHeight: 1.4 }}>{a.course.name}</div>
          <div style={{ fontFamily: sans, fontSize: 11, color: 'rgba(240,232,213,0.4)', marginTop: 5 }}>{a.course.state}</div>
        </button>

        {/* VS */}
        <div style={{ fontFamily: serif, fontSize: 12, fontWeight: 900, color: 'rgba(240,232,213,0.3)', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '6px 8px' }}>VS</div>

        {/* Card B */}
        <button type="button" onClick={() => handleChoice(b.roundId, a.roundId)}
          style={{
            background: animating === b.roundId ? `${B.gold}30` : animating === a.roundId ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
            border: `2px solid ${animating === b.roundId ? B.gold : 'rgba(240,232,213,0.15)'}`,
            borderRadius: 18, padding: '24px 12px', cursor: 'pointer', textAlign: 'center',
            transition: 'all 0.3s',
            transform: animating === b.roundId ? 'scale(1.06)' : animating === a.roundId ? 'scale(0.93)' : 'scale(1)',
            opacity: animating === a.roundId ? 0.35 : 1,
          }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>{b.course.icon || '⛳'}</div>
          <div style={{ fontFamily: serif, fontSize: 13, fontWeight: 800, color: B.cream, lineHeight: 1.4 }}>{b.course.name}</div>
          <div style={{ fontFamily: sans, fontSize: 11, color: 'rgba(240,232,213,0.4)', marginTop: 5 }}>{b.course.state}</div>
        </button>
      </div>

      <p style={{ textAlign: 'center', fontFamily: sans, fontSize: 11, color: 'rgba(240,232,213,0.3)', marginTop: 20 }}>
        This builds your personal course rankings
      </p>
    </div>
  )
}

// ── Step 4: Follow Suggested Golfers ─────────────────────────────────────────
function StepFollow({ onFinish }) {
  const [followed, setFollowed] = useState({})

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
        <h2 style={{ fontFamily: serif, fontSize: 24, fontWeight: 900, color: B.cream, margin: '0 0 8px' }}>
          See what others are playing
        </h2>
        <p style={{ fontFamily: sans, fontSize: 13, color: 'rgba(240,232,213,0.6)', margin: 0 }}>
          Follow golfers to fill your feed
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {SUGGESTED.map(g => (
          <div key={g.id} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(240,232,213,0.08)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: B.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              {g.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: sans, fontSize: 14, fontWeight: 700, color: B.cream }}>{g.name}</div>
              <div style={{ fontFamily: sans, fontSize: 11, color: 'rgba(240,232,213,0.45)' }}>@{g.username} · {g.location}</div>
            </div>
            <button onClick={() => setFollowed(p => ({ ...p, [g.id]: !p[g.id] }))}
              style={{
                background: followed[g.id] ? B.gold : 'rgba(255,255,255,0.08)',
                color: followed[g.id] ? B.navy : B.cream,
                border: `1.5px solid ${followed[g.id] ? B.gold : 'rgba(240,232,213,0.2)'}`,
                borderRadius: 20, padding: '6px 14px', fontWeight: 700, fontSize: 12,
                cursor: 'pointer', fontFamily: sans, transition: 'all 0.15s', flexShrink: 0,
              }}>
              {followed[g.id] ? '✓ Following' : 'Follow'}
            </button>
          </div>
        ))}
      </div>

      <button onClick={onFinish}
        style={{ width: '100%', background: B.gold, color: B.navy, border: 'none', borderRadius: 14, padding: '16px 0', fontWeight: 900, fontSize: 16, cursor: 'pointer', fontFamily: serif }}>
        Start Exploring →
      </button>
    </div>
  )
}

// ── Main Onboarding Component ─────────────────────────────────────────────────
export default function Onboarding() {
  const { B, serif, sans } = useTheme()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [step,         setStep]         = useState(1)
  const [addedCourses, setAddedCourses] = useState([])
  const [topCourse,    setTopCourse]    = useState('')
  const TOTAL = 4

  function handleEloComplete(topCourseName) {
    setTopCourse(topCourseName)
    setStep(4)
  }

  function goToStep3() {
    if (addedCourses.length < 2) {
      setStep(4) // skip Elo if only 1 course
    } else {
      setStep(3)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: B.navy,
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '40px 0',
    }}>
      <div style={{ maxWidth: 480, width: '100%', margin: '0 auto' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 900, color: B.gold, letterSpacing: '0.05em' }}>
            FIRST LOOP
          </div>
        </div>

        {/* Progress dots */}
        <ProgressDots current={step} total={TOTAL} />

        {/* Steps */}
        {step === 1 && (
          <StepProfile onNext={() => setStep(2)} profile={profile}/>
        )}

        {step === 2 && (
          <StepLogCourses
            onNext={goToStep3}
            onSkip={() => setStep(4)}
            addedCourses={addedCourses}
            setAddedCourses={setAddedCourses}
          />
        )}

        {step === 3 && addedCourses.length >= 2 && (
          <StepElo
            addedCourses={addedCourses}
            onComplete={handleEloComplete}
          />
        )}

        {step === 4 && (
          <StepFollow onFinish={() => navigate('/feed')}/>
        )}

      </div>
    </div>
  )
}