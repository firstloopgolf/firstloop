import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { B, serif, sans } from '../lib/data.js'
import { useCourses } from '../hooks/useCourses.js'

const STATES = [
  'AL','AZ','AR','CA','CO','FL','GA','ID','IL','IN',
  'KS','KY','MA','MD','MI','MN','MS','MT','NC','NE',
  'NJ','NV','NY','OH','OK','OR','PA','SC','TN','TX',
  'VA','WI','WV'
]

export default function MapPage() {
  const navigate          = useNavigate()
  const { courses }       = useCourses()
  const mapRef            = useRef(null)
  const mapInstanceRef    = useRef(null)
  const markersRef        = useRef([])
  const [selectedState, setSelectedState]   = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [mapReady, setMapReady]             = useState(false)
  const [filter, setFilter]                 = useState('all')

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      if (!c.lat || !c.lng) return false
      if (selectedState && c.state !== selectedState) return false
      if (filter === 'top100' && c.natRank >= 999) return false
      if (filter === 'rated'  && (!c.rating || c.rating <= 0)) return false
      return true
    })
  }, [courses, selectedState, filter])

  // Load Leaflet dynamically
  useEffect(() => {
    if (mapInstanceRef.current) return

    // Inject Leaflet CSS
    const link = document.createElement('link')
    link.rel  = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
    document.head.appendChild(link)

    // Inject Leaflet JS
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    script.onload = () => {
      if (!mapRef.current || mapInstanceRef.current) return

      const L = window.L

      // Init map centered on USA
      const map = L.map(mapRef.current, {
        center:          [38.5, -96],
        zoom:            4,
        zoomControl:     true,
        scrollWheelZoom: true,
      })

      // OpenStreetMap tiles — free, no API key
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)

      mapInstanceRef.current = map
      setMapReady(true)
    }
    document.head.appendChild(script)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update markers when courses or filters change
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return
    const L   = window.L
    const map = mapInstanceRef.current

    // Clear old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    // Add new markers
    filteredCourses.forEach(course => {
      if (!course.lat || !course.lng) return

      const isNational = course.natRank < 999
      const isTop10    = course.natRank <= 10
      const color      = isTop10 ? '#C4963A' : isNational ? '#1B3054' : '#1E4530'
      const size       = isTop10 ? 14 : isNational ? 11 : 8
      const border     = isTop10 ? '#F0E8D5' : '#ffffff'

      // Custom circle marker
      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            width:${size*2}px;
            height:${size*2}px;
            border-radius:50%;
            background:${color};
            border:2px solid ${border};
            box-shadow:0 2px 6px rgba(0,0,0,0.3);
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:${isTop10 ? 8 : 0}px;
            font-weight:900;
            color:${isTop10 ? '#F0E8D5' : 'transparent'};
            font-family:Georgia,serif;
            cursor:pointer;
          ">${isTop10 ? course.natRank : ''}</div>
        `,
        iconSize:   [size*2, size*2],
        iconAnchor: [size,   size],
      })

      const marker = L.marker([course.lat, course.lng], { icon })

      // Popup content
      const popupContent = `
        <div style="font-family:'DM Sans',sans-serif;min-width:180px;padding:4px 0;">
          <div style="font-weight:700;font-size:13px;color:#1B3054;margin-bottom:3px;line-height:1.3;">${course.name}</div>
          <div style="font-size:11px;color:#7A8FA8;margin-bottom:6px;">📍 ${course.location}</div>
          ${course.natRank < 999 ? `<div style="display:inline-block;background:#F5ECD6;color:#8a6010;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;margin-bottom:6px;">🏅 Natl #${course.natRank}</div>` : ''}
          ${course.rating > 0 ? `<div style="font-size:16px;font-weight:900;color:#C4963A;font-family:Georgia,serif;">★ ${course.rating.toFixed(1)}</div>` : ''}
          <button onclick="window.__firstloopNav('${course.id}')"
            style="margin-top:8px;width:100%;background:#1B3054;color:#F0E8D5;border:none;border-radius:8px;padding:7px 0;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;">
            View Course →
          </button>
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth:  220,
        className: 'firstloop-popup',
      })

      marker.on('click', () => setSelectedCourse(course))
      marker.addTo(map)
      markersRef.current.push(marker)
    })
  }, [mapReady, filteredCourses])

  // Wire up navigation from popup buttons
  useEffect(() => {
    window.__firstloopNav = (id) => navigate(`/course/${id}`)
    return () => { delete window.__firstloopNav }
  }, [navigate])

  // Fly to state when selected
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !selectedState) return
    const stateCourses = filteredCourses.filter(c => c.state === selectedState && c.lat && c.lng)
    if (stateCourses.length === 0) return

    const lats = stateCourses.map(c => c.lat)
    const lngs = stateCourses.map(c => c.lng)
    const bounds = window.L.latLngBounds(
      [Math.min(...lats) - 0.5, Math.min(...lngs) - 0.5],
      [Math.max(...lats) + 0.5, Math.max(...lngs) + 0.5]
    )
    mapInstanceRef.current.flyToBounds(bounds, { padding: [30, 30], duration: 1 })
  }, [selectedState, mapReady])

  // Reset to USA view
  function resetView() {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([38.5, -96], 4, { duration: 1 })
    }
    setSelectedState('')
    setSelectedCourse(null)
  }

  const pillBtn = (active) => ({
    flexShrink:  0,
    padding:     '6px 14px',
    borderRadius: 999,
    border:      `1.5px solid ${active ? B.navy : B.border}`,
    background:  active ? B.navy : B.white,
    color:       active ? B.cream : B.textMid,
    fontWeight:  600,
    cursor:      'pointer',
    fontSize:    12,
    fontFamily:  sans,
    whiteSpace:  'nowrap',
    transition:  'all 0.15s',
  })

  return (
    <div>
      {/* Header */}
      <div style={{ background:B.navy, borderRadius:20, padding:'26px 26px 22px', marginBottom:16, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-50, right:-50, width:180, height:180, borderRadius:'50%', background:'rgba(196,150,58,0.07)' }}/>
        <div style={{ position:'relative' }}>
          <h1 style={{ color:B.cream, margin:'0 0 5px', fontSize:22, fontWeight:900, fontFamily:serif }}>🗺️ Course Map</h1>
          <p style={{ color:'rgba(240,232,213,0.65)', margin:0, fontSize:13, fontFamily:sans }}>
            {filteredCourses.length.toLocaleString()} courses — zoom, pan, and tap any pin
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display:'flex', gap:8, marginBottom:12, overflowX:'auto', paddingBottom:2 }}>
        <button onClick={() => setFilter('all')}    style={pillBtn(filter==='all')}>⛳ All Courses</button>
        <button onClick={() => setFilter('top100')} style={pillBtn(filter==='top100')}>🏅 Top 100</button>
        <button onClick={() => setFilter('rated')}  style={pillBtn(filter==='rated')}>⭐ Rated</button>
        {selectedState && (
          <button onClick={resetView}
            style={{ ...pillBtn(false), background:'#fde8e8', borderColor:'#fca5a5', color:'#c00' }}>
            ✕ Clear {selectedState}
          </button>
        )}
      </div>

      {/* State selector */}
      <div style={{ display:'flex', gap:6, marginBottom:12, overflowX:'auto', paddingBottom:2 }}>
        {STATES.map(s => (
          <button key={s} onClick={() => setSelectedState(s === selectedState ? '' : s)}
            style={{
              flexShrink: 0,
              padding:    '5px 10px',
              borderRadius: 999,
              border:     `1.5px solid ${selectedState===s ? B.gold : B.border}`,
              background: selectedState===s ? B.goldPale : B.white,
              color:      selectedState===s ? '#8a6010' : B.textMid,
              fontWeight: 700,
              cursor:     'pointer',
              fontSize:   11,
              fontFamily: sans,
              transition: 'all 0.12s',
            }}>
            {s}
          </button>
        ))}
      </div>

      {/* Map container */}
      <div style={{ background:B.white, borderRadius:16, overflow:'hidden', border:`1px solid ${B.border}`, marginBottom:16 }}>
        <div ref={mapRef} style={{ height:480, width:'100%' }}/>

        {/* Legend */}
        <div style={{ padding:'10px 14px', display:'flex', alignItems:'center', gap:16, borderTop:`1px solid ${B.border}`, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:14, height:14, borderRadius:'50%', background:B.gold, border:'2px solid #fff' }}/>
            <span style={{ fontSize:11, color:B.textMid, fontFamily:sans }}>Top 10 National</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:11, height:11, borderRadius:'50%', background:B.navy, border:'2px solid #fff' }}/>
            <span style={{ fontSize:11, color:B.textMid, fontFamily:sans }}>Top 100 National</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#1E4530', border:'2px solid #fff' }}/>
            <span style={{ fontSize:11, color:B.textMid, fontFamily:sans }}>All Courses</span>
          </div>
          <button onClick={resetView}
            style={{ marginLeft:'auto', background:B.feedBg, border:`1px solid ${B.border}`, borderRadius:8, padding:'5px 12px', cursor:'pointer', fontSize:11, color:B.textMid, fontFamily:sans }}>
            🇺🇸 Reset View
          </button>
        </div>
      </div>

      {/* Selected course card */}
      {selectedCourse && (
        <div style={{ background:B.white, borderRadius:16, padding:'16px 18px', border:`1px solid ${B.border}`, marginBottom:16, display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:selectedCourse.bg || B.navy, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
            {selectedCourse.icon || '⛳'}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:14, fontWeight:700, color:B.textNavy, fontFamily:serif, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {selectedCourse.name}
            </div>
            <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans }}>
              📍 {selectedCourse.location}
              {selectedCourse.natRank < 999 && ` · 🏅 Natl #${selectedCourse.natRank}`}
            </div>
          </div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            {selectedCourse.rating > 0 && (
              <div style={{ fontSize:20, fontWeight:900, color:B.gold, fontFamily:serif }}>{selectedCourse.rating.toFixed(1)}</div>
            )}
          </div>
          <button onClick={() => navigate(`/course/${selectedCourse.id}`)}
            style={{ background:B.gold, color:B.navy, border:'none', borderRadius:10, padding:'10px 16px', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:sans, flexShrink:0 }}>
            View →
          </button>
          <button onClick={() => setSelectedCourse(null)}
            style={{ background:B.feedBg, color:B.textMid, border:`1px solid ${B.border}`, borderRadius:10, padding:'10px 12px', cursor:'pointer', fontSize:14, fontFamily:sans, flexShrink:0 }}>
            ✕
          </button>
        </div>
      )}

      {/* Inject popup styles */}
      <style>{`
        .firstloop-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          border: 1px solid #E2D9C8;
          box-shadow: 0 8px 24px rgba(27,48,84,0.15);
          padding: 0;
        }
        .firstloop-popup .leaflet-popup-content {
          margin: 14px 16px;
        }
        .firstloop-popup .leaflet-popup-tip {
          background: white;
        }
        .leaflet-control-zoom {
          border: 1px solid #E2D9C8 !important;
          border-radius: 10px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom a {
          color: #1B3054 !important;
          font-weight: 700 !important;
        }
      `}</style>
    </div>
  )
}