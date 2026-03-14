import { useNavigate } from 'react-router-dom'
import { B, serif, sans } from '../lib/data.js'
import { Logo } from '../components/UI.jsx'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ fontFamily:sans, background:B.navy, minHeight:'100vh', overflowX:'hidden' }}>

      {/* Nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 28px', maxWidth:1100, margin:'0 auto' }}>
        <Logo size="md" theme="navy"/>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={() => navigate('/auth')}
            style={{ background:'transparent', border:`1px solid rgba(240,232,213,0.25)`, color:'rgba(240,232,213,0.8)', borderRadius:10, padding:'9px 20px', fontWeight:600, cursor:'pointer', fontSize:14, fontFamily:sans }}>
            Sign In
          </button>
          <button onClick={() => navigate('/auth')}
            style={{ background:B.gold, border:'none', color:B.navy, borderRadius:10, padding:'9px 20px', fontWeight:800, cursor:'pointer', fontSize:14, fontFamily:sans }}>
            Join Free
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'60px 28px 80px', textAlign:'center', position:'relative' }}>
        <div style={{ position:'absolute', top:-100, left:'50%', transform:'translateX(-50%)', width:600, height:600, borderRadius:'50%', background:'rgba(196,150,58,0.06)', pointerEvents:'none' }}/>
        <div style={{ position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(196,150,58,0.12)', border:`1px solid rgba(196,150,58,0.25)`, borderRadius:999, padding:'6px 18px', marginBottom:28 }}>
            <span style={{ fontSize:14 }}>⛳</span>
            <span style={{ color:B.gold, fontSize:13, fontWeight:600, fontFamily:sans }}>Now tracking 1,200+ courses nationwide</span>
          </div>
          <h1 style={{ color:B.cream, fontSize:'clamp(36px, 6vw, 72px)', fontWeight:900, fontFamily:serif, lineHeight:1.1, margin:'0 0 24px', letterSpacing:'-0.02em' }}>
            Rate Every Round.<br/>
            <span style={{ color:B.gold }}>Discover Your Next.</span>
          </h1>
          <p style={{ color:'rgba(240,232,213,0.65)', fontSize:'clamp(15px, 2vw, 20px)', fontFamily:sans, lineHeight:1.7, maxWidth:580, margin:'0 auto 40px', fontWeight:400 }}>
            First Loop is the golfer's guide to every course in America. Track where you've played, rate the conditions, value & vibes, and find your next great round.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => navigate('/auth')}
              style={{ background:B.gold, border:'none', color:B.navy, borderRadius:14, padding:'16px 36px', fontWeight:800, cursor:'pointer', fontSize:16, fontFamily:serif, letterSpacing:'0.01em' }}>
              Start Tracking Free →
            </button>
            <button onClick={() => navigate('/')}
              style={{ background:'rgba(240,232,213,0.08)', border:`1px solid rgba(240,232,213,0.15)`, color:B.cream, borderRadius:14, padding:'16px 36px', fontWeight:600, cursor:'pointer', fontSize:16, fontFamily:sans }}>
              Browse Courses
            </button>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 28px 80px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:16 }}>
          {[
            ['⛺', 'Rate Every Round', 'Score courses on Conditions, Value, and Facilities & Vibes. Build a personal record of every course you have played.'],
            ['🏆', 'National & State Rankings', 'See how courses rank against each other nationally and within each state, powered entirely by real golfer reviews.'],
            ['📋', 'Community Feed', 'See what golfers are playing right now. Read reviews, check scores, and discover courses through the people who played them.'],
            ['🗺️', 'Course Map', 'Explore rated courses across all 50 states on an interactive map. Find hidden gems near you or plan your next golf trip.'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ background:'rgba(240,232,213,0.05)', border:`1px solid rgba(240,232,213,0.08)`, borderRadius:18, padding:'26px 24px' }}>
              <div style={{ fontSize:36, marginBottom:14 }}>{icon}</div>
              <h3 style={{ color:B.cream, fontSize:17, fontWeight:800, fontFamily:serif, margin:'0 0 10px' }}>{title}</h3>
              <p style={{ color:'rgba(240,232,213,0.55)', fontSize:14, fontFamily:sans, lineHeight:1.7, margin:0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Social Proof */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 28px 80px' }}>
        <div style={{ background:'rgba(240,232,213,0.04)', border:`1px solid rgba(240,232,213,0.08)`, borderRadius:20, padding:'48px 40px', textAlign:'center' }}>
          <div style={{ display:'flex', justifyContent:'center', gap:40, flexWrap:'wrap', marginBottom:40 }}>
            {[['1,200+','Courses Rated'],['48','States Covered'],['Top 100','National Rankings'],['Top 20','Per State']].map(([num, label]) => (
              <div key={label}>
                <div style={{ color:B.gold, fontSize:32, fontWeight:900, fontFamily:serif, lineHeight:1 }}>{num}</div>
                <div style={{ color:'rgba(240,232,213,0.5)', fontSize:13, fontFamily:sans, marginTop:4 }}>{label}</div>
              </div>
            ))}
          </div>
          <h2 style={{ color:B.cream, fontSize:26, fontWeight:900, fontFamily:serif, margin:'0 0 14px' }}>
            Built by golfers, for golfers.
          </h2>
          <p style={{ color:'rgba(240,232,213,0.55)', fontSize:15, fontFamily:sans, lineHeight:1.7, maxWidth:520, margin:'0 auto 28px' }}>
            First Loop gives you an honest, unsponsored view of every course — ranked purely on what golfers actually think.
          </p>
          <button onClick={() => navigate('/auth')}
            style={{ background:B.gold, border:'none', color:B.navy, borderRadius:12, padding:'14px 32px', fontWeight:800, cursor:'pointer', fontSize:15, fontFamily:serif }}>
            Create Your Free Account →
          </button>
        </div>
      </div>

      {/* How It Works */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 28px 80px' }}>
        <h2 style={{ color:B.cream, fontSize:28, fontWeight:900, fontFamily:serif, textAlign:'center', margin:'0 0 40px' }}>How it works</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16 }}>
          {[
            ['1', 'Create your free account', 'Sign up in under 30 seconds — no credit card needed.'],
            ['2', 'Find a course you played', 'Search from 1,200+ rated courses across all 50 states.'],
            ['3', 'Log your round & rate it', 'Add your score and rate conditions, value, and vibes.'],
            ['4', 'Discover what to play next', 'Rankings and the community feed help you find your next great round.'],
          ].map(([num, title, desc]) => (
            <div key={num} style={{ textAlign:'center', padding:'10px 8px' }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(196,150,58,0.15)', border:`1px solid rgba(196,150,58,0.3)`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:B.gold, fontSize:20, fontWeight:900, fontFamily:serif }}>
                {num}
              </div>
              <h4 style={{ color:B.cream, fontSize:15, fontWeight:700, fontFamily:serif, margin:'0 0 8px' }}>{title}</h4>
              <p style={{ color:'rgba(240,232,213,0.5)', fontSize:13, fontFamily:sans, lineHeight:1.65, margin:0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop:`1px solid rgba(240,232,213,0.08)`, padding:'28px', textAlign:'center' }}>
        <Logo size="sm" theme="navy"/>
        <p style={{ color:'rgba(240,232,213,0.3)', fontSize:12, fontFamily:sans, marginTop:12 }}>
          © {new Date().getFullYear()} First Loop · Rate · Rank · Discover
        </p>
      </div>

    </div>
  )
}