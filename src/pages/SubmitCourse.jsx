import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { B, serif, sans } from '../lib/data.js'
import { PageBanner } from '../components/UI.jsx'

const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
]

export default function SubmitCourse() {
  const navigate      = useNavigate()
  const { user }      = useAuth()
  const [step, setStep] = useState('form') // form | success

  const [name,     setName]     = useState('')
  const [city,     setCity]     = useState('')
  const [state,    setState]    = useState('')
  const [par,      setPar]      = useState('')
  const [holes,    setHoles]    = useState('18')
  const [price,    setPrice]    = useState('')
  const [access,   setAccess]   = useState('')
  const [website,  setWebsite]  = useState('')
  const [notes,    setNotes]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const inputStyle = {
    width:'100%', padding:'11px 13px', borderRadius:10,
    border:`1px solid ${B.border}`, fontSize:14, fontFamily:sans,
    color:B.textNavy, outline:'none', background:'#fff',
    boxSizing:'border-box',
  }

  const selectStyle = { ...inputStyle, cursor:'pointer' }

  const labelStyle = {
    fontSize:11, fontWeight:700, color:B.textMid, fontFamily:sans,
    display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em'
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name || !city || !state) {
      setError('Course name, city, and state are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Check if course already exists
      const { data: existing } = await supabase
        .from('courses')
        .select('id, name')
        .ilike('name', name.trim())
        .eq('state', state)
        .limit(1)

      if (existing && existing.length > 0) {
        setError(`This course already exists in our database as "${existing[0].name}"`)
        setLoading(false)
        return
      }

      // Insert into a submissions table for review
      const { error: err } = await supabase
        .from('course_submissions')
        .insert({
          submitted_by: user?.id || null,
          name:         name.trim(),
          city:         city.trim(),
          state,
          par:          par ? parseInt(par) : null,
          holes:        holes ? parseInt(holes) : 18,
          price:        price || null,
          access_type:  access || null,
          website:      website.trim() || null,
          notes:        notes.trim() || null,
          status:       'pending',
        })

      if (err) throw err
      setStep('success')

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') return (
    <div style={{ maxWidth:480, margin:'0 auto', textAlign:'center', padding:'60px 20px' }}>
      <div style={{ width:72, height:72, borderRadius:'50%', background:'#e8f5e9', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={B.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2 style={{ fontFamily:serif, fontSize:24, fontWeight:900, color:B.textNavy, margin:'0 0 12px' }}>Course Submitted!</h2>
      <p style={{ fontFamily:sans, fontSize:14, color:B.textSoft, lineHeight:1.7, margin:'0 0 8px' }}>
        Thanks for submitting <strong style={{ color:B.textNavy }}>{name}</strong>.
      </p>
      <p style={{ fontFamily:sans, fontSize:13, color:B.textSoft, lineHeight:1.7, margin:'0 0 32px' }}>
        Our team will review and add it to the database within 48 hours. You'll be able to log a round there once it's approved.
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <button onClick={() => navigate('/')}
          style={{ width:'100%', background:B.gold, color:B.navy, border:'none', borderRadius:12, padding:'13px 0', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:serif }}>
          Back to Discover
        </button>
        <button onClick={() => { setStep('form'); setName(''); setCity(''); setState(''); setPar(''); setPrice(''); setAccess(''); setWebsite(''); setNotes('') }}
          style={{ width:'100%', background:B.white, color:B.textMid, border:`1px solid ${B.border}`, borderRadius:12, padding:'12px 0', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:sans }}>
          Submit Another Course
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth:580, margin:'0 auto' }}>
      <PageBanner icon="⛳" title="Submit a Course" subtitle="Can't find a course? Add it to the First Loop database." bg={B.green}/>

      <div style={{ background:B.white, borderRadius:16, padding:24, border:`1px solid ${B.border}` }}>

        {error && (
          <div style={{ background:'#fde8e8', color:'#c00', borderRadius:8, padding:'10px 14px', fontSize:13, fontFamily:sans, marginBottom:16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Required fields */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:B.navy, fontFamily:sans, marginBottom:14, textTransform:'uppercase', letterSpacing:'0.06em', paddingBottom:8, borderBottom:`1px solid ${B.feedBg}` }}>
              Required Info
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Course Name *</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Pebble Beach Golf Links" required style={inputStyle}/>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              <div>
                <label style={labelStyle}>City *</label>
                <input value={city} onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Pebble Beach" required style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>State *</label>
                <select value={state} onChange={e => setState(e.target.value)} required style={selectStyle}>
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Optional fields */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:B.navy, fontFamily:sans, marginBottom:14, textTransform:'uppercase', letterSpacing:'0.06em', paddingBottom:8, borderBottom:`1px solid ${B.feedBg}` }}>
              Additional Details <span style={{ color:B.textSoft, fontWeight:400, textTransform:'none', letterSpacing:0 }}>(optional but helpful)</span>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              <div>
                <label style={labelStyle}>Par</label>
                <select value={par} onChange={e => setPar(e.target.value)} style={selectStyle}>
                  <option value="">Unknown</option>
                  <option value="70">70</option>
                  <option value="71">71</option>
                  <option value="72">72</option>
                  <option value="73">73</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Holes</label>
                <select value={holes} onChange={e => setHoles(e.target.value)} style={selectStyle}>
                  <option value="18">18 Holes</option>
                  <option value="9">9 Holes</option>
                  <option value="27">27 Holes</option>
                  <option value="36">36 Holes</option>
                </select>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              <div>
                <label style={labelStyle}>Price Range</label>
                <select value={price} onChange={e => setPrice(e.target.value)} style={selectStyle}>
                  <option value="">Unknown</option>
                  <option value="$">$ — Under $40</option>
                  <option value="$$">$$ — $40–$80</option>
                  <option value="$$$">$$$ — $80–$150</option>
                  <option value="$$$$">$$$$ — $150+</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Access</label>
                <select value={access} onChange={e => setAccess(e.target.value)} style={selectStyle}>
                  <option value="">Unknown</option>
                  <option value="public">Public</option>
                  <option value="semi">Semi-Private</option>
                  <option value="private">Private</option>
                  <option value="resort">Resort</option>
                  <option value="military">Military</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Course Website</label>
              <input value={website} onChange={e => setWebsite(e.target.value)}
                placeholder="https://www.coursename.com" type="url" style={inputStyle}/>
            </div>

            <div>
              <label style={labelStyle}>Additional Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Anything else we should know? e.g. recently renovated, Topgolf, driving range only, etc."
                rows={3} style={{ ...inputStyle, resize:'vertical', lineHeight:1.6 }}/>
            </div>
          </div>

          <button type="submit" disabled={loading || !name || !city || !state}
            style={{ width:'100%', background: (!name || !city || !state) ? B.border : loading ? B.border : B.gold, color:B.navy, border:'none', borderRadius:12, padding:'14px 0', fontWeight:800, fontSize:15, cursor: (!name || !city || !state) ? 'not-allowed' : loading ? 'not-allowed' : 'pointer', fontFamily:serif, transition:'all 0.15s' }}>
            {loading ? 'Submitting...' : 'Submit Course ⛳'}
          </button>

        </form>
      </div>

      <div style={{ background:B.feedBg, borderRadius:12, padding:'14px 16px', marginTop:16, border:`1px solid ${B.border}` }}>
        <div style={{ fontSize:12, fontWeight:700, color:B.textNavy, fontFamily:sans, marginBottom:4 }}>📋 Review Process</div>
        <div style={{ fontSize:12, color:B.textSoft, fontFamily:sans, lineHeight:1.6 }}>
          Submissions are reviewed within 48 hours. We verify the course exists, add coordinates, and publish it to the database. You'll be able to log a round once it's approved.
        </div>
      </div>
    </div>
  )
}