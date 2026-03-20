import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { PageBanner } from '../components/UI.jsx'

export default function Admin() {
  const { B, serif, sans } = useTheme()
  const navigate          = useNavigate()
  const { user, isAdmin } = useAuth()

  const [tab, setTab]               = useState('submissions')
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [actionMsg, setActionMsg]   = useState('')

  useEffect(() => {
    if (!user) { navigate('/auth'); return }
    if (!isAdmin) { navigate('/'); return }
    fetchAll()
  }, [user, isAdmin])

  async function fetchAll() {
    setLoading(true)
    await Promise.all([fetchSubmissions(), fetchStats()])
    setLoading(false)
  }

  async function fetchSubmissions() {
    const { data } = await supabase
      .from('course_submissions')
      .select('*')
      .order('created_at', { ascending: false })
    setSubmissions(data || [])
  }

  async function fetchStats() {
    const [courses, rounds, profiles, pending] = await Promise.all([
      supabase.from('courses').select('id', { count:'exact', head:true }),
      supabase.from('rounds').select('id', { count:'exact', head:true }),
      supabase.from('profiles').select('id', { count:'exact', head:true }),
      supabase.from('course_submissions').select('id', { count:'exact', head:true }).eq('status','pending'),
    ])
    setStats({
      courses:  courses.count  || 0,
      rounds:   rounds.count   || 0,
      users:    profiles.count || 0,
      pending:  pending.count  || 0,
    })
  }

  async function approveSubmission(sub) {
    setActionMsg('')
    try {
      // Check not already in DB
      const { data: existing } = await supabase
        .from('courses')
        .select('id')
        .ilike('name', sub.name)
        .eq('state', sub.state)
        .limit(1)

      if (existing && existing.length > 0) {
        await supabase.from('course_submissions').update({ status:'duplicate' }).eq('id', sub.id)
        setActionMsg(`⚠️ "${sub.name}" already exists in the database — marked as duplicate`)
        fetchSubmissions()
        return
      }

      // Insert into courses
      const { error } = await supabase.from('courses').insert({
        name:         sub.name,
        location:     `${sub.city}, ${sub.state}`,
        state:        sub.state,
        par:          sub.par || 72,
        holes:        sub.holes || 18,
        price:        sub.price || null,
        description:  sub.notes || null,
        nat_rank:     999,
        st_rank:      999,
        rating:       0,
        conditions:   0,
        value_rating: 0,
        vibes:        0,
        review_count: 0,
        icon:         '⛳',
        bg_color:     '#1B3054',
      })

      if (error) throw error

      // Mark submission as approved
      await supabase.from('course_submissions').update({ status:'approved' }).eq('id', sub.id)
      setActionMsg(`✅ "${sub.name}" approved and added to the database!`)
      fetchAll()

    } catch (err) {
      setActionMsg(`❌ Error: ${err.message}`)
    }
  }

  async function rejectSubmission(sub) {
    await supabase.from('course_submissions').update({ status:'rejected' }).eq('id', sub.id)
    setActionMsg(`🗑️ "${sub.name}" rejected`)
    fetchSubmissions()
  }

  async function deleteSubmission(id) {
    await supabase.from('course_submissions').delete().eq('id', id)
    fetchSubmissions()
  }

  const pending  = submissions.filter(s => s.status === 'pending')
  const reviewed = submissions.filter(s => s.status !== 'pending')

  const statusColor = (s) => {
    if (s === 'approved')  return { bg:'#e8f5e9', color:B.green }
    if (s === 'rejected')  return { bg:'#fde8e8', color:'#c00' }
    if (s === 'duplicate') return { bg:B.goldPale, color:'#8a6010' }
    return { bg:B.feedBg, color:B.textMid }
  }

  if (loading) return (
    <div style={{ textAlign:'center', padding:'60px 0', fontFamily:sans, color:B.textSoft }}>
      <div style={{ fontSize:48, marginBottom:16 }}>⛳</div>
      <div>Loading admin dashboard...</div>
    </div>
  )

  return (
    <div>
      <PageBanner icon="⚙️" title="Admin Dashboard" subtitle="Manage courses, submissions & platform stats" bg={B.navyDark || B.navy}/>

      {/* Stats */}
      {stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
          {[
            ['🏌️', stats.courses.toLocaleString(),  'Total Courses'],
            ['👤', stats.users.toLocaleString(),    'Users'],
            ['⛳', stats.rounds.toLocaleString(),   'Rounds Logged'],
            ['📋', stats.pending.toLocaleString(),  'Pending Submissions'],
          ].map(([icon, num, label]) => (
            <div key={label} style={{ background:B.white, borderRadius:14, padding:'16px 12px', textAlign:'center', border:`1px solid ${B.border}` }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
              <div style={{ fontSize:22, fontWeight:900, color:B.navy, fontFamily:serif }}>{num}</div>
              <div style={{ fontSize:10, color:B.textSoft, fontFamily:sans, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em', lineHeight:1.3 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Action message */}
      {actionMsg && (
        <div style={{ background: actionMsg.startsWith('✅') ? '#e8f5e9' : actionMsg.startsWith('⚠️') ? B.goldPale : '#fde8e8', borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:13, fontFamily:sans, color:B.textNavy, border:`1px solid ${B.border}` }}>
          {actionMsg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', background:B.white, borderRadius:12, padding:4, border:`1px solid ${B.border}`, marginBottom:18, gap:4 }}>
        {[
          ['submissions', `📋 Pending (${pending.length})`],
          ['reviewed',    `✅ Reviewed (${reviewed.length})`],
        ].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)}
            style={{ flex:1, padding:'9px 0', borderRadius:9, border:'none', background:tab===v ? B.navy:'transparent', color:tab===v ? B.cream:B.textMid, fontWeight:600, cursor:'pointer', fontSize:13, fontFamily:sans, transition:'all 0.15s' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Pending submissions */}
      {tab === 'submissions' && (
        <div>
          {pending.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', background:B.white, borderRadius:16, border:`1px solid ${B.border}` }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🎉</div>
              <div style={{ fontSize:16, fontWeight:700, color:B.textNavy, fontFamily:serif, marginBottom:6 }}>All caught up!</div>
              <div style={{ fontSize:13, color:B.textSoft, fontFamily:sans }}>No pending course submissions</div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {pending.map(sub => (
                <div key={sub.id} style={{ background:B.white, borderRadius:16, padding:'18px 20px', border:`1px solid ${B.border}` }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                    <div>
                      <div style={{ fontSize:16, fontWeight:800, color:B.textNavy, fontFamily:serif }}>{sub.name}</div>
                      <div style={{ fontSize:13, color:B.textMid, fontFamily:sans, marginTop:2 }}>📍 {sub.city}, {sub.state}</div>
                    </div>
                    <div style={{ fontSize:11, color:B.textSoft, fontFamily:sans, flexShrink:0, marginLeft:12 }}>
                      {new Date(sub.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                    </div>
                  </div>

                  {/* Submission details */}
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
                    {sub.par        && <span style={{ background:B.feedBg, borderRadius:999, padding:'3px 10px', fontSize:12, fontFamily:sans, color:B.textMid }}>Par {sub.par}</span>}
                    {sub.holes      && <span style={{ background:B.feedBg, borderRadius:999, padding:'3px 10px', fontSize:12, fontFamily:sans, color:B.textMid }}>{sub.holes} holes</span>}
                    {sub.price      && <span style={{ background:B.feedBg, borderRadius:999, padding:'3px 10px', fontSize:12, fontFamily:sans, color:B.textMid }}>{sub.price}</span>}
                    {sub.access_type && <span style={{ background:B.feedBg, borderRadius:999, padding:'3px 10px', fontSize:12, fontFamily:sans, color:B.textMid }}>{sub.access_type}</span>}
                  </div>

                  {sub.website && (
                    <div style={{ fontSize:12, color:B.navy, fontFamily:sans, marginBottom:8 }}>
                      🔗 <a href={sub.website} target="_blank" rel="noopener noreferrer" style={{ color:B.navy }}>{sub.website}</a>
                    </div>
                  )}

                  {sub.notes && (
                    <div style={{ background:B.feedBg, borderRadius:10, padding:'8px 12px', marginBottom:12, fontSize:12, color:B.textMid, fontFamily:sans, fontStyle:'italic' }}>
                      "{sub.notes}"
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    <button onClick={() => approveSubmission(sub)}
                      style={{ background:B.green, color:'#fff', border:'none', borderRadius:10, padding:'10px 0', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:sans }}>
                      ✅ Approve & Add
                    </button>
                    <button onClick={() => rejectSubmission(sub)}
                      style={{ background:B.white, color:'#c00', border:'1px solid #fca5a5', borderRadius:10, padding:'10px 0', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:sans }}>
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviewed submissions */}
      {tab === 'reviewed' && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {reviewed.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', background:B.white, borderRadius:16, border:`1px solid ${B.border}` }}>
              <div style={{ fontSize:13, color:B.textSoft, fontFamily:sans }}>No reviewed submissions yet</div>
            </div>
          ) : reviewed.map(sub => (
            <div key={sub.id} style={{ background:B.white, borderRadius:14, padding:'14px 16px', border:`1px solid ${B.border}`, display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:600, color:B.textNavy, fontFamily:sans, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{sub.name}</div>
                <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans }}>{sub.city}, {sub.state}</div>
              </div>
              <span style={{ ...statusColor(sub.status), padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, fontFamily:sans, flexShrink:0 }}>
                {sub.status}
              </span>
              <button onClick={() => deleteSubmission(sub.id)}
                style={{ background:'none', border:'none', color:B.textSoft, cursor:'pointer', fontSize:16, padding:0, flexShrink:0 }}>
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}