import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'

function normalizeCourse(c) {
  return {
    id:         c.id,
    name:       c.name,
    location:   c.location,
    state:      c.state,
    par:        c.par,
    holes:      c.holes,
    price:      c.price,
    rating:     c.rating       || 0,
    conditions: c.conditions   || 0,
    value:      c.value_rating || 0,
    vibes:      c.vibes        || 0,
    reviews:    c.review_count || 0,
    natRank:    c.nat_rank     || 999,
    stRank:     c.st_rank      || 999,
    icon:       c.icon         || '⛳',
    bg:         c.bg_color     || '#1a2e1a',
  }
}

export default function CourseSuggestions() {
  const { B, serif, sans } = useTheme()
  const navigate              = useNavigate()
  const { user }              = useAuth()
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [reason, setReason]   = useState('')

  useEffect(() => {
    fetchSuggestions()
  }, [user])

  async function fetchSuggestions() {
    setLoading(true)
    try {
      // Get user's logged rounds
      const { data: myRounds } = await supabase
        .from('rounds')
        .select('course_id, overall_rating, conditions_rating, value_rating, vibes_rating')
        .eq('user_id', user?.id || '')
        .order('overall_rating', { ascending: false })

      const playedIds = (myRounds || []).map(r => r.course_id)

      // Build query — exclude already played courses
      let query = supabase
        .from('courses')
        .select('*')
        .eq('has_seed_rating', true)
        .order('rating', { ascending: false })
        .limit(6)

      if (playedIds.length > 0) {
        query = query.not('id', 'in', `(${playedIds.join(',')})`)
      }

      const { data: candidates } = await query

      if (!candidates || candidates.length === 0) {
        setLoading(false)
        return
      }

      // If user has rounds, personalize — otherwise show top rated
      if (myRounds && myRounds.length > 0) {
        const avg = arr => arr.length ? arr.reduce((a,b) => a+b, 0) / arr.length : 0
        const avgC = avg(myRounds.map(r => r.conditions_rating).filter(Boolean))
        const avgV = avg(myRounds.map(r => r.value_rating).filter(Boolean))
        const avgF = avg(myRounds.map(r => r.vibes_rating).filter(Boolean))

        const topPriority = avgC >= avgF && avgC >= avgV ? 'conditions'
          : avgF >= avgV ? 'vibes' : 'value'

        const labels = {
          conditions: 'your love of great course conditions',
          vibes:      'your appreciation for facilities',
          value:      'your focus on value for money',
        }

        const scored = candidates.map(c => {
          let score = (c.rating || 0) * 0.4
          if (topPriority === 'conditions') score += (c.conditions || 0) * 0.6
          if (topPriority === 'vibes')      score += (c.vibes || 0) * 0.6
          if (topPriority === 'value')      score += (c.value_rating || 0) * 0.6
          return { ...c, _score: score }
        })

        scored.sort((a, b) => b._score - a._score)
        setSuggestions(scored.slice(0, 6).map(normalizeCourse))
        setReason(`Suggested based on ${labels[topPriority]}`)
      } else {
        setSuggestions(candidates.map(normalizeCourse))
        setReason('Top rated courses to get you started')
      }

    } catch (err) {
      console.error('CourseSuggestions error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading || suggestions.length === 0) return null

  return (
    <div style={{ marginTop:28 }}>
      <div style={{ marginBottom:14 }}>
        <h2 style={{ fontSize:17, fontWeight:800, color:B.textNavy, fontFamily:serif, margin:'0 0 3px' }}>
          🎯 Suggested For You
        </h2>
        <p style={{ fontSize:12, color:B.textSoft, fontFamily:sans, margin:0 }}>{reason}</p>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
        {suggestions.map(c => (
          <div key={c.id} onClick={() => navigate(`/course/${c.id}`)}
            style={{ background:'#fff', borderRadius:13, padding:'13px 15px', cursor:'pointer', border:`1px solid ${B.border}`, display:'flex', alignItems:'center', gap:11, transition:'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 16px rgba(27,48,84,0.08)'; e.currentTarget.style.borderColor=B.gold }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor=B.border }}>
            <div style={{ width:42, height:42, borderRadius:10, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, flexShrink:0 }}>
              {c.icon}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:B.textNavy, fontFamily:sans, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</div>
              <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans }}>{c.location}</div>
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{ fontSize:16, fontWeight:900, color:B.gold, fontFamily:serif }}>
                {c.rating > 0 ? c.rating.toFixed(1) : '—'}
              </div>
              <div style={{ fontSize:10, color:B.textSoft, fontFamily:sans }}>{c.reviews.toLocaleString()} reviews</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}