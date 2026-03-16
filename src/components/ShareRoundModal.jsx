import { useState, useRef, useEffect } from 'react'
import { B, serif, sans } from '../lib/data.js'

export default function ShareRoundModal({ round, course, onClose }) {
  const cardRef                 = useRef(null)
  const [copied, setCopied]     = useState(false)
  const [saving,  setSaving]    = useState(false)

  const isMobile       = /iphone|ipad|ipod|android/i.test(navigator.userAgent)
  const hasNativeShare = !!navigator.share

  const myRating    = round?.overall_rating
  const courseAvg   = parseFloat(course?.rating) || 0
  const hasScore    = round?.score != null
  const shareText   = `Just played ${course?.name}${hasScore ? ` — shot ${round.score}` : ''}! I rated it ${myRating?.toFixed(1)}/10 on First Loop 🏌️ firstloop.vercel.app`
  const shareUrl    = `${window.location.origin}/course/${course?.id}`

  // Load html2canvas once
  useEffect(() => {
    if (window.html2canvas) return
    const s   = document.createElement('script')
    s.src     = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
    document.head.appendChild(s)
  }, [])

  async function getCardBlob() {
    if (!cardRef.current || !window.html2canvas) return null
    try {
      const canvas = await window.html2canvas(cardRef.current, {
        scale:           2,
        useCORS:         true,
        backgroundColor: null,
        logging:         false,
      })
      return await new Promise(res => canvas.toBlob(res, 'image/png'))
    } catch { return null }
  }

  async function downloadImage() {
    setSaving(true)
    const blob = await getCardBlob()
    setSaving(false)
    if (!blob) return
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = `firstloop-${(course?.name || 'round').replace(/\s+/g, '-').toLowerCase()}.png`
    a.click()
  }

  async function nativeShare() {
    setSaving(true)
    const blob = await getCardBlob()
    setSaving(false)
    const baseShare = { title: 'First Loop', text: shareText, url: shareUrl }
    try {
      if (blob) {
        const file      = new File([blob], 'firstloop-round.png', { type: 'image/png' })
        const withImage = { ...baseShare, files: [file] }
        if (navigator.canShare?.(withImage)) {
          await navigator.share(withImage); return
        }
      }
      await navigator.share(baseShare)
    } catch {}
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  function shareTwitter() {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  function shareFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const bg      = course?.bg_color || course?.bg || B.navy
  const barData = [
    { label: 'CONDITIONS', value: round?.conditions_rating, color: '#2a8a5a' },
    { label: 'VALUE',      value: round?.value_rating,      color: '#4a7ab0' },
    { label: 'FACILITIES', value: round?.vibes_rating,      color: '#C4963A' },
  ].filter(b => b.value != null)

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:500,
        display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', width:'100%',
        maxWidth:540, maxHeight:'92vh', overflowY:'auto', padding:'28px 24px 44px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <h2 style={{ fontFamily:serif, fontSize:20, fontWeight:900, color:B.textNavy, margin:'0 0 2px' }}>
              Share Your Round
            </h2>
            <p style={{ fontFamily:sans, fontSize:13, color:B.textSoft, margin:0 }}>{course?.name}</p>
          </div>
          <button onClick={onClose}
            style={{ background:B.feedBg, border:'none', borderRadius:'50%', width:34, height:34,
              cursor:'pointer', fontSize:16, color:B.textMid }}>✕</button>
        </div>

        {/* Card — rendered as HTML, screenshot by html2canvas */}
        <div ref={cardRef} style={{
          background:   bg,
          borderRadius: 14,
          overflow:     'hidden',
          marginBottom: 20,
          boxShadow:    '0 4px 20px rgba(0,0,0,0.2)',
        }}>
          {/* Top bar */}
          <div style={{ background:'rgba(0,0,0,0.28)', padding:'14px 18px',
            display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ flex:1, marginRight:12 }}>
              <div style={{ color:'#F0E8D5', fontWeight:700, fontSize:15,
                lineHeight:1.2, marginBottom:3, fontFamily:'Arial,sans-serif' }}>
                {course?.name}
              </div>
              <div style={{ color:'rgba(240,232,213,0.5)', fontSize:11, fontFamily:'Arial,sans-serif' }}>
                {course?.location}
              </div>
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{ color:'#C4963A', fontWeight:700, fontSize:11, fontFamily:'Arial,sans-serif' }}>
                FIRST LOOP
              </div>
              <div style={{ color:'rgba(240,232,213,0.35)', fontSize:9, marginTop:2, fontFamily:'Arial,sans-serif' }}>
                firstloop.vercel.app
              </div>
            </div>
          </div>

          <div style={{ padding:'14px 18px 12px' }}>
            {/* Section label */}
            <div style={{ color:'#C4963A', fontSize:9, fontWeight:700,
              marginBottom:10, fontFamily:'Arial,sans-serif', letterSpacing:'0.1em' }}>
              MY ROUND
            </div>

            {/* Score boxes */}
            <div style={{ display:'flex', gap:10, marginBottom:14 }}>
              {hasScore && (
                <div style={{ flex:1, background:'rgba(255,255,255,0.08)',
                  borderRadius:10, padding:'10px 8px', textAlign:'center' }}>
                  <div style={{ color:'#F0E8D5', fontSize:34, fontWeight:700,
                    lineHeight:1, fontFamily:'Georgia,serif' }}>
                    {round.score}
                  </div>
                  <div style={{ color:'rgba(240,232,213,0.4)', fontSize:8,
                    fontWeight:700, marginTop:6, fontFamily:'Arial,sans-serif' }}>
                    SCORE
                  </div>
                </div>
              )}
              <div style={{ flex:1, background:'rgba(255,255,255,0.08)',
                borderRadius:10, padding:'10px 8px', textAlign:'center' }}>
                <div style={{ color:'#C4963A', fontSize:34, fontWeight:700,
                  lineHeight:1, fontFamily:'Georgia,serif' }}>
                  {myRating?.toFixed(1) || '—'}
                </div>
                <div style={{ color:'rgba(240,232,213,0.4)', fontSize:8,
                  fontWeight:700, marginTop:6, fontFamily:'Arial,sans-serif' }}>
                  MY RATING
                </div>
              </div>
              <div style={{ flex:1, background:'rgba(255,255,255,0.08)',
                borderRadius:10, padding:'10px 8px', textAlign:'center' }}>
                <div style={{ color:'#88ddaa', fontSize:34, fontWeight:700,
                  lineHeight:1, fontFamily:'Georgia,serif' }}>
                  {courseAvg > 0 ? courseAvg.toFixed(1) : '—'}
                </div>
                <div style={{ color:'rgba(240,232,213,0.4)', fontSize:8,
                  fontWeight:700, marginTop:6, fontFamily:'Arial,sans-serif' }}>
                  COURSE AVG
                </div>
                {(course?.review_count > 0) && (
                  <div style={{ color:'rgba(240,232,213,0.25)', fontSize:7,
                    marginTop:2, fontFamily:'Arial,sans-serif' }}>
                    {course.review_count} reviews
                  </div>
                )}
              </div>
            </div>

            {/* Rating bars */}
            {barData.map(({ label, value, color }) => (
              <div key={label} style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ color:'rgba(240,232,213,0.45)', fontSize:8,
                    fontWeight:700, fontFamily:'Arial,sans-serif' }}>{label}</span>
                  <span style={{ color:'rgba(240,232,213,0.8)', fontSize:9,
                    fontWeight:700, fontFamily:'Arial,sans-serif' }}>{value.toFixed(1)}</span>
                </div>
                <div style={{ height:4, background:'rgba(255,255,255,0.1)', borderRadius:2 }}>
                  <div style={{ height:'100%', width:`${(value / 10) * 100}%`,
                    background:color, borderRadius:2 }}/>
                </div>
              </div>
            ))}

            {/* Comment */}
            {round?.comment && (
              <div style={{ marginTop:10, color:'rgba(240,232,213,0.5)', fontSize:10,
                fontStyle:'italic', lineHeight:1.4, fontFamily:'Arial,sans-serif',
                borderTop:'1px solid rgba(240,232,213,0.1)', paddingTop:8 }}>
                "{round.comment.length > 80 ? round.comment.slice(0, 80) + '…' : round.comment}"
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ borderTop:'1px solid rgba(240,232,213,0.1)', padding:'8px 18px',
            display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ color:'rgba(240,232,213,0.25)', fontSize:8, fontFamily:'Arial,sans-serif' }}>
              Rate · Rank · Discover
            </span>
            <span style={{ color:'#C4963A', fontSize:8, fontWeight:700, fontFamily:'Arial,sans-serif' }}>
              FIRST LOOP
            </span>
          </div>
        </div>

        {/* Primary action */}
        {isMobile && hasNativeShare ? (
          <button onClick={nativeShare} disabled={saving}
            style={{ width:'100%', background:B.gold, color:B.navy, border:'none',
              borderRadius:12, padding:'15px 0', fontWeight:800, fontSize:16,
              cursor:'pointer', fontFamily:serif, marginBottom:12, opacity:saving ? 0.7 : 1 }}>
            {saving ? 'Preparing...' : '📤 Share Round Card'}
          </button>
        ) : (
          <button onClick={downloadImage} disabled={saving}
            style={{ width:'100%', background:B.gold, color:B.navy, border:'none',
              borderRadius:12, padding:'15px 0', fontWeight:800, fontSize:16,
              cursor:'pointer', fontFamily:serif, marginBottom:12, opacity:saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : '💾 Save Round Card'}
          </button>
        )}

        {/* Social */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
          <button onClick={shareTwitter}
            style={{ background:'#000', color:'#fff', border:'none', borderRadius:12,
              padding:'13px 0', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:sans }}>
            𝕏 Post on X
          </button>
          <button onClick={shareFacebook}
            style={{ background:'#1877f2', color:'#fff', border:'none', borderRadius:12,
              padding:'13px 0', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:sans }}>
            📘 Facebook
          </button>
        </div>

        <button onClick={copyLink}
          style={{ width:'100%', background:copied ? '#e8f5e9' : B.feedBg,
            color:copied ? '#1E4530' : B.textNavy,
            border:`1px solid ${copied ? '#1E4530' : B.border}`,
            borderRadius:12, padding:'12px 0', fontWeight:600, fontSize:13,
            cursor:'pointer', fontFamily:sans, transition:'all 0.2s' }}>
          {copied ? '✅ Link Copied!' : '🔗 Copy Course Link'}
        </button>

        {!isMobile && (
          <p style={{ textAlign:'center', fontSize:11, color:B.textSoft,
            fontFamily:sans, margin:'12px 0 0', lineHeight:1.5 }}>
            Save the card and attach it when posting on X or Instagram
          </p>
        )}

      </div>
    </div>
  )
}
