import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

// ─── Top 100 national (default discover load) ───────────────────────────────
export function useTopCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch() }, [])

  async function fetch() {
    setLoading(true)
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('has_seed_rating', true)
      .lt('nat_rank', 101)
      .order('nat_rank', { ascending: true })
    setCourses((data || []).map(normalizeCourse))
    setLoading(false)
  }

  return { courses, loading }
}

// ─── All courses in a state (when state filter selected) ─────────────────────
export function useStateCourses(state) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!state) { setCourses([]); return }
    fetch()
  }, [state])

  async function fetch() {
    setLoading(true)
    const pageSize = 1000
    let all = []
    let page = 0

    while (true) {
      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('has_seed_rating', true)
        .eq('state', state)
        .order('st_rank', { ascending: true })
        .order('id', { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (!data || data.length === 0) break
      all = [...all, ...data]
      if (data.length < pageSize) break
      page++
    }

    setCourses(all.map(normalizeCourse))
    setLoading(false)
  }

  return { courses, loading }
}

// ─── Search as user types ────────────────────────────────────────────────────
export function useCourseSearch(query) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query || query.trim().length < 2) { setResults([]); return }
    const timer = setTimeout(() => search(query.trim()), 300) // debounce
    return () => clearTimeout(timer)
  }, [query])

  async function search(q) {
    setLoading(true)
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('has_seed_rating', true)
      .ilike('name', `%${q}%`)
      .order('nat_rank', { ascending: true })
      .limit(20)
    setResults((data || []).map(normalizeCourse))
    setLoading(false)
  }

  return { results, loading }
}

// ─── Map page — lightweight fields only ──────────────────────────────────────
export function useMapCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch() }, [])

  async function fetch() {
    setLoading(true)
    const pageSize = 1000
    let all = []
    let page = 0

    while (true) {
      const { data } = await supabase
        .from('courses')
        .select('id, name, location, state, lat, lng, nat_rank, st_rank, rating')
        .eq('has_seed_rating', true)
        .not('lat', 'is', null)
        .order('nat_rank', { ascending: true })
        .order('id', { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (!data || data.length === 0) break
      all = [...all, ...data]
      if (data.length < pageSize) break
      page++
    }

    // Deduplicate
    const seen = new Set()
    setCourses(all.filter(c => {
      if (seen.has(c.id)) return false
      seen.add(c.id)
      return true
    }))
    setLoading(false)
  }

  return { courses, loading }
}

// ─── Single course ────────────────────────────────────────────────────────────
export function useCourse(id) {
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (id) fetch() }, [id])

  async function fetch() {
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

// ─── Keep useCourses for any legacy usage ────────────────────────────────────
export function useCourses() {
  return useTopCourses()
}

// ─── Normalize ────────────────────────────────────────────────────────────────
function normalizeCourse(c) {
  return {
    id:           c.id,
    name:         c.name,
    location:     c.location,
    state:        c.state,
    par:          c.par,
    holes:        c.holes,
    price:        c.price,
    lat:          c.lat,
    lng:          c.lng,
    desc:         c.description,
    isLive:       c.is_live_ranked  || false,
    rating:       c.rating          || 0,
    conditions:   c.conditions      || 0,
    value:        c.value_rating    || 0,
    vibes:        c.vibes           || 0,
    reviews:      c.review_count    ?? 0,
    natRank:      c.nat_rank        || 999,
    stRank:       c.st_rank         || 999,
    icon:         c.icon            || '⛳',
    bg:           c.bg_color        || '#1B3054',
    hasSeedRating: c.has_seed_rating || false,
  }
}