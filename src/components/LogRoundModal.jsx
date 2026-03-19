import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import ShareRoundModal from './ShareRoundModal.jsx'

// ─── Elo Algorithm ─────────────────────────────────────────────────────────────
const ELO_CONFIG = { defaultRating: 1500, kFactor: 32, min: 800, max: 2800 }

function calculateElo(winnerRating, loserRating) {
  const k = ELO_CONFIG.kFactor
  const expected = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400))
  const newWinner = Math.min(ELO_CONFIG.max, Math.max(ELO_CONFIG.min, Math.round(winnerRating + k * (1 - expected))))
  const newLoser  = Math.min(ELO_CONFIG.max, Math.max(ELO_CONFIG.min, Math.round(loserRating  + k * (0 - (1 - expected)))))
  return { newWinner, newLoser }
}

// ─── Emoji Rating Picker ────────────────────────────────────────────────────────
const EMOJIS = ['', '😤', '😕', '😐', '😊', '🤩']
const LABELS = ['', 'Poor', 'Below Average', 'Average', 'Great', 'World Class']

function EmojiPicker({ value, onChange, color }) {
  const { B, serif, sans } = useTheme()
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map(v => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          style={{
            width: 52, height: 52, borderRadius: 12,
            border: `2px solid ${value === v ? color : B.border}`,
            background: value === v ? `${color}18` : '#fff',
            cursor: 'pointer', fontSize: 24,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
            transform: value === v ? 'scale(1.12)' : 'scale(1)',
          }}
        >
          {EMOJIS[v]}
        </button>
      ))}
    </div>
  )
}

