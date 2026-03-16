import { useState, useRef, useEffect } from 'react'
import { B, serif, sans } from '../lib/data.js'

export default function ShareRoundModal({ round, course, onClose }) {
  const canvasRef             = useRef(null)
  const [copied, setCopied]   = useState(false)
  const [imageUrl, setImageUrl] = useState(null)
  const isMobile              = /iphone|ipad|ipod|android/i.test(navigator.userAgent)
  const hasNativeShare        = !!navigator.share

  const shareText = `Just logged a round at ${course?.name}${round?.score ? ` — shot ${round.score}` : ''}! Rated ${round?.overall_rating?.toFixed(1)}/10 on First Loop 🏌️ firstloop.vercel.app`
  const shareUrl  = `${window.location.origin}/course/${course?.id}`

  // Generate canvas card
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !round || !course) return
    const ctx = canvas.getContext('2d')
    const W = 600, H = 340
    canvas.width  = W
    canvas.height = H

    // Background
    ctx.fillStyle = course.bg || B.navy
    ctx.roundRect(0, 0, W, H, 20)
    ctx.fill()

    // Dark overlay
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, 'rgba(0,0,0,0.0)')
    grad.addColorStop(1, 'rgba(0,0,0,0.35)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // Header strip
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.roundRect(0, 0, W, 80, [20, 20, 0, 0])
    ctx.fill()

    // Branding top right
    ctx.fillStyle = B.gold
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('FIRST LOOP', W - 24, 32)
    ctx.fillStyle = 'rgba(240,232,213,0.5)'
    ctx.font = '10px sans-serif'
    ctx.fillText('firstloop.vercel.app', W - 24, 52)
    ctx.textAlign = 'left'

    // Course name
    ctx.fillStyle = '#F0E8D5'
    let fontSize = 22
    ctx.font = `bold ${fontSize}px Georgia, serif`
    while (ctx.measureText(course.name || '').width > W - 220 && fontSize > 14) {
      fontSize--
      ctx.font = `bold ${fontSize}px Georgia, serif`
    }
    ctx.fillText(course.name || '', 24, 36)
    ctx.fillStyle = 'rgba(240,232,213,0.6)'
    ctx.font = '13px sans-serif'
    ctx.fillText(`📍 ${course.location || ''}`, 24, 60)

    // Round logged label
    ctx.fillStyle = B.gold
    ctx.font = 'bold 9px sans-serif'
    ctx.letterSpacing = '2px'
    ctx.fillText('ROUND LOGGED', 24, 110)
    ctx.letterSpacing = '0px'

    // Score + rating boxes
    const hasScore = round.score != null
    const cardY = 125, cardH = 88
    const scoreW = hasScore ? 128 : 0
    const ratingX = hasScore ? 24 + scoreW + 14 : 24
    const ratingW = W - 24 - ratingX

    if (hasScore) {
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.roundRect(24, cardY, scoreW, cardH, 12)
      ctx.fill()
      ctx.fillStyle = '#F0E8D5'
      ctx.font = 'bold 46px Georgia, serif'
      ctx.textAlign = 'center'
      ctx.fillText(round.score, 24 + scoreW / 2, cardY + 55)
      ctx.fillStyle = 'rgba(240,232,213,0.45)'
      ctx.font = 'bold 9px sans-serif'
      ctx.letterSpacing = '1px'
      ctx.fillText('SCORE', 24 + scoreW / 2, cardY + 76)
      ctx.letterSpacing = '0px'
    }

    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.roundRect(ratingX, cardY, ratingW, cardH, 12)
    ctx.fill()
    ctx.fillStyle = B.gold
    ctx.font = 'bold 46px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText(round.overall_rating?.toFixed(1) || '—', ratingX + ratingW / 2, cardY + 55)
    ctx.fillStyle = 'rgba(240,232,213,0.45)'
    ctx.font = 'bold 9px sans-serif'
    ctx.letterSpacing = '1px'
    ctx.fillText('OVERALL', ratingX + ratingW / 2, cardY + 76)
    ctx.letterSpacing = '0px'
    ctx.textAlign = 'left'

    // Rating bars
    const barData = [
      ['CONDITIONS', round.conditions_rating, '#1E4530'],
      ['VALUE',      round.value_rating,      '#1B3054'],
      ['FACILITIES', round.vibes_rating,      B.gold],
    ].filter(([, v]) => v != null)

    barData.forEach(([label, value, color], i) => {
      const by = 234 + i * 26
      ctx.fillStyle = 'rgba(240,232,213,0.45)'
      ctx.font = 'bold 8px sans-serif'
      ctx.letterSpacing = '1px'
      ctx.fillText(label, 24, by - 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = 'rgba(240,232,213,0.85)'
      ctx.font = 'bold 10px Georgia, serif'
      ctx.fillText(value.toFixed(1), W - 24, by - 2)
      ctx.textAlign = 'left'
      ctx.letterSpacing = '0px'
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      ctx.roundRect(24, by + 4, W - 48, 5, 2)
      ctx.fill()
      ctx.fillStyle = color
      ctx.roundRect(24, by + 4, (W - 48) * (value / 10), 5, 2)
      ctx.fill()
    })

    // Comment
    if (round.comment) {
      const cy = 234 + barData.length * 26 + 10
      if (cy < H - 20) {
        ctx.fillStyle = 'rgba(240,232,213,0.55)'
        ctx.font = 'italic 11px sans-serif'
        let comment = `"${round.comment}"`
        while (ctx.measureText(comment).width > W - 48 && comment.length > 10) {
          comment = comment.slice(0, -4) + '..."'
        }
        ctx.fillText(comment, 24, cy)
      }
    }

    setImageUrl(canvas.toDataURL('image/png'))
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
      const file = new File([blob], 'firstloop-round.png', { type: 'image/png' })
      const shareData = { files: [file], text: shareText, url: shareUrl }
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
        {imageUrl && (
          <div style={{ borderRadius:14, overflow:'hidden', marginBottom:20, boxShadow:'0 4px 20px rgba(0,0,0,0.15)' }}>
            <img src={imageUrl} alt="Round card" style={{ width:'100%', display:'block' }}/>
          </div>
        )}

        {/* Mobile — native share is primary */}
        {isMobile && hasNativeShare && (
          <button onClick={nativeShare}
            style={{ width:'100%', background:B.gold, color:B.navy, border:'none', borderRadius:12, padding:'15px 0', fontWeight:800, fontSize:16, cursor:'pointer', fontFamily:serif, marginBottom:12 }}>
            📤 Share Round Card
          </button>
        )}

        {/* Desktop — download is primary */}
        {!isMobile && (
          <button onClick={downloadImage}
            style={{ width:'100%', background:B.gold, color:B.navy, border:'none', borderRadius:12, padding:'15px 0', fontWeight:800, fontSize:16, cursor:'pointer', fontFamily:serif, marginBottom:12 }}>
            💾 Download Round Card
          </button>
        )}

        {/* Social buttons */}
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

        {/* Copy link */}
        <button onClick={copyLink}
          style={{ width:'100%', background:copied ? '#e8f5e9' : B.feedBg, color:copied ? B.green : B.textNavy, border:`1px solid ${copied ? B.green : B.border}`, borderRadius:12, padding:'12px 0', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:sans, transition:'all 0.2s' }}>
          {copied ? '✅ Link Copied!' : '🔗 Copy Course Link'}
        </button>

        {/* Desktop hint */}
        {!isMobile && (
          <p style={{ textAlign:'center', fontSize:11, color:B.textSoft, fontFamily:sans, margin:'12px 0 0', lineHeight:1.5 }}>
            Download the card image and attach it when posting on X or Instagram
          </p>
        )}

      </div>
    </div>
  )
}