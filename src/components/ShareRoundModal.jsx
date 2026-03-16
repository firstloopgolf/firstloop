import { useState, useRef, useEffect } from 'react'
import { B, serif, sans } from '../lib/data.js'

// Safe rounded rect that works in all browsers
function roundRect(ctx, x, y, w, h, r) {
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
  ctx.fill()
}

export default function ShareRoundModal({ round, course, onClose }) {
  const canvasRef               = useRef(null)
  const [copied, setCopied]     = useState(false)
  const [imageUrl, setImageUrl] = useState(null)
  const [imgError, setImgError] = useState(false)

  const isMobile       = /iphone|ipad|ipod|android/i.test(navigator.userAgent)
  const hasNativeShare = !!navigator.share

  const shareText = `Just played ${course?.name}${round?.score ? ` — shot ${round.score}` : ''}! I rated it ${round?.overall_rating?.toFixed(1)}/10 on First Loop 🏌️ Rate, rank & discover golf courses at firstloop.vercel.app`
  const shareUrl  = `${window.location.origin}/course/${course?.id}`

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !round || !course) return

    try {
      const ctx = canvas.getContext('2d')
      const W = 600, H = 380
      canvas.width  = W
      canvas.height = H

      // ── Background ──────────────────────────────────────
      const bgColor = course.bg || B.navy
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, W, H)

      // Dark gradient overlay
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, 'rgba(0,0,0,0.05)')
      grad.addColorStop(1, 'rgba(0,0,0,0.4)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      // Header strip
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      ctx.fillRect(0, 0, W, 78)

      // ── Branding ─────────────────────────────────────────
      ctx.textAlign  = 'right'
      ctx.fillStyle  = B.gold
      ctx.font       = 'bold 13px sans-serif'
      ctx.fillText('FIRST LOOP', W - 22, 30)
      ctx.fillStyle  = 'rgba(240,232,213,0.45)'
      ctx.font       = '10px sans-serif'
      ctx.fillText('firstloop.vercel.app', W - 22, 50)
      ctx.textAlign  = 'left'

      // ── Course name ──────────────────────────────────────
      ctx.fillStyle = '#F0E8D5'
      let fontSize  = 20
      ctx.font      = `bold ${fontSize}px Georgia, serif`
      const maxNameW = W - 200
      while (ctx.measureText(course.name || '').width > maxNameW && fontSize > 13) {
        fontSize--
        ctx.font = `bold ${fontSize}px Georgia, serif`
      }
      ctx.fillText(course.name || '', 22, 34)

      ctx.fillStyle = 'rgba(240,232,213,0.55)'
      ctx.font      = '12px sans-serif'
      ctx.fillText(`📍 ${course.location || ''}`, 22, 58)

      // ── Section label ────────────────────────────────────
      ctx.fillStyle    = B.gold
      ctx.font         = 'bold 9px sans-serif'
      ctx.letterSpacing = '2px'
      ctx.fillText('MY ROUND', 22, 102)
      ctx.letterSpacing = '0px'

      // ── Score + My Rating + Course Rating boxes ──────────
      const hasScore = round.score != null
      const courseRating = course.rating || 0
      const boxY = 112
      const boxH = 86

      // Calculate box widths
      const totalBoxes = hasScore ? 3 : 2
      const boxW   = Math.floor((W - 22 - (totalBoxes - 1) * 12 - 22) / totalBoxes)
      const boxes  = []
      if (hasScore) boxes.push({ label: 'SCORE',        value: round.score,                    color: '#F0E8D5', isScore: true })
      boxes.push(    { label: 'MY RATING',   value: round.overall_rating?.toFixed(1), color: B.gold })
      boxes.push(    { label: 'COURSE AVG',  value: courseRating > 0 ? courseRating.toFixed(1) : '—', color: '#a8d8b0', sub: `${course.reviews || 0} reviews` })

      boxes.forEach((box, i) => {
        const bx = 22 + i * (boxW + 12)

        ctx.fillStyle = 'rgba(255,255,255,0.09)'
        roundRect(ctx, bx, boxY, boxW, boxH, 10)

        ctx.fillStyle  = box.color
        ctx.font       = `bold 40px Georgia, serif`
        ctx.textAlign  = 'center'
        ctx.fillText(box.value, bx + boxW / 2, boxY + 52)

        ctx.fillStyle    = 'rgba(240,232,213,0.45)'
        ctx.font         = 'bold 8px sans-serif'
        ctx.letterSpacing = '1px'
        ctx.fillText(box.label, bx + boxW / 2, boxY + 70)
        ctx.letterSpacing = '0px'

        if (box.sub) {
          ctx.fillStyle = 'rgba(240,232,213,0.3)'
          ctx.font      = '8px sans-serif'
          ctx.fillText(box.sub, bx + boxW / 2, boxY + 82)
        }

        ctx.textAlign = 'left'
      })

      // ── Rating bars ──────────────────────────────────────
      const barData = [
        ['CONDITIONS', round.conditions_rating, '#2a7a4a'],
        ['VALUE',      round.value_rating,      '#3a5a8a'],
        ['FACILITIES', round.vibes_rating,      B.gold],
      ].filter(([, v]) => v != null)

      const barStartY = boxY + boxH + 20

      barData.forEach(([label, value, color], i) => {
        const by = barStartY + i * 28

        ctx.fillStyle    = 'rgba(240,232,213,0.4)'
        ctx.font         = 'bold 8px sans-serif'
        ctx.letterSpacing = '1px'
        ctx.fillText(label, 22, by)
        ctx.letterSpacing = '0px'

        ctx.textAlign  = 'right'
        ctx.fillStyle  = 'rgba(240,232,213,0.85)'
        ctx.font       = 'bold 10px Georgia, serif'
        ctx.fillText(value.toFixed(1), W - 22, by)
        ctx.textAlign  = 'left'

        // Track background
        ctx.fillStyle = 'rgba(255,255,255,0.1)'
        roundRect(ctx, 22, by + 6, W - 44, 5, 2)

        // Filled track
        ctx.fillStyle = color
        roundRect(ctx, 22, by + 6, (W - 44) * (value / 10), 5, 2)
      })

      // ── Comment ──────────────────────────────────────────
      if (round.comment) {
        const cy = barStartY + barData.length * 28 + 14
        if (cy < H - 28) {
          ctx.fillStyle = 'rgba(240,232,213,0.5)'
          ctx.font      = 'italic 11px sans-serif'
          let comment   = `"${round.comment}"`
          while (ctx.measureText(comment).width > W - 44 && comment.length > 10) {
            comment = comment.slice(0, -4) + '..."'
          }
          ctx.fillText(comment, 22, cy)
        }
      }

      // ── Footer line ──────────────────────────────────────
      ctx.fillStyle = 'rgba(240,232,213,0.15)'
      ctx.fillRect(0, H - 32, W, 1)
      ctx.fillStyle  = 'rgba(240,232,213,0.25)'
      ctx.font       = '10px sans-serif'
      ctx.fillText('Rate · Rank · Discover', 22, H - 12)
      ctx.textAlign  = 'right'
      ctx.fillStyle  = B.gold
      ctx.font       = 'bold 10px Georgia, serif'
      ctx.fillText('FIRST LOOP', W - 22, H - 12)
      ctx.textAlign  = 'left'

      setImageUrl(canvas.toDataURL('image/png'))
      setImgError(false)

    } catch (err) {
      console.error('Canvas error:', err)
      setImgError(true)
    }
  }, [round, course])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  function downloadImage() {
    if (!imageUrl) return
    const a    = document.createElement('a')
    a.href     = imageUrl
    a.download = `firstloop-${(course?.name || 'round').replace(/\s+/g, '-').toLowerCase()}.png`
    a.click()
  }

  function shareTwitter() {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  function shareFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  async function nativeShare() {
    if (!canvasRef.current) return
    canvasRef.current.toBlob(async blob => {
      const file       = new File([blob], 'firstloop-round.png', { type: 'image/png' })
      const shareData  = { files: [file], text: shareText, url: shareUrl }
      try {
        if (navigator.canShare?.(shareData)) {
          await navigator.share(shareData)
        } else {
          await navigator.share({ title: 'First Loop', text: shareText, url: shareUrl })
        }
      } catch {}
    })
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:500, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:540, maxHeight:'92vh', overflowY:'auto', padding:'28px 24px 44px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <h2 style={{ fontFamily:serif, fontSize:20, fontWeight:900, color:B.textNavy, margin:'0 0 2px' }}>Share Your Round</h2>
            <p style={{ fontFamily:sans, fontSize:13, color:B.textSoft, margin:0 }}>{course?.name}</p>
          </div>
          <button onClick={onClose}
            style={{ background:B.feedBg, border:'none', borderRadius:'50%', width:34, height:34, cursor:'pointer', fontSize:16, color:B.textMid }}>✕</button>
        </div>

        {/* Hidden canvas */}
        <canvas ref={canvasRef} style={{ display:'none' }}/>

        {/* Card preview */}
        {imageUrl && !imgError ? (
          <div style={{ borderRadius:14, overflow:'hidden', marginBottom:20, boxShadow:'0 4px 20px rgba(0,0,0,0.15)' }}>
            <img src={imageUrl} alt="Round card" style={{ width:'100%', display:'block' }}/>
          </div>
        ) : imgError ? (
          <div style={{ background:B.feedBg, borderRadius:14, padding:'20px', textAlign:'center', marginBottom:20, border:`1px solid ${B.border}` }}>
            <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans }}>Card preview unavailable — sharing will still include your score and rating</div>
          </div>
        ) : (
          <div style={{ background:B.feedBg, borderRadius:14, padding:'20px', textAlign:'center', marginBottom:20, border:`1px solid ${B.border}` }}>
            <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans }}>Generating card...</div>
          </div>
        )}

        {/* Primary share button */}
        {isMobile && hasNativeShare ? (
          <button onClick={nativeShare}
            style={{ width:'100%', background:B.gold, color:B.navy, border:'none', borderRadius:12, padding:'15px 0', fontWeight:800, fontSize:16, cursor:'pointer', fontFamily:serif, marginBottom:12 }}>
            📤 Share Round Card
          </button>
        ) : (
          <button onClick={downloadImage}
            style={{ width:'100%', background:B.gold, color:B.navy, border:'none', borderRadius:12, padding:'15px 0', fontWeight:800, fontSize:16, cursor:'pointer', fontFamily:serif, marginBottom:12 }}>
            💾 Save Round Card
          </button>
        )}

        {/* Social + copy */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
          <button onClick={shareTwitter}
            style={{ background:'#000', color:'#fff', border:'none', borderRadius:12, padding:'13px 0', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:sans }}>
            𝕏 Post on X
          </button>
          <button onClick={shareFacebook}
            style={{ background:'#1877f2', color:'#fff', border:'none', borderRadius:12, padding:'13px 0', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:sans }}>
            📘 Facebook
          </button>
        </div>

        <button onClick={copyLink}
          style={{ width:'100%', background:copied ? '#e8f5e9' : B.feedBg, color:copied ? B.green : B.textNavy, border:`1px solid ${copied ? B.green : B.border}`, borderRadius:12, padding:'12px 0', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:sans, transition:'all 0.2s' }}>
          {copied ? '✅ Link Copied!' : '🔗 Copy Course Link'}
        </button>

        {!isMobile && (
          <p style={{ textAlign:'center', fontSize:11, color:B.textSoft, fontFamily:sans, margin:'12px 0 0', lineHeight:1.5 }}>
            Save the card image and attach it when posting on X or Instagram
          </p>
        )}

      </div>
    </div>
  )
}