// ─── Elo Comparison Screen ──────────────────────────────────────────────────────
function EloComparison({ newCourseName, previousRounds, onComplete }) {
  const { B, serif, sans } = useTheme()
  const [comparisons, setComparisons] = useState([])
  const [currentPair, setCurrentPair] = useState(null)
  const [eloScores, setEloScores]     = useState({})
  const [animating, setAnimating]     = useState(null) // 'a' | 'b'
  const [roundNum, setRoundNum]       = useState(0)
  const totalRounds = Math.min(3, previousRounds.length)

  useEffect(() => {
    const scores = {}
    previousRounds.forEach(r => { scores[r.id] = r.elo_score || ELO_CONFIG.defaultRating })
    scores['new'] = ELO_CONFIG.defaultRating
    setEloScores(scores)
    pickNextPair(scores, [])
  }, [])

  function pickNextPair(scores, done) {
    const used = done.map(d => d.prevId)
    const available = previousRounds.filter(r => !used.includes(r.id))
    if (available.length === 0 || done.length >= totalRounds) {
      onComplete(scores, done)
      return
    }
    const pick = available[Math.floor(Math.random() * available.length)]
    setCurrentPair({ b: pick })
  }

  function handleChoice(winner) {
    if (animating) return
    setAnimating(winner)

    setTimeout(() => {
      const prevRound = currentPair.b
      const newElo = { ...eloScores }

      if (winner === 'a') {
        // New course wins
        const { newWinner, newLoser } = calculateElo(newElo['new'], newElo[prevRound.id])
        newElo['new'] = newWinner
        newElo[prevRound.id] = newLoser
      } else {
        // Previous course wins
        const { newWinner, newLoser } = calculateElo(newElo[prevRound.id], newElo['new'])
        newElo[prevRound.id] = newWinner
        newElo['new'] = newLoser
      }

      const newComparisons = [...comparisons, {
        prevId:   prevRound.id,
        winnerId: winner === 'a' ? 'new' : prevRound.id,
        loserId:  winner === 'a' ? prevRound.id : 'new',
      }]

      setEloScores(newElo)
      setComparisons(newComparisons)
      setAnimating(null)
      setRoundNum(n => n + 1)

      if (newComparisons.length >= totalRounds) {
        onComplete(newElo, newComparisons)
      } else {
        pickNextPair(newElo, newComparisons)
      }
    }, 600)
  }

  if (!currentPair) return null
  const prevRound = currentPair.b

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Progress */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: B.textSoft, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
          Comparison {roundNum + 1} of {totalRounds}
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {Array.from({ length: totalRounds }).map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%', transition: 'all 0.3s',
              background: i < roundNum ? B.green : i === roundNum ? B.gold : B.border,
            }}/>
          ))}
        </div>
      </div>

      <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 900, color: B.textNavy, margin: '0 0 6px' }}>
        Which did you prefer?
      </h2>
      <p style={{ fontFamily: sans, fontSize: 13, color: B.textSoft, margin: '0 0 28px' }}>
        Tap the course you enjoyed more
      </p>

      {/* Head-to-head cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: 28 }}>

        {/* Card A — New Course */}
        <button
          type="button"
          onClick={() => handleChoice('a')}
          style={{
            background:   animating === 'a' ? `${B.green}25` : animating === 'b' ? 'rgba(0,0,0,0.03)' : B.navy,
            border:       `2px solid ${animating === 'a' ? B.green : B.navy}`,
            borderRadius: 16, padding: '22px 12px', cursor: 'pointer', textAlign: 'center',
            transition:   'all 0.3s',
            transform:    animating === 'a' ? 'scale(1.06)' : animating === 'b' ? 'scale(0.94)' : 'scale(1)',
            opacity:      animating === 'b' ? 0.4 : 1,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 10 }}>⛳</div>
          <div style={{ fontFamily: serif, fontSize: 13, fontWeight: 800, color: B.cream, lineHeight: 1.4 }}>
            {newCourseName}
          </div>
          <div style={{ fontFamily: sans, fontSize: 11, color: 'rgba(240,232,213,0.55)', marginTop: 5 }}>
            Today's Round
          </div>
        </button>

        {/* VS badge */}
        <div style={{
          fontFamily: serif, fontSize: 13, fontWeight: 900, color: B.textSoft,
          background: B.feedBg, borderRadius: 8, padding: '6px 8px',
          border: `1px solid ${B.border}`,
        }}>VS</div>

        {/* Card B — Previous Course */}
        <button
          type="button"
          onClick={() => handleChoice('b')}
          style={{
            background:   animating === 'b' ? `${B.green}25` : animating === 'a' ? 'rgba(0,0,0,0.03)' : '#fff',
            border:       `2px solid ${animating === 'b' ? B.green : B.border}`,
            borderRadius: 16, padding: '22px 12px', cursor: 'pointer', textAlign: 'center',
            transition:   'all 0.3s',
            transform:    animating === 'b' ? 'scale(1.06)' : animating === 'a' ? 'scale(0.94)' : 'scale(1)',
            opacity:      animating === 'a' ? 0.4 : 1,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 10 }}>{prevRound.courses?.icon || '⛳'}</div>
          <div style={{ fontFamily: serif, fontSize: 13, fontWeight: 800, color: B.textNavy, lineHeight: 1.4 }}>
            {prevRound.courses?.name || 'Previous Course'}
          </div>
          <div style={{ fontFamily: sans, fontSize: 11, color: B.textSoft, marginTop: 5 }}>
            {prevRound.personal_rank ? `#${prevRound.personal_rank} in your list` : 'Previously played'}
          </div>
        </button>

      </div>

      <p style={{ fontFamily: sans, fontSize: 11, color: B.textSoft, margin: 0 }}>
        Your answer builds your personal course rankings
      </p>
    </div>
  )
}

