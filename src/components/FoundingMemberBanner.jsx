import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext.jsx'

export default function FoundingMemberBanner({ variant = 'full' }) {
  // variant: 'full' (landing/discover hero) | 'compact' (inline strip)
  const { B, serif, sans } = useTheme()
  const navigate = useNavigate()

  if (variant === 'compact') {
    return (
      <div style={{
        background: 'rgba(201,168,76,0.1)',
        border: `1px solid rgba(201,168,76,0.3)`,
        borderRadius: 14, padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 14,
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 28, flexShrink: 0 }}>⭐</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: serif, fontSize: 14, fontWeight: 900, color: B.gold, marginBottom: 2 }}>
            Founding Member Status Available
          </div>
          <div style={{ fontFamily: sans, fontSize: 12, color: B.textMid, lineHeight: 1.5 }}>
            Join now and your profile will carry the Founding Member badge permanently — reserved for the first 500 golfers only.
          </div>
        </div>
        <button
          onClick={() => navigate('/auth')}
          style={{ background: B.gold, color: B.navy, border: 'none', borderRadius: 10, padding: '9px 16px', fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: serif, flexShrink: 0, whiteSpace: 'nowrap' }}>
          Join Free →
        </button>
      </div>
    )
  }

  // Full hero variant
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.05) 100%)',
      border: `1.5px solid rgba(201,168,76,0.35)`,
      borderRadius: 20, padding: '32px 28px',
      position: 'relative', overflow: 'hidden',
      marginBottom: 24,
    }}>
      {/* Decorative circle */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(201,168,76,0.08)', pointerEvents: 'none' }}/>

      <div style={{ position: 'relative' }}>
        {/* Badge label */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(201,168,76,0.18)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 999, padding: '4px 12px', marginBottom: 14 }}>
          <span style={{ fontSize: 12 }}>⭐</span>
          <span style={{ fontFamily: sans, fontSize: 11, fontWeight: 800, color: B.gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Founding Member
          </span>
        </div>

        <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 900, color: B.textNavy, margin: '0 0 10px', lineHeight: 1.2 }}>
          Become a Founding Member
        </h2>

        <p style={{ fontFamily: sans, fontSize: 14, color: B.textMid, lineHeight: 1.7, margin: '0 0 6px' }}>
          <em>Only the first 500 golfers will ever hold this title.</em>
        </p>

        <p style={{ fontFamily: sans, fontSize: 13, color: B.textSoft, lineHeight: 1.7, margin: '0 0 20px' }}>
          First Loop is building the definitive golfer's guide to every course in America. Join now and your profile will carry the Founding Member badge permanently — a mark that you were here at the beginning, before everyone else discovered it.
        </p>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/auth')}
            style={{ background: B.gold, color: B.navy, border: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: serif, transition: 'all 0.15s' }}>
            Join Free — Claim Your Badge →
          </button>
          <span style={{ fontFamily: sans, fontSize: 12, color: B.textSoft, fontStyle: 'italic' }}>
            No cost. No catch.
          </span>
        </div>
      </div>
    </div>
  )
}