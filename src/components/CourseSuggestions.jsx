import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { B, serif, sans } from '../lib/data.js'
import { CourseCard } from './UI.jsx'

export default function CourseSuggestions() {
  const navigate        = useNavigate()
  const { user }        = useAuth()
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading]         = useState(true)
  const [reason, setReason]           = useState('')

  useEffect(() => { if (user) fetchSuggestions() }, [user])

  async function fetchSuggestions() {
    setLoading(true)
    try {
      // Get user's logged rounds
      const { data: myRounds } = await supabase
        .from('rounds')
        .select('course_id, overall_rating, conditions_rating, value_rating, vibes_rating')
        .eq('user_id', user.id)
        .order('overall_rating', { ascending: false })

      if (!myRounds || myRounds.length === 0) {
        // New user — show top rated courses
        const { data: top } = await supabase
          .from('courses')
          .select('*')
          .gt('rating', 0)
          .order('rating', { ascending: false })
          .limit(6)
        setSuggestions((top || []).map(normalizeCourse))
        setReason('Top rated courses to get you started')
        setLoading(false)
        return
      }

      const playedIds = myRounds.map(r => r.course_id)

      // Calculate what the user values most
      const avgConditions = avg(myRounds.map(r => r.conditions_rating).filter(Boolean))
      const avgValue      = avg(myRounds.map(r => r.value_rating).filter(Boolean))
      const avgVibes      = avg(myRounds.map(r => r.vibes_rating).filter(Boolean))

      // Find what they rate highest
      const topPriority = avgConditions >= avgVibes && avgConditions >= avgValue
        ? 'conditions'
        : avgVibes >= avgValue ? 'vibes' : 'value_rating'

      const labels = { conditions:'course conditions', vibes:'facilities & atmosphere', value_rating:'value for money' }

      // Get their top rated course to match state
      const topRound = myRounds[0]
      const { data: topCourse } = await supabase
        .from('courses')
        .select('state')
        .eq('id', topRound.course_id)
        .single()

      // Find similar courses they haven't played
      let query = supabase
        .from('courses')
        .select('*')
        .gt('rating', 0)
        .not('id', 'in', `(${playedIds.join(',')})`)

      // Weight by what they care about most
      if (topPriority === 'conditions') {
        query = query.order('conditions', { ascending: false })
      } else if (topPriority === 'vibes') {
        query = query.order('vibes', { ascending: false })
      } else {
        query = query.order('value_rating', { ascending: false })
      }

      const { data: candidates } = await query.limit(20)

      if (!candidates || candidates.length === 0) {
        setLoading(false)
        return
      }

      // Score each candidate
      const scored = candidates.map(c => {
        let score = 0
        // Prefer same state
        if (c.state === topCourse?.state) score += 2
        // Weight by user's top priority
        if (topPriority === 'conditions') score += (c.conditions || 0) * 0.5
        if (topPriority === 'vibes')      score += (c.vibes || 0) * 0.5
        if (topPriority === 'value_rating') score += (c.value_rating || 0) * 0.5
        // Overall rating always matters
        score += (c.rating || 0) * 0.3
        return { ...c, _score: score }
      })

      scored.sort((a, b) => b._score - a._score)
      setSuggestions(scored.slice(0, 6).map(normalizeCourse))
      setReason(`Based on your love of ${labels[topPriority]}`)

    } catch (err) {
      console.error('Suggestions error:', err)
    } finally {
      setLoading(false)
    }
  }

  function avg(arr) {
    if (!arr.length) return 0
    return arr.reduce((a, b) => a + b, 0) / arr.length
  }

  function normalizeCourse(c) {
    return {
      id:         c.id,
      name:       c.name,
      location:   c.location,
      state:      c.state,
      par:        c.par,
      holes:      c.holes,
      price:      c.price,
      lat:        c.lat,
      lng:        c.lng,
      desc:       c.description,
      rating:     c.rating     || 0,
      conditions: c.conditions || 0,
      value:      c.value_rating || 0,
      vibes:      c.vibes      || 0,
      reviews:    c.review_count || 0,
      natRank:    c.nat_rank   || 999,
      stRank:     c.st_rank    || 999,
      icon:       c.icon       || '⛳',
      bg:         c.bg_color   || B.navy,
    }
  }

  if (loading || suggestions.length === 0) return null

  return (
    <div style={{ marginTop:32 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div>
          <h2 style={{ fontSize:18, fontWeight:800, color:B.textNavy, fontFamily:serif, margin:'0 0 3px' }}>
            🎯 Suggested For You
          </h2>
          <p style={{ fontSize:12, color:B.textSoft, fontFamily:sans, margin:0 }}>{reason}</p>
        </div>
      </div>

      {/* Course grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(270px, 1fr))', gap:16 }}>
        {suggestions.map(c => (
          <CourseCard key={c.id} course={c} onClick={c => navigate(`/course/${c.id}`)}/>
        ))}
      </div>
    </div>
  )
}