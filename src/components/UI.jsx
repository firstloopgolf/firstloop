import { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext.jsx'

export function Logo({ size = 'md', theme = 'navy' }) {
  const { B, serif, sans } = useTheme()
  const heights  = { sm: 36, md: 48, lg: 68 }
  const height   = heights[size]
  const fontSize = { sm: 18, md: 24, lg: 34 }[size]
  const subSize  = { sm: 9,  md: 12, lg: 16 }[size]

  const textColor = theme === 'light' ? B.navy : B.cream
  const goldColor = B.gold

  // On dark (navy) backgrounds invert the navy caddie to cream so it's visible
  const iconFilter = theme === 'light' ? 'none' : 'brightness(0) saturate(100%) invert(93%) sepia(10%) saturate(300%) hue-rotate(10deg) brightness(95%)'

  return (
    <div style={{ display:'flex', alignItems:'center', gap: size === 'sm' ? 8 : 12 }}>
      <img
        src="/caddie-icon.png"
        alt="First Loop caddie"
        style={{
          height,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
          filter: iconFilter,
        }}
      />
      <div style={{ lineHeight: 1 }}>
        <div style={{ fontFamily:serif, fontSize: subSize, fontWeight: 700, letterSpacing: '0.25em', color: goldColor, textTransform:'uppercase', marginBottom: 2 }}>
          FIRST
        </div>
        <div style={{ fontFamily:serif, fontSize: fontSize, fontWeight: 900, color: textColor, letterSpacing: '-0.02em', lineHeight: 1 }}>
          LOOP
        </div>
      </div>
    </div>
  )
}

export function Pill({ children, gold, green, small }) {
  const { B, serif, sans } = useTheme()
  const bg = gold ? B.goldPale : green ? '#E0EDE5' : '#E5EAF5'
  const fg = gold ? '#8a6010'  : green ? B.green    : B.navy
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:3, background:bg, color:fg, padding:small ? '2px 8px':'3px 12px', borderRadius:999, fontSize:small ? 10:11, fontWeight:700, fontFamily:sans, whiteSpace:'nowrap' }}>
      {children}
    </span>
  )
}

export function Avatar({ initials, size=38, color=B.navy }) {
  const { B, serif, sans } = useTheme()
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', color:B.cream, fontSize:size*0.32, fontWeight:700, flexShrink:0, fontFamily:sans }}>
      {initials}
    </div>
  )
}

export function RatingChip({ value }) {
  const { B, serif, sans } = useTheme()
  const [bg,fg] = value>=9.5 ? [B.green,'#e0ede5'] : value>=9 ? [B.navy,'#e5eaf4'] : [B.gold, B.goldPale]
  return (
    <div style={{ background:fg, color:bg, borderRadius:8, padding:'5px 10px', textAlign:'center', minWidth:50 }}>
      <div style={{ fontSize:18, fontWeight:900, fontFamily:serif, lineHeight:1 }}>{value.toFixed(1)}</div>
    </div>
  )
}

export function Bar({ value, color }) {
  const { B, serif, sans } = useTheme()
  return (
    <div style={{ height:5, borderRadius:3, background:'#E8E0D0', overflow:'hidden', flex:1 }}>
      <div style={{ height:'100%', width:`${(value/10)*100}%`, background:color, borderRadius:3 }}/>
    </div>
  )
}

export function RatingRow({ label, value, color }) {
  const { B, serif, sans } = useTheme()
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <span style={{ fontSize:12, color:B.textMid, fontFamily:sans, fontWeight:500, width:88, flexShrink:0 }}>{label}</span>
      <Bar value={value} color={color}/>
      <span style={{ fontSize:12, fontWeight:700, color:B.textNavy, fontFamily:sans, width:26, textAlign:'right' }}>{value.toFixed(1)}</span>
    </div>
  )
}

export function NatBadge({ rank }) {
  const { B, serif, sans } = useTheme()
  if (rank > 100) return null
  return <Pill gold><span>🏅</span> Natl #{rank}</Pill>
}

export function StatBadge({ state, rank }) {
  const { B, serif, sans } = useTheme()
  if (rank > 20) return null
  return <Pill green><span>📍</span> {state} #{rank}</Pill>
}

