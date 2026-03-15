import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { B, serif, sans } from '../lib/data.js'

function HalfStarPicker({ value, onChange, color }) {
  const [hovered, setHovered] = useState(null)
  const display = hovered !== null ? hovered : value

  return (
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5,6,7,8,9,10].map(v => {
        const isLeft  = v % 2 !== 0
        const starNum = Math.ceil(v / 2)
        const filled  = display >= v
        return (
          <div
            key={v}
            onMouseEnter={() => setHovered(v)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onChange(v)}
            style={{
              width: isLeft ? 14 : 14,
              height: 28,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isLeft ? 'flex-end' : 'flex-start',
              overflow: 'hidden',
            }}
          >
            <svg
              width="28" height="28" viewBox="0 0 24 24"
              style={{
                flexShrink: 0,
                marginLeft: isLeft ? 0 : -14,
                marginRight: isLeft ? -14 : 0,
              }}
              fill={filled ? color : '#E8E0D0'}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        )
      })}
    </div>
  )
}

function SuccessScreen({ courseName, score, overall, onClose, onViewFeed }) {
  return (
    <div style={{ textAlign:'center', padding:'20px 0' }}>
      {/* Animated checkmark */}
      <div style={{ width:72, height:72, borderRadius:'50%', background:'#e8f5e9', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={B.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <h2 style={{ fontFamily:serif, fontSize:22, fontWeight:900, color:B.textNavy, margin:'0 0 8px' }}>Round Logged!</h2>
      <p style={{ fontFamily:sans, fontSize:14, color:B.textSoft, margin:'0 0 28px', lineHeight:1.6 }}>
        Your round at <strong style={{ color:B.textNavy }}>{courseName}</strong> has been saved and added to the community feed.
      </p>

      {/* Round summary card */}
      <div style={{ background:B.feedBg, borderRadius:16, padding:'20px 24px', marginBottom:28, border:`1px solid ${B.border}` }}>
        <div style={{ display:'grid', gridTemplateColumns: score ? '1fr 1fr' : '1fr', gap:16 }}>
          {score && (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:36, fontWeight:900, color:B.navy, fontFamily:serif, lineHeight:1 }}>{score}</div>
              <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans, marginTop:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Score</div>
            </div>
          )}
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:36, fontWeight:900, color:B.gold, fontFamily:serif, lineHeight:1 }}>{overall}</div>
            <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans, marginTop:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Overall Rating</div>
          </div>
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <button onClick={onViewFeed}
          style={{ width:'100%', background:B.navy, color:B.cream, border:'none', borderRadius:12, padding:'13px 0', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:sans }}>
          View in Community Feed
        </button>
        <button onClick={onClose}
          style={{ width:'100%', background:B.gold, color:B.navy, border:'none', borderRadius:12, padding:'13px 0', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:serif }}>
          Done
        </button>
      </div>
    </div>
  )
}

