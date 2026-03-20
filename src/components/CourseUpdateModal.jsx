import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'

const PRICE_OPTIONS = ['$', '$$', '$$$', '$$$$']
const HOLES_OPTIONS = ['9', '18', '27', '36']

export default function CourseUpdateModal({ course, onClose }) {
  const { B, serif, sans } = useTheme()
  const { user } = useAuth()

  const [icon,        setIcon]        = useState(course.icon || '')
  const [description, setDescription] = useState(course.description || '')
  const [par,         setPar]         = useState(course.par || '')
  const [holes,       setHoles]       = useState(String(course.holes || 18))
  const [price,       setPrice]       = useState(course.price || '')
  const [website,     setWebsite]     = useState(course.website || '')
  const [notes,       setNotes]       = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [done,        setDone]        = useState(false)
  const [error,       setError]       = useState('')

  const inputStyle = {
    width: '100%', padding: '11px 13px', borderRadius: 10,
    border: `1px solid ${B.border}`, fontSize: 14, fontFamily: sans,
    color: B.textNavy, outline: 'none', background: B.white,
    boxSizing: 'border-box',
  }

  const labelStyle = {
    fontSize: 11, fontWeight: 700, color: B.textMid, fontFamily: sans,
    display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em',
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const { error: err } = await supabase.from('course_update_requests').insert({
      course_id:    course.id,
      submitted_by: user.id,
      icon:         icon || null,
      description:  description || null,
      par:          par ? parseInt(par) : null,
      holes:        holes ? parseInt(holes) : null,
      price:        price || null,
      website:      website || null,
      notes:        notes || null,
    })

    if (err) { setError(err.message); setSubmitting(false); return }
    setDone(true)
    setSubmitting(false)
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 500, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: B.white, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Handle */}
        <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: B.border }}/>
        </div>

        <div style={{ padding: '16px 24px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 900, color: B.textNavy, margin: 0 }}>Suggest an Update</h2>
            <button onClick={onClose} style={{ background: B.feedBg, border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: B.textMid }}>✕</button>
          </div>
          <p style={{ fontFamily: sans, fontSize: 13, color: B.textSoft, margin: '0 0 20px' }}>
            For <strong style={{ color: B.textNavy }}>{course.name}</strong> — your suggestion will be reviewed before going live.
          </p>

          {done ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🙏</div>
              <div style={{ fontFamily: serif, fontSize: 18, fontWeight: 900, color: B.textNavy, marginBottom: 8 }}>Thanks for the update!</div>
              <div style={{ fontFamily: sans, fontSize: 13, color: B.textSoft, marginBottom: 24 }}>We'll review your suggestion and apply it if correct.</div>
              <button onClick={onClose}
                style={{ background: B.gold, color: B.navy, border: 'none', borderRadius: 12, padding: '12px 32px', fontWeight: 700, cursor: 'pointer', fontFamily: serif }}>
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ background: '#fde8e8', color: '#c00', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontFamily: sans, marginBottom: 16 }}>
                  {error}
                </div>
              )}

              {/* Emoji */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Course Emoji / Icon</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: course.bg || B.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                    {icon || course.icon || '⛳'}
                  </div>
                  <input value={icon} onChange={e => setIcon(e.target.value)}
                    placeholder="e.g. 🌊 or ⛰️" style={{ ...inputStyle }} maxLength={4}/>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Course Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="A short sentence describing the course..."
                  rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}/>
              </div>

              {/* Par + Holes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Par</label>
                  <select value={par} onChange={e => setPar(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">No change</option>
                    {[70,71,72,73].map(p => <option key={p} value={p}>Par {p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Holes</label>
                  <select value={holes} onChange={e => setHoles(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {HOLES_OPTIONS.map(h => <option key={h} value={h}>{h} Holes</option>)}
                  </select>
                </div>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Price Range</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {PRICE_OPTIONS.map(p => (
                    <button key={p} type="button" onClick={() => setPrice(price === p ? '' : p)}
                      style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: `1.5px solid ${price === p ? B.gold : B.border}`, background: price === p ? B.goldPale : B.white, color: price === p ? B.navy : B.textMid, fontWeight: 700, cursor: 'pointer', fontFamily: sans, fontSize: 13, transition: 'all 0.12s' }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Website */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Course Website</label>
                <input value={website} onChange={e => setWebsite(e.target.value)}
                  placeholder="https://www.coursename.com" type="url" style={inputStyle}/>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Additional Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Anything else we should know about this correction..."
                  rows={2} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}/>
              </div>

              <button type="submit" disabled={submitting}
                style={{ width: '100%', background: submitting ? B.border : B.gold, color: B.navy, border: 'none', borderRadius: 12, padding: '14px 0', fontWeight: 800, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: serif, transition: 'all 0.15s' }}>
                {submitting ? 'Submitting...' : 'Submit Update Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}