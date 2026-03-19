import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { supabase } from '../lib/supabase.js'

// ── State bounding boxes [minLat, minLng, maxLat, maxLng] ─────
const STATE_BOUNDS = {
  AL:[30.2,84.9,35.0,88.5], AK:[51.2,130.0,71.4,180.0], AZ:[31.3,109.0,37.0,114.8],
  AR:[33.0,89.6,36.5,94.6], CA:[32.5,114.1,42.0,124.4], CO:[37.0,102.0,41.0,109.1],
  CT:[41.0,71.8,42.1,73.7], DE:[38.4,75.0,39.8,75.8],   FL:[24.4,80.0,31.0,87.6],
  GA:[30.4,81.0,35.0,85.6], HI:[18.9,154.8,22.2,160.2], ID:[42.0,111.0,49.0,117.2],
  IL:[37.0,87.5,42.5,91.5], IN:[37.8,84.8,41.8,88.1],   IA:[40.4,90.1,43.5,96.6],
  KS:[37.0,94.6,40.0,102.1],KY:[36.5,82.0,39.1,89.6],   LA:[28.9,89.0,33.0,94.0],
  ME:[43.1,67.0,47.5,71.1], MD:[38.0,74.9,39.7,79.5],   MA:[41.2,69.9,42.9,73.5],
  MI:[41.7,82.4,48.3,90.4], MN:[43.5,89.5,49.4,97.2],   MS:[30.2,88.1,35.0,91.7],
  MO:[36.0,89.1,40.6,95.8], MT:[45.0,104.0,49.0,116.0], NE:[40.0,95.3,43.0,104.1],
  NV:[35.0,114.0,42.0,120.0],NH:[42.7,70.7,45.3,72.6],  NJ:[38.9,73.9,41.4,75.6],
  NM:[31.3,103.0,37.0,109.1],NY:[40.5,71.9,45.0,79.8],  NC:[33.8,75.5,36.6,84.3],
  ND:[45.9,97.2,49.0,104.1], OH:[38.4,80.5,41.9,84.8],  OK:[33.6,94.4,37.0,103.0],
  OR:[42.0,116.5,46.2,124.6],PA:[39.7,74.7,42.3,80.5],  RI:[41.1,71.2,42.0,71.9],
  SC:[32.0,78.5,35.2,83.4],  SD:[42.5,96.4,45.9,104.1], TN:[35.0,81.6,36.7,90.3],
  TX:[25.8,94.0,36.5,106.7], UT:[37.0,109.0,42.0,114.1],VT:[43.0,71.5,45.0,73.4],
  VA:[36.5,75.2,39.5,83.7],  WA:[45.5,116.9,49.0,124.7],WV:[37.2,77.7,40.6,82.7],
  WI:[42.5,86.8,47.0,92.9],  WY:[41.0,104.1,45.0,111.1],
}
const STATES = Object.keys(STATE_BOUNDS).sort()

// Zoom thresholds
const ZOOM_STATE = 5   // 4 = national only; 5+ = state ranked
const ZOOM_ALL   = 8   // 8+ = all courses in viewport