export default function LogRoundModal({ courseId, courseName, onClose, onSuccess }) {
  const { user } = useAuth()

  const [step, setStep]           = useState('form') // 'form' | 'success'
  const [score, setScore]         = useState('')
  const [conditions, setConditions] = useState(0)
  const [value, setValue]         = useState(0)
  const [vibes, setVibes]         = useState(0)
  const [comment, setComment]     = useState('')
  const [playedAt, setPlayedAt]   = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const overall = conditions && value && vibes
    ? ((conditions + value + vibes) / 3).toFixed(1)
    : null

  const inputStyle = {
    width:'100%', padding:'11px 13px', borderRadius:10,
    border:`1px solid ${B.border}`, fontSize:14, fontFamily:sans,
    color:B.textNavy, outline:'none', background:'#fff',
    boxSizing:'border-box',
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!conditions || !value || !vibes) {
      setError('Please rate all three categories')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { error: err } = await supabase.from('rounds').insert({
        user_id:           user.id,
        course_id:         courseId,
        score:             score ? parseInt(score) : null,
        conditions_rating: conditions,
        value_rating:      value,
        vibes_rating:      vibes,
        overall_rating:    parseFloat(overall),
        comment:           comment || null,
        played_at:         playedAt,
      })
      if (err) throw err
      onSuccess()
      setStep('success')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const ratingLabel = (v) => {
    if (!v) return ''
    if (v <= 2)  return 'Poor'
    if (v <= 4)  return 'Below Average'
    if (v <= 6)  return 'Average'
    if (v <= 7)  return 'Good'
    if (v <= 8)  return 'Great'
    if (v <= 9)  return 'Excellent'
    return 'World Class'
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:500, display:'flex', alignItems:'flex-end', justifyContent:'center' }}
    >
      <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:540, maxHeight:'92vh', overflowY:'auto', padding:'28px 24px 48px' }}>

        {step === 'success' ? (
          <SuccessScreen
            courseName={courseName}
            score={score || null}
            overall={overall}
            onClose={onClose}
            onViewFeed={() => { onClose(); window.location.href = '/feed' }}
          />
        ) : (
          <>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:22 }}>
              <div>
                <h2 style={{ fontFamily:serif, fontSize:20, fontWeight:900, color:B.textNavy, margin:'0 0 3px' }}>Log Your Round</h2>
                <p style={{ fontFamily:sans, fontSize:13, color:B.textSoft, margin:0 }}>{courseName}</p>
              </div>
              <button onClick={onClose}
                style={{ background:B.feedBg, border:'none', borderRadius:'50%', width:34, height:34, cursor:'pointer', fontSize:16, color:B.textMid, flexShrink:0 }}>
                ✕
              </button>
            </div>

            {error && (
              <div style={{ background:'#fde8e8', color:'#c00', borderRadius:8, padding:'10px 14px', fontSize:13, fontFamily:sans, marginBottom:16 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Score + Date row */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:22 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:B.textMid, fontFamily:sans, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                    Score
                  </label>
                  <input
                    value={score}
                    onChange={e => setScore(e.target.value)}
                    placeholder="e.g. 84"
                    type="number" min="50" max="150"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:B.textMid, fontFamily:sans, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                    Date Played
                  </label>
                  <input
                    value={playedAt}
                    onChange={e => setPlayedAt(e.target.value)}
                    type="date"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Half-star rating pickers */}
              <div style={{ display:'flex', flexDirection:'column', gap:18, marginBottom:20 }}>
                {[
                  ['⛺ Course Conditions', conditions, setConditions, B.green],
                  ['💰 Value for Money',   value,      setValue,      B.navy],
                  ['🏌️ Facilities', vibes,    setVibes,      B.gold],
                ].map(([label, val, setter, color]) => (
                  <div key={label}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <label style={{ fontSize:13, fontWeight:600, color:B.textNavy, fontFamily:sans }}>{label}</label>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        {val > 0 && (
                          <>
                            <span style={{ fontSize:15, fontWeight:800, color, fontFamily:serif }}>{val}.0</span>
                            <span style={{ fontSize:11, color:B.textSoft, fontFamily:sans }}>· {ratingLabel(val)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <HalfStarPicker value={val} onChange={setter} color={color}/>
                    {/* Rating scale labels */}
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                      <span style={{ fontSize:10, color:B.textSoft, fontFamily:sans }}>Poor</span>
                      <span style={{ fontSize:10, color:B.textSoft, fontFamily:sans }}>World Class</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall preview */}
              {overall && (
                <div style={{ background:B.feedBg, borderRadius:12, padding:'14px 18px', marginBottom:18, border:`1px solid ${B.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:B.textMid, fontFamily:sans, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:2 }}>Overall Rating</div>
                    <div style={{ fontSize:11, color:B.textSoft, fontFamily:sans }}>Average of all three scores</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:32, fontWeight:900, color:B.gold, fontFamily:serif, lineHeight:1 }}>{overall}</div>
                    <div style={{ fontSize:11, color:B.textSoft, fontFamily:sans }}>{ratingLabel(parseFloat(overall))}</div>
                  </div>
                </div>
              )}

              {/* Comment */}
              <div style={{ marginBottom:22 }}>
                <label style={{ fontSize:11, fontWeight:700, color:B.textMid, fontFamily:sans, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                  Review <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0 }}>(optional)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="How was the round? Any standout holes? Would you recommend it?"
                  rows={3}
                  style={{ ...inputStyle, resize:'vertical', lineHeight:1.6 }}
                />
                <div style={{ textAlign:'right', marginTop:4 }}>
                  <span style={{ fontSize:11, color: comment.length > 280 ? '#c00' : B.textSoft, fontFamily:sans }}>{comment.length}/300</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !conditions || !value || !vibes}
                style={{
                  width:'100%',
                  background: (!conditions || !value || !vibes) ? B.border : loading ? B.border : B.gold,
                  color:B.navy, border:'none', borderRadius:12, padding:'15px 0',
                  fontWeight:800, fontSize:15, cursor: (!conditions || !value || !vibes) ? 'not-allowed' : loading ? 'not-allowed' : 'pointer',
                  fontFamily:serif, transition:'all 0.15s',
                }}
              >
                {loading ? 'Saving...' : !conditions || !value || !vibes ? 'Rate all 3 categories to continue' : 'Save Round ⛳'}
              </button>

            </form>
          </>
        )}
      </div>
    </div>
  )
}