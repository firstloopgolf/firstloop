import { useState, useRef, useEffect } from 'react'
import { B, serif, sans } from '../lib/data.js'

export default function ShareRoundModal({ round, course, onClose }) {
  const canvasRef              = useRef(null)
  const [copied, setCopied]    = useState(false)
  const [saving, setSaving]    = useState(false)

  const isMobile       = /iphone|ipad|ipod|android/i.test(navigator.userAgent)
  const hasNativeShare = !!navigator.share

  const myRating  = round?.overall_rating != null ? parseFloat(round.overall_rating) : null
  const courseAvg = parseFloat(course?.rating) || 0
  const hasScore  = round?.score != null
  const shareText = `Just played ${course?.name}${hasScore ? ` — shot ${round.score}` : ''}! I rated it ${myRating?.toFixed(1)}/10 on First Loop 🏌️ firstloop.vercel.app`
  const shareUrl = `https://firstloopgolf.com/course/${course?.id}`

  const bgColor = course?.bg_color || course?.bg || B.navy

  const barData = [
    { label: 'CONDITIONS', value: round?.conditions_rating, color: '#2a8a5a' },
    { label: 'VALUE',      value: round?.value_rating,      color: '#4a7ab0' },
    { label: 'FACILITIES', value: round?.vibes_rating,      color: '#C4963A' },
  ].filter(b => b.value != null).map(b => ({ ...b, value: parseFloat(b.value) }))

  useEffect(() => { drawCard() }, [round, course])

  // ── Canvas helpers ──────────────────────────────────────────────
  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  function drawCard() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 400, H = 270

    // 2× for retina
    canvas.width  = W * 2
    canvas.height = H * 2
    canvas.style.width    = '100%'
    canvas.style.maxWidth = W + 'px'
    canvas.style.height   = 'auto'
    ctx.scale(2, 2)

    // Background
    ctx.fillStyle = bgColor
    rrect(ctx, 0, 0, W, H, 14)
    ctx.fill()

    // Top bar overlay (clipped to rounded rect)
    ctx.save()
    rrect(ctx, 0, 0, W, H, 14)
    ctx.clip()
    ctx.fillStyle = 'rgba(0,0,0,0.28)'
    ctx.fillRect(0, 0, W, 48)
    ctx.restore()

    ctx.textBaseline = 'top'

    // Course name
    ctx.fillStyle = '#F0E8D5'
    ctx.font = 'bold 15px Arial, sans-serif'
    const name = course?.name || ''
    ctx.fillText(name.length > 32 ? name.slice(0, 32) + '…' : name, 18, 14)

    // Location
    ctx.fillStyle = 'rgba(240,232,213,0.5)'
    ctx.font = '11px Arial, sans-serif'
    const loc = course?.location || ''
    ctx.fillText(loc.length > 36 ? loc.slice(0, 36) + '…' : loc, 18, 32)

    // FIRST LOOP (right-aligned)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#C4963A'
    ctx.font = 'bold 11px Arial, sans-serif'
    ctx.fillText('FIRST LOOP', W - 18, 14)
    ctx.fillStyle = 'rgba(240,232,213,0.35)'
    ctx.font = '9px Arial, sans-serif'
    ctx.fillText('firstloop.vercel.app', W - 18, 28)
    ctx.textAlign = 'left'

    // MY ROUND label
    ctx.fillStyle = '#C4963A'
    ctx.font = 'bold 9px Arial, sans-serif'
    ctx.fillText('MY  ROUND', 18, 58)

    // Score / rating boxes
    const boxes = []
    if (hasScore) boxes.push({ val: String(round.score), label: 'SCORE', color: '#F0E8D5' })
    boxes.push({ val: myRating != null ? myRating.toFixed(1) : '—', label: 'MY RATING', color: '#C4963A' })
    boxes.push({ val: courseAvg > 0 ? courseAvg.toFixed(1) : '—', label: 'COURSE AVG', color: '#88ddaa' })

    const boxY = 70, boxH = 60, boxGap = 10
    const bW   = (W - 36 - (boxes.length - 1) * boxGap) / boxes.length

    boxes.forEach((box, i) => {
      const bX = 18 + i * (bW + boxGap)
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      rrect(ctx, bX, boxY, bW, boxH, 10)
      ctx.fill()

      ctx.fillStyle  = box.color
      ctx.font       = 'bold 28px Georgia, serif'
      ctx.textAlign  = 'center'
      ctx.fillText(box.val, bX + bW / 2, boxY + 8)

      ctx.fillStyle = 'rgba(240,232,213,0.4)'
      ctx.font      = 'bold 8px Arial, sans-serif'
      ctx.fillText(box.label, bX + bW / 2, boxY + 47)
      ctx.textAlign = 'left'
    })

    // Rating bars
    let barsY = 143
    barData.forEach(({ label, value, color }) => {
      ctx.fillStyle = 'rgba(240,232,213,0.45)'
      ctx.font = 'bold 8px Arial, sans-serif'
      ctx.fillText(label, 18, barsY)

      ctx.fillStyle = 'rgba(240,232,213,0.8)'
      ctx.font = 'bold 9px Arial, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(value.toFixed(1), W - 18, barsY)
      ctx.textAlign = 'left'

      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      rrect(ctx, 18, barsY + 12, W - 36, 4, 2)
      ctx.fill()

      ctx.fillStyle = color
      rrect(ctx, 18, barsY + 12, Math.max((W - 36) * (value / 10), 4), 4, 2)
      ctx.fill()

      barsY += 24
    })

    // Comment
    if (round?.comment) {
      const cy = barsY + 6
      ctx.strokeStyle = 'rgba(240,232,213,0.1)'
      ctx.lineWidth   = 1
      ctx.beginPath(); ctx.moveTo(18, cy); ctx.lineTo(W - 18, cy); ctx.stroke()
      ctx.fillStyle    = 'rgba(240,232,213,0.5)'
      ctx.font         = 'italic 10px Arial, sans-serif'
      const c = round.comment.length > 80 ? round.comment.slice(0, 80) + '…' : round.comment
      ctx.fillText(`"${c}"`, 18, cy + 6)
    }

    // Footer
    const footerY = H - 24
    ctx.strokeStyle = 'rgba(240,232,213,0.1)'
    ctx.lineWidth   = 1
    ctx.beginPath(); ctx.moveTo(0, footerY); ctx.lineTo(W, footerY); ctx.stroke()

    ctx.fillStyle    = 'rgba(240,232,213,0.25)'
    ctx.font         = '8px Arial, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.fillText('Rate · Rank · Discover', 18, footerY + 12)

    ctx.fillStyle = '#C4963A'
    ctx.font      = 'bold 8px Arial, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('FIRST LOOP', W - 18, footerY + 12)
  }

  // ── Share actions ───────────────────────────────────────────────
  async function getCardBlob() {
    const canvas = canvasRef.current
    if (!canvas) return null
    return new Promise(res => canvas.toBlob(res, 'image/png'))
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
        if (navigator.canShare?.(withImage)) { await navigator.share(withImage); return }
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

  async function shareFacebook() {
    // Facebook's sharer no longer accepts pre-filled text, so we copy it to clipboard first
    try { await navigator.clipboard.writeText(shareText) } catch {}
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  async function shareInstagram() {
    setSaving(true)
    const blob = await getCardBlob()
    setSaving(false)
    if (!blob) return

    // Mobile: native share sheet lets user pick Instagram directly
    if (isMobile && hasNativeShare) {
      const file = new File([blob], 'firstloop-round.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: 'First Loop', text: shareText }); return } catch {}
      }
    }

    // Desktop: download the card then open Instagram
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = `firstloop-${(course?.name || 'round').replace(/\s+/g, '-').toLowerCase()}.png`
    a.click()
    setTimeout(() => window.open('https://www.instagram.com', '_blank'), 400)
  }

  // ── Render ──────────────────────────────────────────────────────
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

        {/* Card — drawn via Canvas 2D API, no html2canvas */}
        <canvas ref={canvasRef}
          style={{ display:'block', borderRadius:14, boxShadow:'0 4px 20px rgba(0,0,0,0.2)',
            marginBottom:20, width:'100%', maxWidth:400 }}
        />

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
            {saving ? 'Saving...' : '💾 Download Round Card'}
          </button>
        )}

        {/* Social */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:10 }}>
          <button onClick={shareTwitter}
            style={{ background:'#000', color:'#fff', border:'none', borderRadius:12,
              padding:'13px 0', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:sans }}>
            𝕏 Post
          </button>
          <button onClick={shareFacebook}
            style={{ background:'#1877f2', color:'#fff', border:'none', borderRadius:12,
              padding:'13px 0', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:sans }}>
            📘 Facebook
          </button>
          <button onClick={shareInstagram} disabled={saving}
            style={{ background:'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
              color:'#fff', border:'none', borderRadius:12,
              padding:'13px 0', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:sans,
              opacity: saving ? 0.7 : 1 }}>
            📸 Instagram
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

        <p style={{ textAlign:'center', fontSize:11, color:B.textSoft,
          fontFamily:sans, margin:'12px 0 0', lineHeight:1.5 }}>
          Facebook: post text is copied to your clipboard — paste it in your post.{' '}
          Instagram: card downloads automatically.
        </p>

      </div>
    </div>
  )
}
