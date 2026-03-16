import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

export function useCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchCourses() }, [])

  async function fetchCourses() {
    setLoading(true)
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('nat_rank', { ascending: true })
    setCourses((data || []).map(normalizeCourse))
    setLoading(false)
  }

  return { courses, loading, refetch: fetchCourses }
}

export function useCourse(id) {
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (id) fetchCourse() }, [id])

  async function fetchCourse() {
    setLoading(true)
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single()
    setCourse(data ? normalizeCourse(data) : null)
    setLoading(false)
  }

  return { course, loading }
}

// Normalize DB row to match the shape the UI expects
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
    isLive: c.is_live_ranked || false,
    rating:     c.rating     || 0,
    conditions: c.conditions || 0,
    value:      c.value_rating || 0,
    vibes:      c.vibes      || 0,
    reviews:    c.review_count || 0,
    natRank:    c.nat_rank   || 99,
    stRank:     c.st_rank    || 99,
    icon:       c.icon       || '⛳',
    bg:         c.bg_color   || '#1B3054',
    hasSeedRating: c.has_seed_rating || false,
  }
}