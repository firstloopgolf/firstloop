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
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => navigate('/auth')}
            style={{ background:'transparent', border:`1px solid rgba(240,232,213,0.25)`, color:'rgba(240,232,213,0.8)', borderRadius:10, padding:'9px 20px', fontWeight:600, cursor:'pointer', fontSize:14, fontFamily:sans, transition:'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor='rgba(240,232,213,0.5)'}
            onMouseLeave={e => e.currentTarget.style.borderColor='rgba(240,232,213,0.25)'}>
            Sign In
          </button>
          <button onClick={() => navigate('/auth')}
            style={{ background:B.gold, border:'none', color:B.navy, borderRadius:10, padding:'9px 20px', fontWeight:800, cursor:'pointer', fontSize:14, fontFamily:sans, transition:'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background=B.goldLight}
            onMouseLeave={e => e.currentTarget.style.background=B.gold}>
            Join Free →
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'56px 28px 72px', position:'relative' }}>
        <div style={{ position:'absolute', top:-80, left:'50%', transform:'translateX(-50%)', width:700, height:700, borderRadius:'50%', background:'rgba(196,150,58,0.05)', pointerEvents:'none' }}/>
        <div style={{ position:'relative', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>

          {/* Left — text */}
          <div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(196,150,58,0.12)', border:`1px solid rgba(196,150,58,0.25)`, borderRadius:999, padding:'6px 16px', marginBottom:24 }}>
              <span style={{ fontSize:13 }}>⛳</span>
              <span style={{ color:B.gold, fontSize:12, fontWeight:700, fontFamily:sans, letterSpacing:'0.05em' }}>2,900+ COURSES · 9 STATES · GROWING WEEKLY</span>
            </div>
            <h1 style={{ color:B.cream, fontSize:'clamp(36px,4vw,58px)', fontWeight:900, fontFamily:serif, lineHeight:1.1, margin:'0 0 20px', letterSpacing:'-0.02em' }}>
              Rate Every Round.<br/>
              <span style={{ color:B.gold }}>Discover Your Next.</span>
            </h1>
            <p style={{ color:'rgba(240,232,213,0.65)', fontSize:17, fontFamily:sans, lineHeight:1.75, maxWidth:480, margin:'0 0 36px', fontWeight:400 }}>
              First Loop is the golfer's guide to every course in America. Track where you've played, rate the conditions, value & facilities, and find your next great round — guided by real golfer reviews.
            </p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <button onClick={() => navigate('/auth')}
                style={{ background:B.gold, border:'none', color:B.navy, borderRadius:12, padding:'15px 32px', fontWeight:800, cursor:'pointer', fontSize:16, fontFamily:serif, transition:'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background=B.goldLight}
                onMouseLeave={e => e.currentTarget.style.background=B.gold}>
                Start Tracking Free →
              </button>
              <button onClick={() => navigate('/discover')}
                style={{ background:'rgba(240,232,213,0.08)', border:`1px solid rgba(240,232,213,0.15)`, color:B.cream, borderRadius:12, padding:'15px 28px', fontWeight:600, cursor:'pointer', fontSize:15, fontFamily:sans, transition:'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(240,232,213,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(240,232,213,0.08)'}>
                Browse Courses
              </button>
            </div>
          </div>

          {/* Right — stat cards */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              ['⛺', 'Course Conditions', 'Rate the quality of fairways, greens, and overall upkeep'],
              ['💰', 'Value for Money',   'Is the green fee worth it? Real golfers tell you the truth'],
              ['🏌️', 'Facilities',        'Clubhouse, practice areas, caddies and the overall vibe'],
              ['🏆', 'Live Rankings',     'National Top 100 and State Top 20 updated by real reviews'],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ background:'rgba(240,232,213,0.05)', border:`1px solid rgba(240,232,213,0.08)`, borderRadius:16, padding:'20px 18px', transition:'all 0.2s', cursor:'default' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(240,232,213,0.08)'; e.currentTarget.style.borderColor='rgba(196,150,58,0.25)' }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(240,232,213,0.05)'; e.currentTarget.style.borderColor='rgba(240,232,213,0.08)' }}>
                <div style={{ fontSize:28, marginBottom:10 }}>{icon}</div>
                <h3 style={{ color:B.cream, fontSize:14, fontWeight:800, fontFamily:serif, margin:'0 0 6px' }}>{title}</h3>
                <p style={{ color:'rgba(240,232,213,0.5)', fontSize:12, fontFamily:sans, lineHeight:1.6, margin:0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ borderTop:`1px solid rgba(240,232,213,0.08)`, borderBottom:`1px solid rgba(240,232,213,0.08)`, padding:'28px 28px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', justifyContent:'space-around', flexWrap:'wrap', gap:20 }}>
          {[
            ['2,900+', 'Courses Rated'],
            ['9',      'States Covered'],
            ['Top 100','National Rankings'],
            ['Top 20', 'Per State'],
            ['Free',   'Always Free to Use'],
          ].map(([num, label]) => (
            <div key={label} style={{ textAlign:'center' }}>
              <div style={{ color:B.gold, fontSize:28, fontWeight:900, fontFamily:serif, lineHeight:1 }}>{num}</div>
              <div style={{ color:'rgba(240,232,213,0.45)', fontSize:11, fontFamily:sans, marginTop:5, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'72px 28px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <h2 style={{ color:B.cream, fontSize:32, fontWeight:900, fontFamily:serif, margin:'0 0 12px' }}>How First Loop works</h2>
          <p style={{ color:'rgba(240,232,213,0.5)', fontSize:15, fontFamily:sans, maxWidth:480, margin:'0 auto' }}>
            Tee it up in under a minute. No credit card, no catch.
          </p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:24 }}>
          {[
            ['1', 'Create your free account',    'Sign up in 30 seconds. No credit card needed, ever.'],
            ['2', 'Find a course you played',    'Search from 2,900+ rated courses across 9 states and growing.'],
            ['3', 'Log your round & rate it',    'Add your score and rate conditions, value, and facilities.'],
            ['4', 'Discover what to play next',  'Community rankings and personalized suggestions guide your next round.'],
          ].map(([num, title, desc]) => (
            <div key={num} style={{ position:'relative' }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(196,150,58,0.12)', border:`1px solid rgba(196,150,58,0.3)`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, color:B.gold, fontSize:22, fontWeight:900, fontFamily:serif }}>
                {num}
              </div>
              <h4 style={{ color:B.cream, fontSize:16, fontWeight:700, fontFamily:serif, margin:'0 0 8px', lineHeight:1.3 }}>{title}</h4>
              <p style={{ color:'rgba(240,232,213,0.5)', fontSize:13, fontFamily:sans, lineHeight:1.7, margin:0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Community feed preview */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 28px 72px' }}>
        <div style={{ background:'rgba(240,232,213,0.04)', border:`1px solid rgba(240,232,213,0.08)`, borderRadius:24, padding:'48px 44px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center' }}>
            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(196,150,58,0.12)', borderRadius:999, padding:'4px 14px', marginBottom:16 }}>
                <span style={{ color:B.gold, fontSize:12, fontWeight:700, fontFamily:sans }}>📋 COMMUNITY FEED</span>
              </div>
              <h2 style={{ color:B.cream, fontSize:28, fontWeight:900, fontFamily:serif, margin:'0 0 14px', lineHeight:1.2 }}>
                See what golfers are playing right now
              </h2>
              <p style={{ color:'rgba(240,232,213,0.6)', fontSize:15, fontFamily:sans, lineHeight:1.75, margin:'0 0 28px' }}>
                Every logged round appears in the community feed. Read real reviews, see real scores, and discover courses through the people who actually played them.
              </p>
              <button onClick={() => navigate('/auth')}
                style={{ background:B.gold, border:'none', color:B.navy, borderRadius:12, padding:'13px 28px', fontWeight:800, cursor:'pointer', fontSize:15, fontFamily:serif }}>
                Join the Community →
              </button>
            </div>

            {/* Mock feed cards */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { user:'TM', name:'Tyler M.',  course:'Augusta National',    score:78,  rating:9.5, color:'#2d5a3d' },
                { user:'SK', name:'Sarah K.',  course:'Pebble Beach',        score:84,  rating:9.2, color:'#1B3054' },
                { user:'JR', name:'James R.',  course:'Bethpage Black',      score:91,  rating:8.8, color:'#181818' },
              ].map((item, i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.05)', borderRadius:12, overflow:'hidden', border:`1px solid rgba(240,232,213,0.08)` }}>
                  <div style={{ background:item.color, padding:'8px 14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ color:B.cream, fontSize:12, fontWeight:700, fontFamily:sans }}>⛳ {item.course}</span>
                  </div>
                  <div style={{ padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:B.navy, display:'flex', alignItems:'center', justifyContent:'center', color:B.cream, fontSize:11, fontWeight:700, fontFamily:sans, flexShrink:0 }}>{item.user}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ color:B.cream, fontSize:13, fontWeight:600, fontFamily:sans }}>{item.name}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ color:B.gold, fontSize:16, fontWeight:900, fontFamily:serif }}>{item.rating}</div>
                      <div style={{ color:'rgba(240,232,213,0.4)', fontSize:11, fontFamily:sans }}>Score: {item.score}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ maxWidth:680, margin:'0 auto', padding:'0 28px 80px', textAlign:'center' }}>
        <h2 style={{ color:B.cream, fontSize:32, fontWeight:900, fontFamily:serif, margin:'0 0 14px' }}>
          Ready to start your First Loop?
        </h2>
        <p style={{ color:'rgba(240,232,213,0.55)', fontSize:16, fontFamily:sans, lineHeight:1.7, margin:'0 0 32px' }}>
          Join thousands of golfers already rating and ranking courses across America. It's free, it's honest, and it's built for golfers by golfers.
        </p>
        <button onClick={() => navigate('/auth')}
          style={{ background:B.gold, border:'none', color:B.navy, borderRadius:14, padding:'17px 40px', fontWeight:800, cursor:'pointer', fontSize:17, fontFamily:serif, transition:'all 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background=B.goldLight}
          onMouseLeave={e => e.currentTarget.style.background=B.gold}>
          Create Your Free Account →
        </button>
      </div>

      {/* Footer */}
      <div style={{ borderTop:`1px solid rgba(240,232,213,0.08)`, padding:'24px 28px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <Logo size="sm" theme="navy"/>
          <div style={{ display:'flex', gap:24 }}>
            {[['Discover','/discover'],['Rankings','/rankings'],['Map','/map'],['Submit a Course','/submit']].map(([label, path]) => (
              <button key={label} onClick={() => navigate(path)}
                style={{ background:'none', border:'none', color:'rgba(240,232,213,0.35)', cursor:'pointer', fontSize:13, fontFamily:sans, padding:0, transition:'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color='rgba(240,232,213,0.7)'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(240,232,213,0.35)'}>
                {label}
              </button>
            ))}
          </div>
          <p style={{ color:'rgba(240,232,213,0.25)', fontSize:12, fontFamily:sans, margin:0 }}>
            © {new Date().getFullYear()} First Loop · Rate · Rank · Discover
          </p>
        </div>
      </div>

    </div>
  )
}