import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'

// ── Elo helpers ───────────────────────────────────────────────────────────────
const ELO_CONFIG = { default: 1500, k: 32, min: 800, max: 2800 }
function calcElo(winR, loseR) {
  const exp = 1 / (1 + Math.pow(10, (loseR - winR) / 400))
  return {
    newWinner: Math.min(ELO_CONFIG.max, Math.max(ELO_CONFIG.min, Math.round(winR  + ELO_CONFIG.k * (1 - exp)))),
    newLoser:  Math.min(ELO_CONFIG.max, Math.max(ELO_CONFIG.min, Math.round(loseR + ELO_CONFIG.k * (0 - (1 - exp))))),
  }
}

// ── Emoji rating ──────────────────────────────────────────────────────────────
const EMOJIS = ['', '😤', '😕', '😐', '😊', '🤩']
const LABELS = ['', 'Poor', 'Below Average', 'Average', 'Great', 'World Class']

function EmojiPicker({ value, onChange, color }) {
  const { B, serif, sans } = useTheme()
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map(v => (
        <button key={v} type="button" onClick={() => onChange(v)}
          style={{
            width: 56, height: 56, borderRadius: 14,
            border: `2px solid ${value === v ? color : B.border}`,
            background: value === v ? `${color}18` : '#fff',
            cursor: 'pointer', fontSize: 26,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
            transform: value === v ? 'scale(1.12)' : 'scale(1)',
          }}>
          {EMOJIS[v]}
        </button>
      ))}
    </div>
  )
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ current, total }) {
  const { B, serif, sans } = useTheme()
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 4, borderRadius: 2,
          background: i < current ? B.gold : i === current ? `${B.gold}50` : B.border,
          transition: 'all 0.3s',
        }}/>
      ))}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LogCourse() {
  const { B, serif, sans } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const fileRef  = useRef(null)

  // ── Multi-step state ─────────────────────────────────────────────────────
  const [step, setStep] = useState(1)

  // Step 1 — course search
  const [search,         setSearch]         = useState('')
  const [results,        setResults]        = useState([])
  const [searching,      setSearching]      = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)

  // Step 2 — details
  const [playedAt,     setPlayedAt]     = useState(new Date().toISOString().split('T')[0])
  const [score,        setScore]        = useState('')
  const [note,         setNote]         = useState('')
  const [photo,        setPhoto]        = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  // Step 3 — Elo
  const [prevRounds,  setPrevRounds]  = useState([])
  const [eloScores,   setEloScores]   = useState({})
  const [comparisons, setComparisons] = useState([])
  const [currentPair, setCurrentPair] = useState(null)
  const [compNum,     setCompNum]     = useState(0)
  const [animating,   setAnimating]   = useState(null)
  const [eloDone,     setEloDone]     = useState(false)

  // Step 4 — ratings
  const [conditions, setConditions] = useState(0)
  const [value,      setValue]      = useState(0)
  const [vibes,      setVibes]      = useState(0)

  // Step 5 — result
  const [finalRank, setFinalRank] = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  // ── Pre-populate course if navigated from a course page ───────────────────
  useEffect(() => {
    const s = location.state
    if (s?.courseId) {
      setSelectedCourse({
        id:       s.courseId,
        name:     s.courseName,
        icon:     s.courseIcon,
        bg_color: s.courseBg,
        state:    s.courseState,
      })
      setStep(2)
    }
  }, [])

  // ── Course search ────────────────────────────────────────────────────────
  useEffect(() => {
    if (search.length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      const { data } = await supabase.from('courses')
        .select('id, name, location, state, icon, bg_color')
        .ilike('name', `%${search}%`).limit(8)
      setResults(data || [])
      setSearching(false)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  // ── Photo handler ────────────────────────────────────────────────────────
  function handlePhotoSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('Photo must be under 10MB'); return }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function uploadPhoto() {
    if (!photo) return null
    const ext = photo.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('round-photos').upload(fileName, photo, { contentType: photo.type })
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('round-photos').getPublicUrl(fileName)
    return publicUrl
  }

  // ── Elo init (when entering step 3) ─────────────────────────────────────
  async function initElo() {
    const { data: prev } = await supabase
      .from('rounds')
      .select('id, elo_score, personal_rank, course_id, courses(name, icon)')
      .eq('user_id', user.id)
      .order('elo_score', { ascending: false })

    // Deduplicate — keep only highest Elo round per course
    const seen = new Set()
    const rounds = (prev || []).filter(r => {
      const cId = r.course_id
      if (seen.has(cId)) return false
      seen.add(cId)
      return true
    })
    setPrevRounds(rounds)

    if (rounds.length === 0) {
      setEloDone(true)
      return
    }

    const scores = {}
    rounds.forEach(r => { scores[r.id] = r.elo_score || ELO_CONFIG.default })
    scores['new'] = ELO_CONFIG.default
    setEloScores(scores)
    pickPair(scores, [], rounds)
  }

  function pickPair(scores, done, rounds) {
    const usedRoundIds  = done.map(d => d.prevId)
    const usedCourseIds = (rounds || prevRounds)
      .filter(r => usedRoundIds.includes(r.id))
      .map(r => r.course_id)
    const available = (rounds || prevRounds).filter(r =>
      !usedRoundIds.includes(r.id) &&
      !usedCourseIds.includes(r.course_id)
    )
    const total = Math.min(3, (rounds || prevRounds).length)
    if (available.length === 0 || done.length >= total) {
      setEloDone(true)
      return
    }
    const pick = available[Math.floor(Math.random() * available.length)]
    setCurrentPair({ b: pick })
  }

  function handleEloChoice(winner) {
    if (animating) return
    setAnimating(winner)
    setTimeout(() => {
      const prevRound = currentPair.b
      const newScores = { ...eloScores }
      if (winner === 'new') {
        const { newWinner, newLoser } = calcElo(newScores['new'], newScores[prevRound.id])
        newScores['new'] = newWinner
        newScores[prevRound.id] = newLoser
      } else {
        const { newWinner, newLoser } = calcElo(newScores[prevRound.id], newScores['new'])
        newScores[prevRound.id] = newWinner
        newScores['new'] = newLoser
      }
      const newComps = [...comparisons, {
        prevId:   prevRound.id,
        winnerId: winner === 'new' ? 'new' : prevRound.id,
        loserId:  winner === 'new' ? prevRound.id : 'new',
      }]
      setEloScores(newScores)
      setComparisons(newComps)
      setAnimating(null)
      const total = Math.min(3, prevRounds.length)
      if (newComps.length >= total) {
        setEloDone(true)
      } else {
        setCompNum(n => n + 1)
        pickPair(newScores, newComps, prevRounds)
      }
    }, 500)
  }

  // ── Save round ────────────────────────────────────────────────────────────
  async function saveRound() {
    setSaving(true)
    setError('')
    try {
      const photoUrl = await uploadPhoto()
      const overall  = conditions && value && vibes
        ? parseFloat(((conditions + value + vibes) / 3 * 2).toFixed(1))
        : null
      const finalElo = eloScores['new'] || ELO_CONFIG.default

      const { data: newRound, error: insertErr } = await supabase.from('rounds').insert({
        user_id:           user.id,
        course_id:         selectedCourse.id,
        played_at:         playedAt,
        score:             score ? parseInt(score) : null,
        comment:           note || null,
        photo_url:         photoUrl,
        conditions_rating: conditions * 2,
        value_rating:      value * 2,
        vibes_rating:      vibes * 2,
        overall_rating:    overall,
        elo_score:         finalElo,
      }).select().single()
      if (insertErr) throw insertErr

      for (const comp of comparisons) {
        if (comp.prevId !== 'new') {
          await supabase.from('rounds').update({ elo_score: eloScores[comp.prevId] }).eq('id', comp.prevId)
        }
      }

      for (const comp of comparisons) {
        await supabase.from('elo_comparisons').insert({
          user_id:         user.id,
          winner_round_id: comp.winnerId === 'new' ? newRound.id : comp.winnerId,
          loser_round_id:  comp.loserId  === 'new' ? newRound.id : comp.loserId,
        })
      }

      const { data: allRounds } = await supabase.from('rounds')
        .select('id, elo_score').eq('user_id', user.id).order('elo_score', { ascending: false })
      if (allRounds) {
        for (let i = 0; i < allRounds.length; i++) {
          await supabase.from('rounds').update({ personal_rank: i + 1 }).eq('id', allRounds[i].id)
        }
        const myRank = allRounds.findIndex(r => r.id === newRound.id) + 1
        setFinalRank(myRank)
      }

      const { data: courseRounds } = await supabase.from('rounds').select('elo_score').eq('course_id', selectedCourse.id)
      if (courseRounds && courseRounds.length > 0) {
        const avg = Math.round(courseRounds.reduce((s, r) => s + (r.elo_score || 1500), 0) / courseRounds.length)
        await supabase.from('courses').update({ community_elo: avg }).eq('id', selectedCourse.id)
      }

      setStep(5)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: `1px solid ${B.border}`, fontSize: 14, fontFamily: sans,
    color: B.textNavy, outline: 'none', background: '#fff', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── STEP 1: Find the Course ── */}
      {step === 1 && (
        <div>
          <div style={{ background: B.navy, borderRadius: 20, padding: '24px 20px', marginBottom: 20 }}>
            <h1 style={{ fontFamily: serif, fontSize: 24, fontWeight: 900, color: B.cream, margin: '0 0 6px' }}>Log a Round</h1>
            <p style={{ fontFamily: sans, fontSize: 13, color: 'rgba(240,232,213,0.6)', margin: '0 0 16px' }}>Which course did you play?</p>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by course name..."
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: 'none', fontSize: 15, fontFamily: sans, outline: 'none', boxSizing: 'border-box', background: 'rgba(255,255,255,0.1)', color: B.cream }}
              autoFocus
            />
          </div>

          {searching && <div style={{ textAlign: 'center', padding: '16px', fontFamily: sans, fontSize: 13, color: B.textSoft }}>Searching...</div>}

          {results.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: `1px solid ${B.border}` }}>
              {results.map(course => (
                <button key={course.id}
                  onClick={() => { setSelectedCourse(course); setSearch(''); setResults([]); setStep(2) }}
                  style={{ width: '100%', background: 'none', border: 'none', borderBottom: `1px solid ${B.feedBg}`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: course.bg_color || B.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {course.icon || '⛳'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: sans, fontSize: 14, fontWeight: 700, color: B.textNavy }}>{course.name}</div>
                    <div style={{ fontFamily: sans, fontSize: 12, color: B.textSoft }}>{course.location || course.state}</div>
                  </div>
                  <span style={{ fontSize: 18, color: B.textSoft }}>›</span>
                </button>
              ))}
            </div>
          )}

          {search.length >= 2 && !searching && results.length === 0 && (
            <div style={{ background: '#fff', borderRadius: 16, padding: '20px', border: `1px solid ${B.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: B.textSoft, fontFamily: sans, marginBottom: 12 }}>Can't find "{search}"?</div>
              <button onClick={() => navigate('/submit')}
                style={{ background: B.navy, color: B.cream, border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: sans }}>
                + Submit this course
              </button>
            </div>
          )}

          {!search && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⛳</div>
              <div style={{ fontFamily: serif, fontSize: 16, color: B.textSoft }}>Start typing to search 1,000+ courses</div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: Details ── */}
      {step === 2 && selectedCourse && (
        <div>
          <StepBar current={1} total={4}/>
          <div style={{ background: selectedCourse.bg_color || B.navy, borderRadius: 16, padding: '16px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 32 }}>{selectedCourse.icon || '⛳'}</div>
            <div>
              <div style={{ fontFamily: serif, fontSize: 16, fontWeight: 900, color: B.cream }}>{selectedCourse.name}</div>
              <div style={{ fontFamily: sans, fontSize: 12, color: 'rgba(240,232,213,0.6)' }}>{selectedCourse.state}</div>
            </div>
            <button onClick={() => setStep(1)}
              style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '6px 10px', color: 'rgba(240,232,213,0.6)', fontSize: 12, cursor: 'pointer', fontFamily: sans }}>
              Change
            </button>
          </div>

          <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 900, color: B.textNavy, margin: '0 0 18px' }}>Round Details</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: B.textMid, fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score</label>
              <input value={score} onChange={e => setScore(e.target.value)} placeholder="e.g. 82" type="number" min="50" max="150" style={inputStyle}/>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: B.textMid, fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date Played</label>
              <input value={playedAt} onChange={e => setPlayedAt(e.target.value)} type="date" style={inputStyle}/>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: B.textMid, fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Note <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional · {280 - note.length} chars left)</span>
            </label>
            <textarea value={note} onChange={e => e.target.value.length <= 280 && setNote(e.target.value)}
              placeholder="How was the round? Any standout holes?" rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}/>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: B.textMid, fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Photo <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span>
            </label>
            {photoPreview ? (
              <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
                <img src={photoPreview} alt="Preview" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}/>
                <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null) }}
                  style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', color: '#fff', fontSize: 14 }}>✕</button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                style={{ width: '100%', border: `2px dashed ${B.border}`, borderRadius: 12, padding: '20px 0', background: B.feedBg, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 28 }}>📷</span>
                <span style={{ fontSize: 13, color: B.textMid, fontFamily: sans, fontWeight: 600 }}>Add a photo of your round</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoSelect} style={{ display: 'none' }}/>
          </div>

          <button onClick={() => { initElo(); setStep(3) }}
            style={{ width: '100%', background: B.gold, color: B.navy, border: 'none', borderRadius: 12, padding: '15px 0', fontWeight: 900, fontSize: 16, cursor: 'pointer', fontFamily: serif }}>
            Continue →
          </button>
        </div>
      )}

      {/* ── STEP 3: Elo Comparison ── */}
      {step === 3 && (
        <div>
          <StepBar current={2} total={4}/>
          {eloDone ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 900, color: B.textNavy, margin: '0 0 8px' }}>Rankings Updated</h2>
              <p style={{ fontFamily: sans, fontSize: 14, color: B.textSoft, marginBottom: 24 }}>Now rate your experience</p>
              <button onClick={() => setStep(4)}
                style={{ background: B.gold, color: B.navy, border: 'none', borderRadius: 12, padding: '13px 28px', fontWeight: 900, fontSize: 15, cursor: 'pointer', fontFamily: serif }}>
                Rate the Course →
              </button>
            </div>
          ) : !currentPair ? (
            <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: sans, color: B.textSoft }}>Setting up comparison...</div>
          ) : (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: B.textSoft, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                  Comparison {Math.min(compNum + 1, Math.min(3, prevRounds.length))} of {Math.min(3, prevRounds.length)}
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
                  {Array.from({ length: Math.min(3, prevRounds.length) }).map((_, i) => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < compNum ? B.green : i === compNum ? B.gold : B.border, transition: 'all 0.3s' }}/>
                  ))}
                </div>
                <h2 style={{ fontFamily: serif, fontSize: 24, fontWeight: 900, color: B.textNavy, margin: '0 0 6px' }}>Which did you prefer?</h2>
                <p style={{ fontFamily: sans, fontSize: 13, color: B.textSoft, margin: 0 }}>Tap the course you enjoyed more</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center' }}>
                <button type="button" onClick={() => handleEloChoice('new')}
                  style={{
                    background:   animating === 'new' ? `${B.green}20` : animating ? 'rgba(0,0,0,0.02)' : B.navy,
                    border:       `2px solid ${animating === 'new' ? B.green : B.navy}`,
                    borderRadius: 18, padding: '24px 12px', cursor: 'pointer', textAlign: 'center',
                    transition:   'all 0.3s',
                    transform:    animating === 'new' ? 'scale(1.06)' : animating ? 'scale(0.93)' : 'scale(1)',
                    opacity:      animating && animating !== 'new' ? 0.35 : 1,
                  }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{selectedCourse?.icon || '⛳'}</div>
                  <div style={{ fontFamily: serif, fontSize: 13, fontWeight: 800, color: B.cream, lineHeight: 1.4 }}>{selectedCourse?.name}</div>
                  <div style={{ fontFamily: sans, fontSize: 11, color: 'rgba(240,232,213,0.5)', marginTop: 5 }}>Today's round</div>
                </button>

                <div style={{ fontFamily: serif, fontSize: 12, fontWeight: 900, color: B.textSoft, background: B.feedBg, borderRadius: 8, padding: '6px 8px', border: `1px solid ${B.border}` }}>VS</div>

                <button type="button" onClick={() => handleEloChoice(currentPair.b.id)}
                  style={{
                    background:   animating === currentPair.b.id ? `${B.green}20` : animating ? 'rgba(0,0,0,0.02)' : '#fff',
                    border:       `2px solid ${animating === currentPair.b.id ? B.green : B.border}`,
                    borderRadius: 18, padding: '24px 12px', cursor: 'pointer', textAlign: 'center',
                    transition:   'all 0.3s',
                    transform:    animating === currentPair.b.id ? 'scale(1.06)' : animating ? 'scale(0.93)' : 'scale(1)',
                    opacity:      animating && animating !== currentPair.b.id ? 0.35 : 1,
                  }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{currentPair.b.courses?.icon || '⛳'}</div>
                  <div style={{ fontFamily: serif, fontSize: 13, fontWeight: 800, color: B.textNavy, lineHeight: 1.4 }}>{currentPair.b.courses?.name || 'Previous Course'}</div>
                  {currentPair.b.personal_rank && (
                    <div style={{ fontFamily: sans, fontSize: 11, color: B.textSoft, marginTop: 5 }}>#{currentPair.b.personal_rank} in your list</div>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 4: Rate the Course ── */}
      {step === 4 && (
        <div>
          <StepBar current={3} total={4}/>
          <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 900, color: B.textNavy, margin: '0 0 6px' }}>Rate Your Experience</h2>
          <p style={{ fontFamily: sans, fontSize: 13, color: B.textSoft, margin: '0 0 22px' }}>at {selectedCourse?.name}</p>

          {error && (
            <div style={{ background: '#fde8e8', color: '#c00', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontFamily: sans, marginBottom: 16 }}>{error}</div>
          )}

          {[
            { label: '⛺ Course Conditions', val: conditions, setter: setConditions, color: B.green },
            { label: '💰 Value for Money',    val: value,      setter: setValue,      color: B.navy  },
            { label: '🏌️ Facilities & Vibes',  val: vibes,      setter: setVibes,      color: B.gold  },
          ].map(({ label, val, setter, color }) => (
            <div key={label} style={{ marginBottom: 16, background: B.feedBg, borderRadius: 14, padding: '16px', border: `1px solid ${B.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: B.textNavy, fontFamily: sans }}>{label}</span>
                {val > 0 && <span style={{ fontSize: 18 }}>{EMOJIS[val]}</span>}
              </div>
              <EmojiPicker value={val} onChange={setter} color={color}/>
              {val > 0 && (
                <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: B.textSoft, fontFamily: sans, fontWeight: 600 }}>
                  {LABELS[val]}
                </div>
              )}
            </div>
          ))}

          <button onClick={saveRound} disabled={saving || !conditions || !value || !vibes}
            style={{
              width: '100%', marginTop: 8,
              background: (!conditions || !value || !vibes) ? B.border : saving ? B.border : B.gold,
              color: B.navy, border: 'none', borderRadius: 12, padding: '15px 0',
              fontWeight: 900, fontSize: 16,
              cursor: (!conditions || !value || !vibes) ? 'not-allowed' : 'pointer',
              fontFamily: serif,
            }}>
            {saving ? 'Saving your round...' : !conditions || !value || !vibes ? 'Rate all 3 to continue' : 'Save Round ⛳'}
          </button>
        </div>
      )}

      {/* ── STEP 5: Share Card ── */}
      {step === 5 && selectedCourse && (
        <div style={{ textAlign: 'center' }}>
          <StepBar current={4} total={4}/>
          <div style={{ background: B.navy, borderRadius: 24, padding: '32px 24px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(196,150,58,0.08)' }}/>
            <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(196,150,58,0.05)' }}/>
            <div style={{ fontFamily: serif, fontSize: 11, fontWeight: 700, color: 'rgba(240,232,213,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 20 }}>FIRST LOOP</div>
            <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 900, color: B.cream, lineHeight: 1.3, marginBottom: 16 }}>{selectedCourse.name}</div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,232,213,0.4)', fontFamily: sans, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Ranked in my list</div>
              <div style={{ fontSize: 80, fontWeight: 900, color: B.gold, fontFamily: serif, lineHeight: 1 }}>#{finalRank || '—'}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
              {[
                { label: 'Conditions', emoji: EMOJIS[conditions] },
                { label: 'Value',      emoji: EMOJIS[value]      },
                { label: 'Vibes',      emoji: EMOJIS[vibes]      },
              ].map(({ label, emoji }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{emoji}</div>
                  <div style={{ fontFamily: sans, fontSize: 10, color: 'rgba(240,232,213,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                </div>
              ))}
            </div>
            {score && (
              <div style={{ fontFamily: sans, fontSize: 13, color: 'rgba(240,232,213,0.5)', marginTop: 8 }}>
                Scored {score} · {new Date(playedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            )}
            <div style={{ marginTop: 20, fontFamily: sans, fontSize: 11, color: 'rgba(240,232,213,0.25)', letterSpacing: '0.05em' }}>firstloopgolf.com</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => navigator.share && navigator.share({ title: `${selectedCourse.name} — #${finalRank} in my list`, text: `Just logged ${selectedCourse.name} on First Loop. Ranked #${finalRank} in my personal list. firstloopgolf.com`, url: 'https://firstloopgolf.com' })}
              style={{ width: '100%', background: B.gold, color: B.navy, border: 'none', borderRadius: 12, padding: '14px 0', fontWeight: 900, fontSize: 15, cursor: 'pointer', fontFamily: serif }}>
              📤 Share Your Round
            </button>
            <button onClick={() => navigate('/feed')}
              style={{ width: '100%', background: B.navy, color: B.cream, border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: sans }}>
              View in Feed
            </button>
            <button onClick={() => navigate('/profile')}
              style={{ width: '100%', background: '#fff', color: B.textMid, border: `1px solid ${B.border}`, borderRadius: 12, padding: '12px 0', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: sans }}>
              See My Rankings
            </button>
          </div>
        </div>
      )}
    </div>
  )
}