export function CourseCard({ course, onClick, row }) {
  const { B, serif, sans } = useTheme()
  const [hov, setHov] = useState(false)
  if (row) return (
    <div onClick={() => onClick(course)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:B.white, borderRadius:12, padding:'13px 15px', cursor:'pointer', border:`1px solid ${hov ? B.gold:B.border}`, display:'flex', alignItems:'center', gap:12, transition:'all 0.15s', boxShadow:hov ? '0 4px 18px rgba(27,48,84,0.07)':'none' }}>
      <div style={{ width:42, height:42, borderRadius:10, background:course.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{course.icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:600, color:B.textNavy, fontFamily:sans, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{course.name}</div>
        <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans }}>{course.location} · {course.price}</div>
      </div>
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <div style={{ fontSize:20, fontWeight:900, color:B.gold, fontFamily:serif }}>{course.rating}</div>
        <div style={{ fontSize:11, color:B.textSoft, fontFamily:sans }}>{course.reviews.toLocaleString()} ratings</div>
      </div>
    </div>
  )
  return (
    <div onClick={() => onClick(course)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:B.white, borderRadius:16, overflow:'hidden', cursor:'pointer', border:`1px solid ${hov ? B.gold:B.border}`, transition:'all 0.2s', boxShadow:hov ? '0 8px 28px rgba(27,48,84,0.1)':'0 2px 8px rgba(27,48,84,0.04)', transform:hov ? 'translateY(-2px)':'none' }}>
      <div style={{ height:108, background:course.bg, display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'13px 15px' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          <NatBadge rank={course.natRank}/>
          <StatBadge state={course.state} rank={course.stRank}/>
        </div>
        <div style={{ fontSize:46 }}>{course.icon}</div>
      </div>
      <div style={{ padding:'14px 16px 16px' }}>
        <div style={{ fontSize:15, fontWeight:800, color:B.textNavy, fontFamily:serif, marginBottom:2, lineHeight:1.25 }}>{course.name}</div>
        <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans, marginBottom:11 }}>📍 {course.location} · Par {course.par} · {course.price}</div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <span style={{ fontSize:28, fontWeight:900, color:B.gold, fontFamily:serif, lineHeight:1 }}>{course.rating}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, color:B.textSoft, fontFamily:sans, marginBottom:4 }}>{course.reviews.toLocaleString()} ratings</div>
            <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
              <Bar value={course.conditions} color={B.green}/>
              <Bar value={course.value}      color={B.navy}/>
              <Bar value={course.vibes}      color={B.gold}/>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {[['Conditions',course.conditions,B.green],['Value',course.value,B.navy],['Facilities',course.vibes,B.gold]].map(([l,v,c]) => (
            <div key={l} style={{ flex:1, background:B.feedBg, borderRadius:8, padding:'6px 4px', textAlign:'center', border:`1px solid ${B.border}` }}>
              <div style={{ fontSize:13, fontWeight:800, color:c, fontFamily:serif }}>{v.toFixed(1)}</div>
              <div style={{ fontSize:9, color:B.textSoft, fontFamily:sans, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PageBanner({ icon, title, subtitle, bg }) {
  const { B, serif, sans } = useTheme()
  return (
    <div style={{ background:bg || B.navy, borderRadius:20, padding:'26px 26px 22px', marginBottom:20, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:-50, right:-50, width:180, height:180, borderRadius:'50%', background:'rgba(196,150,58,0.07)' }}/>
      <div style={{ position:'relative' }}>
        <div style={{ fontSize:36, marginBottom:8 }}>{icon}</div>
        <h1 style={{ color:B.cream, margin:'0 0 5px', fontSize:22, fontWeight:900, fontFamily:serif }}>{title}</h1>
        <p style={{ color:'rgba(240,232,213,0.65)', margin:0, fontSize:13, fontFamily:sans }}>{subtitle}</p>
      </div>
    </div>
  )
}

export function TabBar({ tabs, active, onChange }) {
  const { B, serif, sans } = useTheme()
  return (
    <div style={{ display:'flex', background:B.white, borderRadius:12, padding:4, border:`1px solid ${B.border}`, marginBottom:16, gap:4 }}>
      {tabs.map(([id,label]) => (
        <button key={id} onClick={() => onChange(id)}
          style={{ flex:1, padding:'9px 0', borderRadius:9, border:'none', background:active===id ? B.navy:'transparent', color:active===id ? B.cream:B.textMid, fontWeight:600, cursor:'pointer', fontSize:13, fontFamily:sans, transition:'all 0.15s' }}>
          {label}
        </button>
      ))}
    </div>
  )
}