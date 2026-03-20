import { useTheme } from '../contexts/ThemeContext.jsx'

function getInitials(name) {
  if (!name) return 'G'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}


function ratingEmoji(v) {
  if (!v) return null
  if (v <= 2)  return '😤'
  if (v <= 4)  return '😕'
  if (v <= 6)  return '😐'
  if (v <= 8)  return '😊'
  return '🤩'
}

export default function GolfPassport({ profile, rounds, onClose }) {
  const { B, serif, sans } = useTheme()

  const top5     = rounds.slice(0, 5)
  const states   = [...new Set(rounds.map(r => r.courses?.state).filter(Boolean))]
  const initials = getInitials(profile?.full_name || profile?.username || 'G')
  const name     = profile?.full_name || profile?.username || 'Golfer'
  const username = profile?.username || 'firstloop'

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: `${name}'s Golf Passport — First Loop`,
        text:  `${name} has played ${rounds.length} courses on First Loop. firstloopgolf.com`,
        url:   'https://firstloopgolf.com',
      })
    }
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 600,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '20px 16px',
      }}
    >
      <button onClick={onClose}
        style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        ✕
      </button>

      <p style={{ fontFamily: sans, fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '0 0 12px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Screenshot to share · or tap Share below
      </p>

      {/* ── THE PASSPORT CARD — always dark navy, independent of theme ── */}
      <div style={{
        width: '100%', maxWidth: 340,
        background: '#1a2e1a',
        borderRadius: 22,
        overflow: 'hidden',
        border: '1.5px solid rgba(201,168,76,0.25)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>

        {/* Gold header stripe */}
        <div style={{ background: '#c9a84c', padding: '5px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: serif, fontSize: 9, fontWeight: 900, color: '#1a2e1a', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            Golf Passport
          </span>
          <span style={{ fontFamily: serif, fontSize: 9, fontWeight: 900, color: '#1a2e1a', letterSpacing: '0.12em' }}>
            FIRST LOOP ⛳
          </span>
        </div>

        {/* Profile row */}
        <div style={{ padding: '18px 18px 14px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(240,232,213,0.07)' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#c9a84c', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: serif, fontSize: 19, fontWeight: 900, color: '#1a2e1a' }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: serif, fontSize: 16, fontWeight: 900, color: '#f5f0e8', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {name}
            </div>
            <div style={{ fontFamily: sans, fontSize: 10, color: 'rgba(240,232,213,0.4)', marginBottom: 5 }}>
              @{username}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {profile?.handicap != null && (
                <span style={{ fontFamily: sans, fontSize: 9, color: '#c9a84c', fontWeight: 700, background: 'rgba(201,168,76,0.12)', borderRadius: 999, padding: '2px 7px' }}>
                  ⛳ Hdcp {profile.handicap}
                </span>
              )}
              {states.length > 0 && (
                <span style={{ fontFamily: sans, fontSize: 9, color: 'rgba(240,232,213,0.4)', fontWeight: 600 }}>
                  {states.length} state{states.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          {/* Course count badge */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontFamily: serif, fontSize: 30, fontWeight: 900, color: '#c9a84c', lineHeight: 1 }}>{rounds.length}</div>
            <div style={{ fontFamily: sans, fontSize: 8, color: 'rgba(240,232,213,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>courses</div>
          </div>
        </div>

        {/* Top 5 rankings */}
        <div style={{ padding: '12px 18px 14px' }}>
          <div style={{ fontFamily: sans, fontSize: 8, fontWeight: 700, color: 'rgba(240,232,213,0.3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>
            Personal Rankings
          </div>

          {top5.length === 0 ? (
            <div style={{ fontFamily: sans, fontSize: 11, color: 'rgba(240,232,213,0.25)', fontStyle: 'italic' }}>
              No courses logged yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {top5.map((r, i) => {
                const rankColor = i === 0 ? '#c9a84c' : i === 1 ? '#9E9E9E' : i === 2 ? '#A97240' : 'rgba(240,232,213,0.3)'
                const rankBg    = i === 0 ? 'rgba(201,168,76,0.15)' : i === 1 ? 'rgba(158,158,158,0.1)' : i === 2 ? 'rgba(169,114,64,0.1)' : 'rgba(240,232,213,0.04)'
                const emoji     = ratingEmoji(r.overall_rating)
                return (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, background: rankBg, border: `1px solid ${rankColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: serif, fontSize: 10, fontWeight: 900, color: rankColor }}>#{i + 1}</span>
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: r.courses?.bg_color || '#2d5a27', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                      {r.courses?.icon || '⛳'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: '#f5f0e8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.courses?.name || 'Course'}
                      </div>
                      <div style={{ fontFamily: sans, fontSize: 9, color: 'rgba(240,232,213,0.3)' }}>
                        {r.courses?.state || ''}
                      </div>
                    </div>
                    {emoji && <span style={{ fontSize: 14, flexShrink: 0 }}>{emoji}</span>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Home course (if set) */}
        {profile?.home_course && (
          <div style={{ padding: '8px 18px', borderTop: '1px solid rgba(240,232,213,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: sans, fontSize: 8, fontWeight: 700, color: 'rgba(240,232,213,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Home</span>
            <span style={{ fontFamily: sans, fontSize: 10, color: 'rgba(240,232,213,0.5)', fontWeight: 600 }}>{profile.home_course}</span>
          </div>
        )}

        {/* Footer */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '6px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: sans, fontSize: 8, color: 'rgba(240,232,213,0.18)', letterSpacing: '0.04em' }}>firstloopgolf.com</span>
          <span style={{ fontFamily: serif, fontSize: 8, color: 'rgba(201,168,76,0.35)', letterSpacing: '0.1em' }}>RATE · RANK · DISCOVER</span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16, width: '100%', maxWidth: 340 }}>
        <button onClick={handleShare}
          style={{ flex: 1, background: B.gold, color: B.navy, border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: serif }}>
          📤 Share
        </button>
        <button onClick={onClose}
          style={{ flex: 1, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '13px 0', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: sans }}>
          Close
        </button>
      </div>
    </div>
  )
}