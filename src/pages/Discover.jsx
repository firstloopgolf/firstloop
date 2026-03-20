import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { CourseCard } from '../components/UI.jsx'
import { useTopCourses, useStateCourses, useCourseSearch } from '../hooks/useCourses.js'
import CourseSuggestions from '../components/CourseSuggestions.jsx'
import FoundingMemberBanner from '../components/FoundingMemberBanner.jsx'

const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
]

export default function Discover() {
  const { B, serif, sans } = useTheme()
  const navigate = useNavigate()

  const [q,           setQ]           = useState('')
  const [state,       setState]       = useState('')
  const [price,       setPrice]       = useState('')
  const [access,      setAccess]      = useState('')
  const [sortBy,      setSortBy]      = useState('rating')
  const [showFilters, setShowFilters] = useState(false)

  // Decide which data source to use
  const isSearching   = q.trim().length >= 2
  const isStateFilter = !!state && !isSearching

  const { courses: topCourses,   loading: loadingTop   } = useTopCourses()
  const { courses: stateCourses, loading: loadingState } = useStateCourses(isStateFilter ? state : null)
  const { results: searchResults, loading: loadingSearch } = useCourseSearch(isSearching ? q : '')

  // Pick the right data source
  const activeCourses = isSearching   ? searchResults
                      : isStateFilter ? stateCourses
                      : topCourses

  const loading = isSearching   ? loadingSearch
                : isStateFilter ? loadingState
                : loadingTop

  const activeFilterCount = [state, price, access].filter(Boolean).length

  const filtered = useMemo(() => {
    let list = [...activeCourses]

    // Client-side filters on top of server results
    if (price)  list = list.filter(c => c.price === price)
    if (access === 'public')  list = list.filter(c => c.price && c.price.length <= 2)
    if (access === 'private') list = list.filter(c => c.price && c.price.length >= 3)

    // State filter client-side only when searching
    if (isSearching && state) list = list.filter(c => c.state === state)

    list.sort((a, b) => {
      if (sortBy === 'rating') {
        const ratingDiff = parseFloat(b.rating || 0) - parseFloat(a.rating || 0)
        if (ratingDiff !== 0) return ratingDiff
        const aNat = a.natRank < 999 ? a.natRank : 9999
        const bNat = b.natRank < 999 ? b.natRank : 9999
        return aNat - bNat
      }
      if (sortBy === 'reviews') return (b.reviews || 0) - (a.reviews || 0)
      if (sortBy === 'name')    return a.name.localeCompare(b.name)
      if (sortBy === 'value')   return parseFloat(b.value || 0) - parseFloat(a.value || 0)
      if (sortBy === 'newest')  return b.id - a.id
      return 0
    })

    return list
  }, [activeCourses, q, state, price, access, sortBy, isSearching])

  function clearFilters() {
    setState('')
    setPrice('')
    setAccess('')
    setSortBy('rating')
    setQ('')
  }

  const pillBtn = (active) => ({
    flexShrink: 0,
    padding: '7px 14px',
    borderRadius: 999,
    border: `1.5px solid ${active ? B.navy : B.border}`,
    background: active ? B.navy : B.white,
    color: active ? B.cream : B.textMid,
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: sans,
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  })

  const selectStyle = {
    padding: '9px 12px',
    borderRadius: 10,
    border: `1.5px solid ${B.border}`,
    background: B.white,
    color: B.textNavy,
    fontFamily: sans,
    fontSize: 13,
    fontWeight: 500,
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
  }

  const headerLabel = isSearching   ? `${filtered.length.toLocaleString()} results for "${q}"`
                    : isStateFilter ? `${filtered.length.toLocaleString()} courses in ${state}`
                    : 'Top 100 National'

  return (
    <div>
      {/* Hero Banner */}
      <div style={{ background: B.navy, borderRadius: 20, padding: '30px 26px 26px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(196,150,58,0.07)' }}/>
        <div style={{ position: 'relative' }}>
          <h1 style={{ color: B.cream, fontSize: 26, fontWeight: 900, margin: '0 0 8px', fontFamily: serif, lineHeight: 1.2 }}>
            Find Your Next<br/><span style={{ color: B.gold }}>Great Round</span>
          </h1>
          <p style={{ color: 'rgba(240,232,213,0.65)', margin: '0 0 16px', fontSize: 13, fontFamily: sans, lineHeight: 1.65 }}>
            9,000+ courses across all 50 states — rated by real golfers.
          </p>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>🔍</span>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search by course name, city, or state..."
              style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: 12, border: 'none', fontSize: 14, background: 'rgba(240,232,213,0.12)', color: B.cream, outline: 'none', boxSizing: 'border-box', fontFamily: sans }}
            />
            {q && (
              <button onClick={() => setQ('')}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(240,232,213,0.5)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <FoundingMemberBanner variant="compact" />

      {/* Filter toggle bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
        <button onClick={() => setShowFilters(!showFilters)}
          style={{ ...pillBtn(showFilters || activeFilterCount > 0), display: 'flex', alignItems: 'center', gap: 6 }}>
          ⚙️ Filters {activeFilterCount > 0 && (
            <span style={{ background: B.gold, color: B.navy, borderRadius: 999, width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
              {activeFilterCount}
            </span>
          )}
        </button>

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
          {[['rating','⭐ Top Rated'],['reviews','🔥 Most Reviewed'],['value','💰 Best Value'],['name','🔤 A-Z'],['newest','🆕 Newest']].map(([v, label]) => (
            <button key={v} onClick={() => setSortBy(v)} style={pillBtn(sortBy === v)}>{label}</button>
          ))}
        </div>

        {activeFilterCount > 0 && (
          <button onClick={clearFilters}
            style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 999, border: '1.5px solid #fde8e8', background: '#fde8e8', color: '#c00', fontWeight: 600, cursor: 'pointer', fontSize: 12, fontFamily: sans, whiteSpace: 'nowrap' }}>
            Clear all
          </button>
        )}
      </div>

      {/* Expanded filter panel */}
      {showFilters && (
        <div style={{ background: B.white, borderRadius: 16, padding: '18px', marginBottom: 18, border: `1px solid ${B.border}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: B.textMid, fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>State</label>
              <select value={state} onChange={e => setState(e.target.value)} style={selectStyle}>
                <option value="">All States</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: B.textMid, fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Price Range</label>
              <select value={price} onChange={e => setPrice(e.target.value)} style={selectStyle}>
                <option value="">Any Price</option>
                <option value="$">$ — Budget</option>
                <option value="$$">$$ — Moderate</option>
                <option value="$$$">$$$ — Premium</option>
                <option value="$$$$">$$$$ — Luxury</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: B.textMid, fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Access</label>
              <select value={access} onChange={e => setAccess(e.target.value)} style={selectStyle}>
                <option value="">All Courses</option>
                <option value="public">Public Only</option>
                <option value="private">Private / Semi</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: B.textMid, fontFamily: sans, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sort By</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
                <option value="rating">Top Rated</option>
                <option value="reviews">Most Reviewed</option>
                <option value="value">Best Value</option>
                <option value="name">A-Z</option>
                <option value="newest">Newest Added</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: B.textNavy, fontFamily: serif }}>
          {loading ? 'Loading...' : headerLabel}
        </span>
        {isSearching && q.trim().length < 2 && (
          <span style={{ fontSize: 12, color: B.textSoft, fontFamily: sans }}>Type at least 2 characters to search</span>
        )}
      </div>

      {/* Course grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16 }}>
          {[...Array(6)].map((_,i) => (
            <div key={i} style={{ background: B.white, borderRadius: 16, height: 280, border: `1px solid ${B.border}`, opacity: 0.5 }}/>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: B.white, borderRadius: 16, border: `1px solid ${B.border}` }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: B.textNavy, fontFamily: serif, marginBottom: 8 }}>No courses found</div>
          <div style={{ fontSize: 13, color: B.textSoft, fontFamily: sans, marginBottom: 20 }}>Try adjusting your search or filters</div>
          <button onClick={clearFilters}
            style={{ background: B.gold, color: B.navy, border: 'none', borderRadius: 12, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontFamily: serif }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16 }}>
          {filtered.map(c => (
            <CourseCard key={c.id} course={c} onClick={c => navigate(`/course/${c.id}`)}/>
          ))}
        </div>
      )}

      {!q && activeFilterCount === 0 && <CourseSuggestions />}
    </div>
  )
}