import { useState, useRef, useEffect } from 'react'
import { B, serif, sans } from '../lib/data.js'

export default function ShareRoundModal({ round, course, onClose }) {
  const canvasRef               = useRef(null)
  const [copied, setCopied]     = useState(false)
  const [imageUrl, setImageUrl] = useState(null)

  const isMobile       = /iphone|ipad|ipod|android/i.test(navigator.userAgent)
  const hasNativeShare = !!navigator.share

  const shareText = `Just played ${course?.name}${round?.score ? ` — shot ${round.score}` : ''}! I rated it ${round?.overall_rating?.toFixed(1)}/10 on First Loop 🏌️ firstloop.vercel.app`
  const shareUrl  = `${window.location.origin}/course/${course?.id}`

  useEffect(() => {
    if (!round || !course) return

    // Small delay to ensure canvas is mounted
    const timer = setTimeout(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      
      // Reset canvas completely
      canvas.width  = 560
      canvas.height = 320
      
      const W = canvas.width
      const H = canvas.height

      // Step 1 — solid navy background, no variables
      ctx.fillStyle = '#1B3054'
      ctx.fillRect(0, 0, W, H)

      // Step 2 — top bar
      ctx.fillStyle = '#0d1a2e'
      ctx.fillRect(0, 0, W, 70)

      // Step 3 — course name in cream
      ctx.fillStyle = '#F0E8D5'
      ctx.font = 'bold 18px serif'
      ctx.textBaseline = 'top'
      ctx.fillText(course.name || 'Golf Course', 20, 14)

      // Step 4 — location
      ctx.fillStyle = '#a0b4c8'
      ctx.font = '12px sans-serif'
      ctx.fillText(course.location || '', 20, 42)

      // Step 5 — branding
      ctx.fillStyle = '#C4963A'
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText('FIRST LOOP', W - 20, 14)
      ctx.textAlign = 'left'

      // Step 6 — divider
      ctx.fillStyle = 'rgba(196,150,58,0.4)'
      ctx.fillRect(20, 74, W - 40, 1)

      // Step 7 — MY ROUND label
      ctx.fillStyle = '#C4963A'
      ctx.font = 'bold 10px sans-serif'
      ctx.textBaseline = 'top'
      ctx.fillText('MY ROUND', 20, 84)

      // Step 8 — boxes
      const hasScore   = round.score != null
      const myRating   = round.overall_rating
      const courseAvg  = parseFloat(course.rating) || 0
      const numBoxes   = hasScore ? 3 : 2
      const boxGap     = 12
      const boxW       = Math.floor((W - 40 - (numBoxes - 1) * boxGap) / numBoxes)
      const boxY       = 102
      const boxH       = 82

      const boxes = []
      if (hasScore)
        boxes.push({ label: 'SCORE',      val: String(round.score),                    color: '#F0E8D5' })
      boxes.push(  { label: 'MY RATING',  val: myRating?.toFixed(1)  || '--',          color: '#C4963A' })
      boxes.push(  { label: 'COURSE AVG', val: courseAvg > 0 ? courseAvg.toFixed(1) : '--', color: '#88ddaa' })

      boxes.forEach((box, i) => {
        const bx = 20 + i * (boxW + boxGap)

        // box background
        ctx.fillStyle = 'rgba(255,255,255,0.07)'
        ctx.fillRect(bx, boxY, boxW, boxH)

        // big number
        ctx.fillStyle    = box.color
        ctx.font         = 'bold 38px serif'
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(box.val, bx + boxW / 2, boxY + boxH / 2 - 6)

        // label
        ctx.fillStyle    = 'rgba(240,232,213,0.5)'
        ctx.font         = 'bold 9px sans-serif'
        ctx.textBaseline = 'top'
        ctx.fillText(box.label, bx + boxW / 2, boxY + boxH - 18)

        ctx.textAlign = 'left'
      })

      // Step 9 — rating bars
      const bars = [
        ['CONDITIONS', round.conditions_rating, '#2a8a5a'],
        ['VALUE',      round.value_rating,      '#4a7ab0'],
        ['FACILITIES', round.vibes_rating,      '#C4963A'],
      ].filter(([, v]) => v != null)

      const barY0 = boxY + boxH + 18

      bars.forEach(([label, val, color], i) => {
        const by = barY0 + i * 26

        // label
        ctx.fillStyle    = 'rgba(240,232,213,0.5)'
        ctx.font         = '9px sans-serif'
        ctx.textBaseline = 'top'
        ctx.fillText(label, 20, by)

        // value
        ctx.fillStyle = 'rgba(240,232,213,0.85)'
        ctx.font      = 'bold 10px serif'
        ctx.textAlign = 'right'
        ctx.fillText(val.toFixed(1), W - 20, by)
        ctx.textAlign = 'left'

        // track
        ctx.fillStyle = 'rgba(255,255,255,0.08)'
        ctx.fillRect(20, by + 14, W - 40, 4)

        // fill
        ctx.fillStyle = color
        ctx.fillRect(20, by + 14, Math.max(4, (W - 40) * val / 10), 4)
      })

      // Step 10 — footer
      ctx.fillStyle    = 'rgba(240,232,213,0.12)'
      ctx.fillRect(0, H - 28, W, 1)
      ctx.fillStyle    = 'rgba(240,232,213,0.3)'
      ctx.font         = '9px sans-serif'
      ctx.textBaseline = 'bottom'
      ctx.fillText('Rate · Rank · Discover', 20, H - 8)
      ctx.fillStyle = '#C4963A'
      ctx.font      = 'bold 10px serif'
      ctx.textAlign = 'right'
      ctx.fillText('FIRST LOOP', W - 20, H - 8)
      ctx.textAlign = 'left'

      // Export
      setImageUrl(canvas.toDataURL('image/png'))
    }, 100)

    return () => clearTimeout(timer)
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
      const file      = new File([blob], 'firstloop-round.png', { type: 'image/png' })
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

        {/* Canvas — off screen but NOT display:none */}
        <canvas ref={canvasRef}
          style={{ position:'fixed', top:'-9999px', left:'-9999px', pointerEvents:'none' }}/>

        {/* Card preview */}
        {imageUrl ? (
          <div style={{ borderRadius:12, overflow:'hidden', marginBottom:20,
            boxShadow:'0 4px 20px rgba(0,0,0,0.2)', border:`1px solid ${B.border}` }}>
            <img src={imageUrl} alt="Round card" style={{ width:'100%', display:'block' }}/>
          </div>
        ) : (
          <div style={{ background:B.feedBg, borderRadius:12, height:160, display:'flex',
            alignItems:'center', justifyContent:'center', marginBottom:20, border:`1px solid ${B.border}` }}>
            <span style={{ fontSize:12, color:B.textSoft, fontFamily:sans }}>Generating card...</span>
          </div>
        )}

        {/* Primary action */}
        {isMobile && hasNativeShare ? (
          <button onClick={nativeShare}
            style={{ width:'100%', background:B.gold, color:B.navy, border:'none', borderRadius:12,
              padding:'15px 0', fontWeight:800, fontSize:16, cursor:'pointer', fontFamily:serif, marginBottom:12 }}>
            📤 Share Round Card
          </button>
        ) : (
          <button onClick={downloadImage}
            style={{ width:'100%', background:B.gold, color:B.navy, border:'none', borderRadius:12,
              padding:'15px 0', fontWeight:800, fontSize:16, cursor:'pointer', fontFamily:serif, marginBottom:12 }}>
            💾 Save Round Card
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
            color:copied ? '#1E4530' : B.textNavy, border:`1px solid ${copied ? '#1E4530' : B.border}`,
            borderRadius:12, padding:'12px 0', fontWeight:600, fontSize:13, cursor:'pointer',
            fontFamily:sans, transition:'all 0.2s' }}>
          {copied ? '✅ Link Copied!' : '🔗 Copy Course Link'}
        </button>

        {!isMobile && (
          <p style={{ textAlign:'center', fontSize:11, color:B.textSoft, fontFamily:sans, margin:'12px 0 0', lineHeight:1.5 }}>
            Save the card and attach it when posting on X or Instagram
          </p>
        )}

      </div>
    </div>
  )
}
