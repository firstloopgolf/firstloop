import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { B, serif, sans, FEED, COURSES } from '../lib/data.js'
import { Avatar, RatingChip, RatingRow, NatBadge, PageBanner } from '../components/UI.jsx'

export default function Feed() {
  const navigate = useNavigate()
  const [liked, setLiked] = useState({})

  return (
    <div>
      <PageBanner icon="📋" title="Community Feed" subtitle="Latest rounds & reviews from golfers in the network" bg={B.green}/>
      <button style={{ width:'100%', background:B.gold, color:B.navy, border:'none', borderRadius:12, padding:'13px 0', fontWeight:800, fontSize:15, cursor:'pointer', marginBottom:16, fontFamily:serif }}>
        + Log a New Round
      </button>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {FEED.map((item,i) => {
          const c = COURSES.find(x => x.name===item.course)
          return (
            <div key={item.id} style={{ background:'#fff', borderRadius:16, overflow:'hidden', border:`1px solid ${B.border}` }}>
              <div onClick={() => c && navigate(`/course/${c.id}`)} style={{ background:c?.bg||B.navy, padding:'10px 16px', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                <span style={{ fontSize:20 }}>{c?.icon||'⛳'}</span>
                <div style={{ flex:1 }}>
                  <div style={{ color:B.cream, fontSize:13, fontWeight:700, fontFamily:sans }}>{item.course}</div>
                  <div style={{ display:'flex', gap:6, marginTop:3 }}>{c && <NatBadge rank={c.natRank}/>}</div>
                </div>
              </div>
              <div style={{ padding:'15px 17px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <Avatar initials={item.avatar} size={40} color={i%3===0 ? B.navy:i%3===1 ? B.green:'#5a4a2a'}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:B.textNavy, fontFamily:sans }}>{item.user}</div>
                    <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans }}>{item.date}</div>
                  </div>
                  <RatingChip value={item.rating}/>
                </div>
                <p style={{ margin:'0 0 12px', fontSize:14, color:B.textNavy, lineHeight:1.65, fontFamily:sans, fontStyle:'italic' }}>"{item.comment}"</p>
                <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:12 }}>
                  <RatingRow label="Conditions" value={item.conditions} color={B.green}/>
                  <RatingRow label="Value"      value={item.value}      color={B.navy}/>
                  <RatingRow label="Vibes"      value={item.vibes}      color={B.gold}/>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:10, borderTop:`1px solid ${B.feedBg}` }}>
                  <span style={{ background:B.feedBg, border:`1px solid ${B.border}`, borderRadius:999, padding:'4px 12px', fontSize:12, fontWeight:700, fontFamily:sans, color:B.textNavy }}>⛳ Score: {item.score}</span>
                  <button onClick={() => setLiked(p => ({...p,[item.id]:!p[item.id]}))}
                    style={{ background:'none', border:`1px solid ${liked[item.id] ? B.gold:B.border}`, borderRadius:999, padding:'4px 14px', cursor:'pointer', fontSize:12, color:liked[item.id] ? B.gold:B.textSoft, fontFamily:sans, fontWeight:600, transition:'all 0.15s' }}>
                    {liked[item.id] ? '♥':'♡'} {item.likes+(liked[item.id] ? 1:0)}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
