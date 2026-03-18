import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { B, serif, sans } from '../lib/data.js'

export default function RoundComments({ roundId, initialCount = 0 }) {
  const { user, profile } = useAuth()
  const navigate          = useNavigate()
  const inputRef          = useRef(null)

  const [open,     setOpen]     = useState(false)
  const [comments, setComments] = useState([])
  const [count,    setCount]    = useState(initialCount)
  const [loading,  setLoading]  = useState(false)
  const [text,     setText]     = useState('')
  const [posting,  setPosting]  = useState(false)

  // Load comments when opened
  useEffect(() => {
    if (!open) return
    fetchComments()
  }, [open])

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  async function fetchComments() {
    setLoading(true)
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username, full_name)')
      .eq('round_id', roundId)
      .order('created_at', { ascending: true })
    setComments(data || [])
    setCount(data?.length || 0)
    setLoading(false)
  }

  async function postComment(e) {
    e.preventDefault()
    if (!text.trim()) return
    if (!user) { navigate('/auth'); return }
    setPosting(true)
    const { data, error } = await supabase.from('comments').insert({
      user_id:  user.id,
      round_id: roundId,
      content:  text.trim(),
    }).select('*, profiles(username, full_name)').single()

    if (!error && data) {
      setComments(prev => [...prev, data])
      setCount(c => c + 1)
      setText('')
    }
    setPosting(false)
  }

  const toggleButton = (
    <button
      onClick={() => setOpen(o => !o)}
      style={{
        background: 'none',
        border: `1px solid ${open ? B.navy : B.border}`,
        borderRadius: 999, padding: '5px 12px',
        cursor: 'pointer', fontSize: 12,
        color: open ? B.navy : B.textSoft,
        fontFamily: sans, fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: 5,
        transition: 'all 0.15s',
      }}
    >
      💬 {count > 0 ? count : ''} {count === 1 ? 'comment' : 'comments'}
    </button>
  )

  if (!open) return toggleButton

  return (
    <div>
      {toggleButton}

      <div style={{
        marginTop: 12, borderTop: `1px solid ${B.feedBg}`,
        paddingTop: 12,
      }}>

        {/* Comment list */}
        {loading ? (
          <div style={{ fontFamily: sans, fontSize: 12, color: B.textSoft, padding: '8px 0' }}>
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div style={{ fontFamily: sans, fontSize: 12, color: B.textSoft, padding: '4px 0 10px', fontStyle: 'italic' }}>
            No comments yet — be the first
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
            {comments.map(c => {
              const name = c.profiles?.full_name || c.profiles?.username || 'Golfer'
              const initials = name.slice(0, 2).toUpperCase()
              const isOwn = c.user_id === user?.id
              return (
                <div key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  {/* Avatar */}
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: isOwn ? B.gold : B.navy,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: serif, fontSize: 10, fontWeight: 900,
                    color: isOwn ? B.navy : B.cream, flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                  {/* Bubble */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      background: B.feedBg, borderRadius: '0 12px 12px 12px',
                      padding: '8px 12px', border: `1px solid ${B.border}`,
                    }}>
                      <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: B.textNavy, marginBottom: 3 }}>
                        {name}
                      </div>
                      <div style={{ fontFamily: sans, fontSize: 13, color: B.textNavy, lineHeight: 1.5 }}>
                        {c.content}
                      </div>
                    </div>
                    <div style={{ fontFamily: sans, fontSize: 10, color: B.textSoft, marginTop: 3, paddingLeft: 2 }}>
                      {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Comment input */}
        {user ? (
          <form onSubmit={postComment} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Own avatar */}
            <div style={{
              width: 28, height: 28, borderRadius: '50%', background: B.gold,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: serif, fontSize: 10, fontWeight: 900, color: B.navy, flexShrink: 0,
            }}>
              {(profile?.full_name || profile?.username || 'G').slice(0, 2).toUpperCase()}
            </div>
            <input
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Add a comment..."
              maxLength={280}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 20,
                border: `1px solid ${B.border}`, fontSize: 13,
                fontFamily: sans, color: B.textNavy, outline: 'none',
                background: '#fff',
              }}
            />
            <button
              type="submit"
              disabled={posting || !text.trim()}
              style={{
                background: posting || !text.trim() ? B.border : B.navy,
                color: B.cream, border: 'none', borderRadius: 20,
                padding: '8px 14px', fontWeight: 700, fontSize: 12,
                cursor: posting || !text.trim() ? 'not-allowed' : 'pointer',
                fontFamily: sans, flexShrink: 0, transition: 'all 0.15s',
              }}
            >
              {posting ? '...' : 'Post'}
            </button>
          </form>
        ) : (
          <button
            onClick={() => navigate('/auth')}
            style={{
              width: '100%', background: 'none',
              border: `1px solid ${B.border}`, borderRadius: 10,
              padding: '9px 0', fontFamily: sans, fontSize: 12,
              color: B.textMid, cursor: 'pointer', fontWeight: 600,
            }}
          >
            Sign in to comment
          </button>
        )}
      </div>
    </div>
  )
}
