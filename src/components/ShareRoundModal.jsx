import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { B, serif, sans } from '../lib/data.js'

function RatingBar({ label, value, color }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
      <span style={{ fontSize:11, color:'rgba(240,232,213,0.6)', fontFamily:sans, width:80, flexShrink:0 }}>{label}</span>
      <div style={{ flex:1, height:4, borderRadius:2, background:'rgba(255,255,255,0.1)' }}>
        <div style={{ height:'100%', width:`${(value/10)*100}%`, background:color, borderRadius:2 }}/>
      </div>
      <span style={{ fontSize:11, fontWeight:700, color:'rgba(240,232,213,0.9)', fontFamily:sans, width:24, textAlign:'right' }}>{value.toFixed(1)}</span>
    </div>
  )
}

export default function ShareRoundModal({ round, course, onClose }) {
  const navigate    = useNavigate()
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState('card')

  const shareText = `Just logged a round at ${course?.name}${round.score ? ` — shot ${round.score}` : ''}! Rated ${round.overall_rating}/10 on First Loop. Rate, rank & discover golf courses at firstloopgolf.com`

  const shareUrl = `${window.location.origin}/course/${course?.id}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  function shareTwitter() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank')
  }

  function shareFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank')
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'First Loop', text: shareText, url: shareUrl })
      } catch {}
    }
  }

  const hasNativeShare = !!navigator.share

  // Score color
  const scoreColor = round.score <= 72 ? B.green : round.score <= 85 ? B.navy : B.gold

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:500, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:540, maxHeight:'92vh', overflowY:'auto', padding:'28px 24px 48px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <h2 style={{ fontFamily:serif, fontSize:20, fontWeight:900, color:B.textNavy, margin:'0 0 2px' }}>Share Your Round</h2>
            <p style={{ fontFamily:sans, fontSize:13, color:B.textSoft, margin:0 }}>{course?.name}</p>
          </div>
          <button onClick={onClose}
            style={{ background:B.feedBg, border:'none', borderRadius:'50%', width:34, height:34, cursor:'pointer', fontSize:16, color:B.textMid }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', background:B.feedBg, borderRadius:10, padding:3, marginBottom:20, gap:3 }}>
          {[['card','Round Card'],['text','Share Text']].map(([v,l]) => (
            <button key={v} onClick={() => setTab(v)}
              style={{ flex:1, padding:'8px 0', borderRadius:8, border:'none', background:tab===v ? B.navy:'transparent', color:tab===v ? B.cream:B.textMid, fontWeight:600, cursor:'pointer', fontSize:13, fontFamily:sans, transition:'all 0.15s' }}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'card' && (
          <div>
            {/* Shareable Card Preview */}
            <div style={{ background:B.navy, borderRadius:16, overflow:'hidden', marginBottom:20 }}>
              {/* Card header */}
              <div style={{ background:course?.bg || B.green, padding:'20px 20px 16px', position:'relative' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:'rgba(240,232,213,0.6)', fontFamily:sans, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>Round Logged</div>
                    <div style={{ fontSize:18, fontWeight:900, color:B.cream, fontFamily:serif, lineHeight:1.2, marginBottom:4 }}>{course?.name}</div>
                    <div style={{ fontSize:12, color:'rgba(240,232,213,0.7)', fontFamily:sans }}>📍 {course?.location}</div>
                  </div>
                  <div style={{ fontSize:40 }}>{course?.icon || '⛳'}</div>
                </div>
              </div>

              {/* Card stats */}
              <div style={{ padding:'16px 20px' }}>
                <div style={{ display:'grid', gridTemplateColumns: round.score ? '1fr 1fr' : '1fr', gap:12, marginBottom:16 }}>
                  {round.score && (
                    <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:12, padding:'12px 14px', textAlign:'center' }}>
                      <div style={{ fontSize:32, fontWeight:900, color:B.cream, fontFamily:serif, lineHeight:1 }}>{round.score}</div>
                      <div style={{ fontSize:11, color:'rgba(240,232,213,0.5)', fontFamily:sans, marginTop:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Score</div>
                    </div>
                  )}
                  <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:12, padding:'12px 14px', textAlign:'center' }}>
                    <div style={{ fontSize:32, fontWeight:900, color:B.gold, fontFamily:serif, lineHeight:1 }}>{round.overall_rating?.toFixed(1)}</div>
                    <div style={{ fontSize:11, color:'rgba(240,232,213,0.5)', fontFamily:sans, marginTop:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Rating</div>
                  </div>
                </div>

                {/* Rating bars */}
                <div style={{ marginBottom:16 }}>
                  {round.conditions_rating && <RatingBar label="Conditions" value={round.conditions_rating} color={B.green}/>}
                  {round.value_rating      && <RatingBar label="Value"      value={round.value_rating}      color={B.navy}/>}
                  {round.vibes_rating      && <RatingBar label="Facilities" value={round.vibes_rating}      color={B.gold}/>}
                </div>

                {round.comment && (
                  <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:10, padding:'10px 14px', marginBottom:14 }}>
                    <p style={{ margin:0, fontSize:12, color:'rgba(240,232,213,0.75)', fontFamily:sans, fontStyle:'italic', lineHeight:1.6 }}>"{round.comment}"</p>
                  </div>
                )}

                {/* Branding */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize:11, color:'rgba(240,232,213,0.4)', fontFamily:sans }}>firstloopgolf.com</span>
                  <span style={{ fontSize:11, color:B.gold, fontFamily:serif, fontWeight:700 }}>FIRST LOOP</span>
                </div>
              </div>
            </div>

            {/* Share buttons */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {hasNativeShare && (
                <button onClick={nativeShare}
                  style={{ width:'100%', background:B.navy, color:B.cream, border:'none', borderRadius:12, padding:'13px 0', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:sans, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <span>📤</span> Share via...
                </button>
              )}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <button onClick={shareTwitter}
                  style={{ background:'#000', color:'#fff', border:'none', borderRadius:12, padding:'12px 0', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:sans, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  𝕏 Post
                </button>
                <button onClick={shareFacebook}
                  style={{ background:'#1877f2', color:'#fff', border:'none', borderRadius:12, padding:'12px 0', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:sans, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  📘 Facebook
                </button>
              </div>
              <button onClick={copyLink}
                style={{ width:'100%', background:copied ? '#e8f5e9' : B.feedBg, color: copied ? B.green : B.textNavy, border:`1px solid ${copied ? B.green : B.border}`, borderRadius:12, padding:'12px 0', fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:sans, transition:'all 0.2s' }}>
                {copied ? '✅ Link Copied!' : '🔗 Copy Course Link'}
              </button>
            </div>
          </div>
        )}

        {tab === 'text' && (
          <div>
            <div style={{ background:B.feedBg, borderRadius:14, padding:'16px 18px', marginBottom:16, border:`1px solid ${B.border}` }}>
              <p style={{ margin:0, fontSize:14, color:B.textNavy, fontFamily:sans, lineHeight:1.7 }}>{shareText}</p>
            </div>
            <button onClick={copyText}
              style={{ width:'100%', background: copied ? '#e8f5e9' : B.gold, color: copied ? B.green : B.navy, border: copied ? `1px solid ${B.green}` : 'none', borderRadius:12, padding:'13px 0', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:serif, transition:'all 0.2s', marginBottom:10 }}>
              {copied ? '✅ Text Copied!' : '📋 Copy Text'}
            </button>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <button onClick={shareTwitter}
                style={{ background:'#000', color:'#fff', border:'none', borderRadius:12, padding:'12px 0', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:sans }}>
                𝕏 Post
              </button>
              <button onClick={shareFacebook}
                style={{ background:'#1877f2', color:'#fff', border:'none', borderRadius:12, padding:'12px 0', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:sans }}>
                📘 Facebook
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}