// ─── Success Screen ─────────────────────────────────────────────────────────────
function SuccessScreen({ courseName, courseId, score, finalRank, round, course, onClose, onViewFeed }) {
  const { B, serif, sans } = useTheme()
  const [showShare, setShowShare] = useState(false)

  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      {showShare && round && (
        <ShareRoundModal round={round} course={course} onClose={() => setShowShare(false)}/>
      )}

      {/* Check icon */}
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={B.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 900, color: B.textNavy, margin: '0 0 8px' }}>
        Round Logged!
      </h2>
      <p style={{ fontFamily: sans, fontSize: 14, color: B.textSoft, margin: '0 0 24px', lineHeight: 1.6 }}>
        <strong style={{ color: B.textNavy }}>{courseName}</strong> has been added to your personal rankings.
      </p>

      {/* Rank reveal card */}
      <div style={{ background: B.navy, borderRadius: 20, padding: '28px 24px', marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,232,213,0.5)', fontFamily: sans, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
          Ranked in your list
        </div>
        <div style={{ fontSize: 72, fontWeight: 900, color: B.gold, fontFamily: serif, lineHeight: 1 }}>
          #{finalRank || '—'}
        </div>
        <div style={{ fontSize: 14, color: 'rgba(240,232,213,0.8)', fontFamily: serif, marginTop: 8, fontWeight: 600 }}>
          {courseName}
        </div>
        {score && (
          <div style={{ marginTop: 10, fontSize: 13, color: 'rgba(240,232,213,0.45)', fontFamily: sans }}>
            Score: {score}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={() => setShowShare(true)}
          style={{ width: '100%', background: B.gold, color: B.navy, border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: serif }}
        >
          📤 Share Your Round
        </button>
        <button
          onClick={onViewFeed}
          style={{ width: '100%', background: B.navy, color: B.cream, border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: sans }}
        >
          View in Community Feed
        </button>
        <button
          onClick={onClose}
          style={{ width: '100%', background: '#fff', color: B.textMid, border: `1px solid ${B.border}`, borderRadius: 12, padding: '12px 0', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: sans }}
        >
          Done
        </button>
      </div>
    </div>
  )
}

// ─── Main Modal ─────────────────────────────────────────────────────────────────
export default function LogRoundModal({ courseId, courseName, onClose, onSuccess }) {
  const { B, serif, sans } = useTheme()
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const fileRef    = useRef(null)

  const [step, setStep]               = useState('form') // 'form' | 'elo' | 'success'
  const [score, setScore]             = useState('')
  const [conditions, setConditions]   = useState(0)
  const [value, setValue]             = useState(0)
  const [vibes, setVibes]             = useState(0)
  const [comment, setComment]         = useState('')
  const [playedAt, setPlayedAt]       = useState(new Date().toISOString().split('T')[0])
  const [photo, setPhoto]             = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploading, setUploading]     = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [savedRound, setSavedRound]   = useState(null)
  const [previousRounds, setPreviousRounds] = useState([])
  const [finalRank, setFinalRank]     = useState(null)

  const inputStyle = {
    width: '100%', padding: '11px 13px', borderRadius: 10,
    border: `1px solid ${B.border}`, fontSize: 14, fontFamily: sans,
    color: B.textNavy, outline: 'none', background: '#fff', boxSizing: 'border-box',
  }

  function handlePhotoSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('Photo must be under 10MB'); return }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
    setError('')
  }

  async function uploadPhoto() {
    if (!photo) return null
    const ext      = photo.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('round-photos').upload(fileName, photo, { contentType: photo.type })
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('round-photos').getPublicUrl(fileName)
    return publicUrl
  }

  // ── Step 1: Form submitted → load previous rounds, show Elo or save directly ──
  async function handleFormContinue(e) {
    e.preventDefault()
    if (!conditions || !value || !vibes) { setError('Please rate all 3 categories'); return }
    setError('')
    setLoading(true)

    try {
      const { data: prev } = await supabase
        .from('rounds')
        .select('id, elo_score, personal_rank, courses(name, icon)')
        .eq('user_id', user.id)
        .order('elo_score', { ascending: false })

      setPreviousRounds(prev || [])

      if (!prev || prev.length === 0) {
        // First round ever — no comparison needed
        await saveRound(ELO_CONFIG.defaultRating, 1, [], [])
      } else {
        setStep('elo')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Elo comparisons done → save everything ───────────────────────────
  async function handleEloComplete(eloScores, comparisons) {
    setLoading(true)
    try {
      const updatedPrevious = comparisons.map(c => ({
        id:        c.prevId,
        elo_score: eloScores[c.prevId],
      }))
      await saveRound(eloScores['new'], null, updatedPrevious, comparisons)
    } catch (err) {
      setError(err.message)
      setStep('form')
    } finally {
      setLoading(false)
    }
  }

  // ── Core save function ────────────────────────────────────────────────────────
  async function saveRound(newEloScore, directRank, updatedPrevious = [], comparisons = []) {
    setUploading(!!photo)
    const photoUrl = await uploadPhoto()
    const overall  = ((conditions + value + vibes) / 3).toFixed(1)

    // 1. Insert the new round
    const { data: newRound, error: insertError } = await supabase
      .from('rounds')
      .insert({
        user_id:           user.id,
        course_id:         courseId,
        played_at:         playedAt,
        conditions_rating: conditions * 2,
        value_rating:      value * 2,
        vibes_rating:      vibes * 2,
        overall_rating:    parseFloat(((conditions + value + vibes) / 3 * 2).toFixed(1)),
        score:             score ? parseInt(score) : null,
        comment:           comment || null,
        photo_url:         photoUrl,
        elo_score:         newEloScore,
      })
      .select()
      .single()

    if (insertError) throw insertError

    // 2. Update Elo scores of compared rounds
    for (const prev of updatedPrevious) {
      await supabase.from('rounds').update({ elo_score: prev.elo_score }).eq('id', prev.id)
    }

    // 3. Save comparison history to elo_comparisons table
    for (const c of comparisons) {
      await supabase.from('elo_comparisons').insert({
        user_id:         user.id,
        winner_round_id: c.winnerId === 'new' ? newRound.id : c.winnerId,
        loser_round_id:  c.loserId  === 'new' ? newRound.id : c.loserId,
      })
    }

    // 4. Recalculate personal_rank for ALL of this user's rounds
    const { data: allRounds } = await supabase
      .from('rounds')
      .select('id, elo_score')
      .eq('user_id', user.id)
      .order('elo_score', { ascending: false })

    if (allRounds) {
      for (let i = 0; i < allRounds.length; i++) {
        await supabase.from('rounds').update({ personal_rank: i + 1 }).eq('id', allRounds[i].id)
      }
      const myRank = allRounds.findIndex(r => r.id === newRound.id) + 1
      setFinalRank(myRank)
    }

    // 5. Update community Elo on the course (average of all user Elo scores for this course)
    const { data: courseRounds } = await supabase
      .from('rounds')
      .select('elo_score')
      .eq('course_id', courseId)
    if (courseRounds && courseRounds.length > 0) {
      const avgElo = Math.round(courseRounds.reduce((s, r) => s + (r.elo_score || 1500), 0) / courseRounds.length)
      await supabase.from('courses').update({ community_elo: avgElo }).eq('id', courseId)
    }

    setSavedRound(newRound)
    if (onSuccess) onSuccess()
    setStep('success')
    setUploading(false)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 500, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
    >
      <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 540, maxHeight: '92vh', overflowY: 'auto', padding: '28px 24px 48px' }}>

        {/* ── SUCCESS ── */}
        {step === 'success' && (
          <SuccessScreen
            courseName={courseName}
            courseId={courseId}
            score={score || null}
            finalRank={finalRank}
            round={savedRound}
            course={{ id: courseId, name: courseName }}
            onClose={onClose}
            onViewFeed={() => { onClose(); navigate('/feed') }}
          />
        )}

        {/* ── ELO COMPARISON ── */}
        {step === 'elo' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button onClick={onClose}
                style={{ background: B.feedBg, border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', fontSize: 16, color: B.textMid }}>✕</button>
            </div>

            <EloComparison
              newCourseName={courseName}
              previousRounds={previousRounds}
              onComplete={handleEloComplete}
            />

            {loading && (
              <div style={{ textAlign: 'center', padding: '20px 0', fontFamily: sans, color: B.textSoft, fontSize: 13 }}>
                Calculating your rankings...
              </div>
            )}
          </div>
        )}

        {/* ── FORM ── */}
        {step === 'form' && (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
              <div>
                <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 900, color: B.textNavy, margin: '0 0 3px' }}>Log Your Round</h2>
                <p style={{ fontFamily: sans, fontSize: 13, color: B.textSoft, margin: 0 }}>{courseName}</p>
              </div>
              <button onClick={onClose}
                style={{ background: B.feedBg, border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', fontSize: 16, color: B.textMid, flexShrink: 0 }}>✕</button>
            </div>

            {error && (
              <div style={{ background: '#fde8e8', color: '#c00', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontFamily: sans, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleFormContinue}>

              {/* Score + Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: B.textMid, fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score</label>
                  <input value={score} onChange={e => setScore(e.target.value)} placeholder="e.g. 84" type="number" min="50" max="150" style={inputStyle}/>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: B.textMid, fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date Played</label>
                  <input value={playedAt} onChange={e => setPlayedAt(e.target.value)} type="date" style={inputStyle}/>
                </div>
              </div>

              {/* 3-Axis Emoji Ratings */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: B.textMid, fontFamily: sans, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
                  Rate Your Experience
                </div>

                {[
                  { label: '⛺ Course Conditions', val: conditions, setter: setConditions, color: B.green },
                  { label: '💰 Value for Money',    val: value,      setter: setValue,      color: B.navy  },
                  { label: '🏌️ Facilities & Vibes',  val: vibes,      setter: setVibes,      color: B.gold  },
                ].map(({ label, val, setter, color }) => (
                  <div key={label} style={{ marginBottom: 14, background: B.feedBg, borderRadius: 12, padding: '14px 16px', border: `1px solid ${B.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: B.textNavy, fontFamily: sans }}>{label}</span>
                      {val > 0 && <span style={{ fontSize: 20 }}>{EMOJIS[val]}</span>}
                    </div>
                    <EmojiPicker value={val} onChange={setter} color={color}/>
                    {val > 0 && (
                      <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: B.textSoft, fontFamily: sans, fontWeight: 600 }}>
                        {LABELS[val]}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Comment */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: B.textMid, fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Review <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                <textarea value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="How was the round? Any standout holes?" rows={3}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}/>
              </div>

              {/* Photo Upload */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: B.textMid, fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Photo <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                {photoPreview ? (
                  <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
                    <img src={photoPreview} alt="Round preview" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}/>
                    <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null) }}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', color: '#fff', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    style={{ width: '100%', border: `2px dashed ${B.border}`, borderRadius: 12, padding: '20px 0', background: B.feedBg, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 28 }}>📷</span>
                    <span style={{ fontSize: 13, color: B.textMid, fontFamily: sans, fontWeight: 600 }}>Add a photo of your round</span>
                    <span style={{ fontSize: 11, color: B.textSoft, fontFamily: sans }}>JPG or PNG · Max 10MB</span>
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoSelect} style={{ display: 'none' }}/>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || uploading || !conditions || !value || !vibes}
                style={{
                  width: '100%',
                  background: (!conditions || !value || !vibes) ? B.border : loading ? B.border : B.gold,
                  color: B.navy, border: 'none', borderRadius: 12, padding: '15px 0',
                  fontWeight: 800, fontSize: 15,
                  cursor: (!conditions || !value || !vibes) ? 'not-allowed' : 'pointer',
                  fontFamily: serif, transition: 'all 0.15s',
                }}
              >
                {loading ? 'Loading...' : uploading ? '📷 Uploading...' : !conditions || !value || !vibes ? 'Rate all 3 categories to continue' : 'Continue to Ranking →'}
              </button>

            </form>
          </>
        )}

      </div>
    </div>
  )
}