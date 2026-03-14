import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { B, serif, sans } from '../lib/data.js'

function StarPicker({ value, onChange, color }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[2, 4, 6, 8, 10].map(v => (
        <button key={v} type="button" onClick={() => onChange(v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, opacity: value >= v ? 1 : 0.25, transition: 'opacity 0.1s', color }}>
          ★
        </button>
      ))}
    </div>
  )
}

export default function LogRoundModal({ courseId, courseName, onClose, onSuccess }) {
  const { user } = useAuth()

  const [score, setScore]           = useState('')
  const [conditions, setConditions] = useState(0)
  const [value, setValue]           = useState(0)
  const [vibes, setVibes]           = useState(0)
  const [comment, setComment]       = useState('')
  const [playedAt, setPlayedAt]     = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const overall = conditions && value && vibes
    ? ((conditions + value + vibes) / 3).toFixed(1)
    : null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!conditions || !value || !vibes) { setError('Please rate all three categories'); return }
    setLoading(true)
    setError('')
    try {
      const { error: err } = await supabase.from('rounds').insert({
        user_id:            user.id,
        course_id:          courseId,
        score:              score ? parseInt(score) : null,
        conditions_rating:  conditions,
        value_rating:       value,
        vibes_rating:       vibes,
        overall_rating:     parseFloat(overall),
        comment:            comment || null,
        played_at:          playedAt,
      })
      if (err) throw err
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 13px', borderRadius: 10, border: `1px solid ${B.border}`,
    fontSize: 14, fontFamily: sans, color: B.textNavy, outline: 'none',
    background: '#fff', boxSizing: 'border-box',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 500, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', padding: '28px 24px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 900, color: B.textNavy, margin: '0 0 2px' }}>Log Your Round</h2>
            <p style={{ fontFamily: sans, fontSize: 13, color: B.textSoft, margin: 0 }}>{courseName}</p>
          </div>
          <button onClick={onClose} style={{ background: B.feedBg, border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', fontSize: 16, color: B.textMid }}>✕</button>
        </div>

        {error && (
          <div style={{ background: '#fde8e8', color: '#c00', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontFamily: sans, marginBottom: 16 }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Score + Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: B.textMid, fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</label>
              <input value={score} onChange={e => setScore(e.target.value)} placeholder="e.g. 84" type="number" min="50" max="150" style={inputStyle}/>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: B.textMid, fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Played</label>
              <input value={playedAt} onChange={e => setPlayedAt(e.target.value)} type="date" style={inputStyle}/>
            </div>
          </div>

          {/* Ratings */}
          {[['Course Conditions', conditions, setConditions, B.green],
            ['Value for Money',   value,      setValue,      B.navy],
            ['Facilities & Vibes',vibes,      setVibes,      B.gold]].map(([label, val, setter, color]) => (
            <div key={label} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: B.textNavy, fontFamily: sans }}>{label}</label>
                {val > 0 && <span style={{ fontSize: 15, fontWeight: 800, color, fontFamily: serif }}>{val}.0</span>}
              </div>
              <StarPicker value={val} onChange={setter} color={color}/>
            </div>
          ))}

          {/* Overall preview */}
          {overall && (
            <div style={{ background: B.feedBg, borderRadius: 12, padding: '14px 16px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${B.border}` }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: B.textMid, fontFamily: sans }}>Overall Rating</span>
              <span style={{ fontSize: 24, fontWeight: 900, color: B.gold, fontFamily: serif }}>{overall}</span>
            </div>
          )}

          {/* Comment */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: B.textMid, fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Comment (optional)</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="How was the round? Any standout holes?" rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}/>
          </div>

          <button type="submit" disabled={loading}
            style={{ width: '100%', background: loading ? B.border : B.gold, color: B.navy, border: 'none', borderRadius: 12, padding: '14px 0', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: serif }}>
            {loading ? 'Saving...' : 'Save Round ⛳'}
          </button>
        </form>
      </div>
    </div>
  )
}