export default function MapPage() {
  const { B, serif, sans } = useTheme()
  const navigate       = useNavigate()
  const mapRef         = useRef(null)
  const mapInstance    = useRef(null)
  const clusterGroup   = useRef(null)
  const loadedZone     = useRef(null)

  const [ready,          setReady]          = useState(false)
  const [selectedState,  setSelectedState]  = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [status,         setStatus]         = useState('Loading map…')

  // ── 1. Boot Leaflet + cluster plugin ─────────────────────────
  useEffect(() => {
    if (mapInstance.current) return

    const addCss = (href) => {
      const l = Object.assign(document.createElement('link'), { rel:'stylesheet', href })
      document.head.appendChild(l)
    }
    const addScript = (src) => new Promise(res => {
      const s = Object.assign(document.createElement('script'), { src })
      s.onload = res
      document.head.appendChild(s)
    })

    addCss('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css')
    addCss('https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.Default.min.css')

    addScript('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js')
      .then(() => addScript('https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/leaflet.markercluster.min.js'))
      .then(() => {
        if (!mapRef.current || mapInstance.current) return
        const L = window.L

        const map = L.map(mapRef.current, {
          center: [38.5, -96], zoom: 4,
          zoomControl: true, scrollWheelZoom: true,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors', maxZoom: 18,
        }).addTo(map)

        const cg = L.markerClusterGroup({
          maxClusterRadius: 55,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          iconCreateFunction: (cluster) => {
            const n = cluster.getChildCount()
            const size = n < 10 ? 34 : n < 50 ? 40 : 48
            return L.divIcon({
              html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${B.navy};border:3px solid ${B.gold};color:${B.cream};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:${size<40?11:13}px;font-family:'DM Sans',sans-serif;box-shadow:0 3px 10px rgba(0,0,0,0.3);">${n}</div>`,
              className: '', iconSize: [size,size], iconAnchor: [size/2,size/2],
            })
          },
        })
        map.addLayer(cg)
        clusterGroup.current = cg
        mapInstance.current  = map
        window.__flNav = (id) => navigate(`/course/${id}`)
        setReady(true)
      })

    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null }
      delete window.__flNav
    }
  }, [navigate])

  // ── 2. Data fetcher ───────────────────────────────────────────
  const fetchAndRender = useCallback(async (zone) => {
    if (!mapInstance.current || !clusterGroup.current) return
    if (loadedZone.current === zone) return
    loadedZone.current = zone

    const L  = window.L
    const cg = clusterGroup.current
    cg.clearLayers()

    let query = supabase
      .from('courses')
      .select('id, name, location, state, lat, lng, nat_rank, st_rank, rating')
      .not('lat', 'is', null)
      .not('lng', 'is', null)

    if (zone === 'national') {
      setStatus('National top 100 — zoom in to see more')
      query = query.lt('nat_rank', 200)
    } else if (zone === 'state') {
      setStatus('State + national ranked courses')
      query = query.or('nat_rank.lt.200,st_rank.lt.25')
    } else if (zone.startsWith('b:')) {
      const [,s,w,n,e] = zone.split(':').map(Number)
      setStatus('Loading all courses in view…')
      query = query.gte('lat',s).lte('lat',n).gte('lng',w).lte('lng',e).limit(800)
    }

    const { data, error } = await query
    if (error || !data?.length) { setStatus('No courses found'); return }

    const markers = data.map(course => {
      const isTop10 = course.nat_rank <= 10
      const isNat   = course.nat_rank < 200
      const color   = isTop10 ? B.gold : isNat ? B.navy : B.green
      const size    = isTop10 ? 16 : isNat ? 11 : 8

      const icon = L.divIcon({
        className: '',
        html: `<div style="width:${size*2}px;height:${size*2}px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:${isTop10?9:0}px;font-weight:900;color:#F0E8D5;font-family:Georgia,serif;cursor:pointer;">${isTop10 ? course.nat_rank : ''}</div>`,
        iconSize: [size*2,size*2], iconAnchor: [size,size],
      })

      const popup = `
        <div style="font-family:'DM Sans',sans-serif;min-width:190px;padding:2px 0;">
          <div style="font-weight:700;font-size:13px;color:#1B3054;margin-bottom:3px;line-height:1.35;">${course.name}</div>
          <div style="font-size:11px;color:#7A8FA8;margin-bottom:6px;">📍 ${course.location}</div>
          ${course.nat_rank < 200 ? `<span style="display:inline-block;background:#F5ECD6;color:#8a6010;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;margin-bottom:6px;">🏅 Natl #${course.nat_rank}</span>` : ''}
          ${course.rating > 0 ? `<div style="font-size:17px;font-weight:900;color:#C4963A;font-family:Georgia,serif;margin-bottom:8px;">★ ${Number(course.rating).toFixed(1)}</div>` : ''}
          <button onclick="window.__flNav('${course.id}')" style="width:100%;background:#1B3054;color:#F0E8D5;border:none;border-radius:8px;padding:8px 0;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;">View Course →</button>
        </div>`

      const m = L.marker([course.lat, course.lng], { icon })
      m.bindPopup(popup, { maxWidth: 230, className: 'fl-popup' })
      m.on('click', () => setSelectedCourse(course))
      return m
    })

    cg.addLayers(markers)
    setStatus(`${data.length.toLocaleString()} courses shown — zoom in for more`)
  }, [])

  // ── 3. Zoom / pan listeners ───────────────────────────────────
  useEffect(() => {
    if (!ready || !mapInstance.current) return
    const map = mapInstance.current

    fetchAndRender('national')  // initial load

    const handleZoom = () => {
      const zoom = map.getZoom()
      if (zoom < ZOOM_STATE) {
        fetchAndRender('national')
      } else if (zoom < ZOOM_ALL) {
        fetchAndRender('state')
      }
    }

    const handleMove = () => {
      const zoom = map.getZoom()
      if (zoom >= ZOOM_ALL) {
        const b = map.getBounds()
        const zone = `b:${b.getSouth().toFixed(2)}:${b.getWest().toFixed(2)}:${b.getNorth().toFixed(2)}:${b.getEast().toFixed(2)}`
        // Always re-fetch on pan when zoomed in
        loadedZone.current = null
        fetchAndRender(zone)
      }
    }

    map.on('zoomend', handleZoom)
    map.on('moveend', handleMove)
    return () => { map.off('zoomend', handleZoom); map.off('moveend', handleMove) }
  }, [ready, fetchAndRender])

  // ── 4. Fly to selected state ──────────────────────────────────
  useEffect(() => {
    if (!ready || !mapInstance.current || !selectedState) return
    const b = STATE_BOUNDS[selectedState]
    if (!b) return
    mapInstance.current.flyToBounds([[b[0], -b[1]], [b[2], -b[3]]], { padding:[30,30], duration:0.8 })
  }, [selectedState, ready])

  function resetView() {
    if (mapInstance.current) {
      mapInstance.current.flyTo([38.5,-96], 4, { duration:0.8 })
      loadedZone.current = null
      fetchAndRender('national')
    }
    setSelectedState('')
    setSelectedCourse(null)
  }

  const pill = (active) => ({
    flexShrink:0, padding:'5px 11px', borderRadius:999,
    border:`1.5px solid ${active ? B.navy : B.border}`,
    background: active ? B.navy : B.white,
    color: active ? B.cream : B.textMid,
    fontWeight:600, cursor:'pointer', fontSize:11, fontFamily:sans,
    whiteSpace:'nowrap', transition:'all 0.15s',
  })

  return (
    <div>
      {/* Header */}
      <div style={{ background:B.navy, borderRadius:20, padding:'26px 26px 22px', marginBottom:14, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-50, right:-50, width:180, height:180, borderRadius:'50%', background:'rgba(196,150,58,0.07)' }}/>
        <div style={{ position:'relative' }}>
          <h1 style={{ color:B.cream, margin:'0 0 4px', fontSize:22, fontWeight:900, fontFamily:serif }}>🗺️ Course Map</h1>
          <p style={{ color:'rgba(240,232,213,0.65)', margin:0, fontSize:13, fontFamily:sans }}>{status}</p>
        </div>
      </div>

      {/* State filter */}
      <div style={{ display:'flex', gap:6, marginBottom:12, overflowX:'auto', paddingBottom:4 }}>
        <button onClick={resetView} style={{ ...pill(!selectedState), flexShrink:0 }}>🇺🇸 All</button>
        {STATES.map(s => (
          <button key={s} onClick={() => setSelectedState(s === selectedState ? '' : s)}
            style={{ ...pill(false), borderColor: selectedState===s ? B.gold:B.border, background: selectedState===s ? B.goldPale:B.white, color: selectedState===s ? '#8a6010':B.textMid }}>
            {s}
          </button>
        ))}
      </div>

      {/* Map */}
      <div style={{ background:B.white, borderRadius:16, overflow:'hidden', border:`1px solid ${B.border}`, marginBottom:14 }}>
        <div ref={mapRef} style={{ height:500, width:'100%' }}/>
        <div style={{ padding:'10px 14px', display:'flex', alignItems:'center', gap:14, borderTop:`1px solid ${B.border}`, flexWrap:'wrap' }}>
          <LDot c={B.gold}  l="Top 10 National"/>
          <LDot c={B.navy}  l="Top 100 National"/>
          <LDot c={B.green} l="All Courses"/>
          <span style={{ marginLeft:'auto', fontSize:11, color:B.textSoft, fontFamily:sans }}>Zoom in to reveal more</span>
          <button onClick={resetView} style={{ background:B.feedBg, border:`1px solid ${B.border}`, borderRadius:8, padding:'5px 12px', cursor:'pointer', fontSize:11, color:B.textMid, fontFamily:sans }}>
            Reset View
          </button>
        </div>
      </div>

      {/* Selected course */}
      {selectedCourse && (
        <div style={{ background:B.white, borderRadius:16, padding:'14px 16px', border:`1px solid ${B.gold}`, marginBottom:14, display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:14, fontWeight:700, color:B.textNavy, fontFamily:serif, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{selectedCourse.name}</div>
            <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans, marginTop:2 }}>
              📍 {selectedCourse.location}
              {selectedCourse.nat_rank < 200 && ` · 🏅 Natl #${selectedCourse.nat_rank}`}
            </div>
          </div>
          {selectedCourse.rating > 0 && (
            <div style={{ fontSize:19, fontWeight:900, color:B.gold, fontFamily:serif, flexShrink:0 }}>★ {Number(selectedCourse.rating).toFixed(1)}</div>
          )}
          <button onClick={() => navigate(`/course/${selectedCourse.id}`)}
            style={{ background:B.gold, color:B.navy, border:'none', borderRadius:10, padding:'9px 15px', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:sans, flexShrink:0 }}>
            View →
          </button>
          <button onClick={() => setSelectedCourse(null)}
            style={{ background:B.feedBg, color:B.textMid, border:`1px solid ${B.border}`, borderRadius:10, padding:'9px 11px', cursor:'pointer', fontSize:13, fontFamily:sans, flexShrink:0 }}>
            ✕
          </button>
        </div>
      )}

      <style>{`
        .fl-popup .leaflet-popup-content-wrapper { border-radius:14px; border:1px solid #E2D9C8; box-shadow:0 8px 28px rgba(27,48,84,0.18); padding:0; }
        .fl-popup .leaflet-popup-content { margin:14px 16px; }
        .fl-popup .leaflet-popup-tip { background:white; }
        .leaflet-control-zoom { border:1px solid #E2D9C8 !important; border-radius:10px !important; overflow:hidden; }
        .leaflet-control-zoom a { color:#1B3054 !important; font-weight:700 !important; }
        .marker-cluster-small, .marker-cluster-medium, .marker-cluster-large,
        .marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div { background:transparent !important; }
      `}</style>
    </div>
  )
}

function LDot({ c, l }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <div style={{ width:11, height:11, borderRadius:'50%', background:c, border:'2px solid white', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
      <span style={{ fontSize:11, color:'#4A5E78', fontFamily:"'DM Sans',sans-serif" }}>{l}</span>
    </div>
  )
}